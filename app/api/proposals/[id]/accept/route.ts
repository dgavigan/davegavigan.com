import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendProposalAcceptedToClient, sendProposalAcceptedToAdmin } from '@/lib/email'

// POST /api/proposals/[id]/accept - Accept a proposal with signature
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { signatureDataUrl } = body

  if (!signatureDataUrl) {
    return NextResponse.json({ error: 'Signature required' }, { status: 400 })
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: {
            include: {
              members: {
                where: { userId: session.user.id },
                select: { role: true },
              },
              owner: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  })

  if (!proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  // Check if user is owner of the client (only owners can accept)
  const isAdmin = session.user.role === 'admin'
  const membership = proposal.project.client.members[0]
  const isOwner = membership?.role === 'owner' || proposal.project.client.owner?.id === session.user.id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Only project owners can accept proposals' }, { status: 403 })
  }

  // Check if already accepted
  if (proposal.status === 'accepted') {
    return NextResponse.json({ error: 'Proposal already accepted' }, { status: 400 })
  }

  // Check if expired
  if (proposal.validUntil && new Date(proposal.validUntil) < new Date()) {
    return NextResponse.json({ error: 'Proposal has expired' }, { status: 400 })
  }

  // Build signature data
  const signatureData = {
    name: session.user.name || session.user.email,
    email: session.user.email,
    dataUrl: signatureDataUrl,
    timestamp: new Date().toISOString(),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
  }

  // Accept the proposal with signature
  const acceptedAt = new Date()
  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      status: 'accepted',
      acceptedAt,
      signature: JSON.stringify(signatureData),
    },
  })

  // Update project status to active
  await prisma.project.update({
    where: { id: proposal.projectId },
    data: { status: 'active' },
  })

  // Create activity record
  await prisma.activity.create({
    data: {
      type: 'milestone',
      title: 'Proposal Accepted ✍️',
      body: `${session.user.name || session.user.email} signed and accepted the proposal "${proposal.title}"`,
      projectId: proposal.projectId,
      userId: session.user.id,
    },
  })

  // Email client with confirmation
  if (session.user.email) {
    await sendProposalAcceptedToClient(
      session.user.email,
      session.user.name || 'there',
      proposal.title,
      proposal.totalPrice
    )
  }

  // Notify admin (Dave)
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (admin?.email) {
    await sendProposalAcceptedToAdmin(
      admin.email,
      session.user.name || session.user.email || 'Client',
      session.user.email || '',
      proposal.title,
      proposal.project.client.name,
      proposal.totalPrice
    )
  }

  return NextResponse.json({
    success: true,
    proposal: updated,
    pdfUrl: `/api/proposals/${id}/pdf`,
  })
}
