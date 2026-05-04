import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateProposalHtml } from '@/lib/pdf'

// GET /api/proposals/[id]/pdf - Generate PDF (signed or unsigned) for any user
// with access to this proposal's client.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const download = req.nextUrl.searchParams.get('download') === 'true'

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: {
            include: {
              users: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isAdmin = session.user.role === 'admin'
  const isClientUser = proposal.project.client.users.some(u => u.id === session.user.id)
  if (!isAdmin && !isClientUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const content = proposal.content ? JSON.parse(proposal.content) : {}
  const signature = proposal.signature ? JSON.parse(proposal.signature) : null

  const html = generateProposalHtml({
    title: proposal.title,
    clientName: proposal.project.client.name,
    summary: proposal.summary,
    totalPrice: proposal.totalPrice,
    status: proposal.status,
    createdAt: proposal.createdAt.toISOString(),
    acceptedAt: proposal.acceptedAt?.toISOString() || null,
    signerName: signature?.name || null,
    signerEmail: signature?.email || null,
    signatureDataUrl: signature?.dataUrl || null,
    content,
  })

  // Add print-friendly CSS and auto-print script for PDF generation
  const printableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${proposal.title} - Signed Proposal</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0.5in; }
        }
      </style>
    </head>
    <body>
      ${html.replace(/<html>|<\/html>|<head>.*?<\/head>|<body>|<\/body>|<!DOCTYPE html>/g, '')}
      ${download ? `
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      ` : ''}
    </body>
    </html>
  `

  const fileSuffix = proposal.status === 'accepted' ? 'signed' : proposal.status
  const filename = `${proposal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${fileSuffix}.html`

  return new NextResponse(printableHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...(download ? {
        'Content-Disposition': `attachment; filename="${filename}"`,
      } : {}),
    },
  })
}
