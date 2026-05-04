import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/proposals/[id]/comments - Get comments for current revision
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: { revision: true },
  })

  if (!proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  // Get comments for current revision only
  const comments = await prisma.proposalComment.findMany({
    where: {
      proposalId: id,
      revision: proposal.revision,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments.map(c => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    user: c.user,
  })))
}

// POST /api/proposals/[id]/comments - Add a comment to a proposal
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { text } = body

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Comment text required' }, { status: 400 })
  }

  // Get proposal and verify access
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: {
            include: { users: { select: { id: true } } },
          },
        },
      },
    },
  })

  if (!proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  // Check access
  const isAdmin = session.user.role === 'admin'
  const isClientUser = proposal.project.client.users.some(u => u.id === session.user.id)

  if (!isAdmin && !isClientUser) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Create comment on current revision
  const comment = await prisma.proposalComment.create({
    data: {
      text: text.trim(),
      revision: proposal.revision,
      proposalId: id,
      userId: session.user.id,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  })

  return NextResponse.json({
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt,
    user: comment.user,
  })
}
