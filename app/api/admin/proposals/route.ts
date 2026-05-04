import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/proposals - List all proposals
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const proposals = await prisma.proposal.findMany({
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(proposals)
}

// POST /api/admin/proposals - Create a new proposal
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, summary, projectId, totalPrice, validUntil, content } = body

  if (!title || !projectId || !totalPrice) {
    return NextResponse.json({ error: 'Title, projectId, and totalPrice are required' }, { status: 400 })
  }

  const proposal = await prisma.proposal.create({
    data: {
      title,
      summary,
      projectId,
      totalPrice: Math.round(totalPrice * 100), // Convert to cents
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      content: typeof content === 'string' ? content : JSON.stringify(content),
      status: 'pending',
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  })

  return NextResponse.json(proposal)
}
