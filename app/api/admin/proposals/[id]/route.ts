import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/proposals/[id] - Get proposal for editing
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(proposal)
}

// PATCH /api/admin/proposals/[id] - Update proposal (creates new revision)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { title, summary, totalPrice, validUntil, content, status, createRevision } = body

  const proposal = await prisma.proposal.findUnique({ where: { id } })
  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Don't allow editing accepted proposals (only status change)
  if (proposal.status === 'accepted' && Object.keys(body).some(k => k !== 'status')) {
    return NextResponse.json({ error: 'Cannot edit accepted proposals' }, { status: 400 })
  }

  // If creating a new revision, save current state to history first
  if (createRevision && (title || summary !== undefined || totalPrice || content)) {
    // Save current proposal state as a revision
    await prisma.proposalRevision.create({
      data: {
        proposalId: id,
        revision: proposal.revision,
        title: proposal.title,
        summary: proposal.summary,
        totalPrice: proposal.totalPrice,
        content: proposal.content,
      },
    })

    // Clear comments for the new revision
    await prisma.proposalComment.deleteMany({
      where: { proposalId: id },
    })

    // Reset signature if proposal was pending (not accepted)
    const shouldResetSignature = proposal.status === 'pending'

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(summary !== undefined && { summary }),
        ...(totalPrice && { totalPrice }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
        ...(content && { content }),
        ...(status && { status }),
        revision: proposal.revision + 1,
        ...(shouldResetSignature && { signature: null, acceptedAt: null }),
      },
    })

    // TODO: Send email notification to client about updated proposal

    return NextResponse.json({ ...updated, revisionCreated: true })
  }

  // Simple update without revision (e.g., just status change)
  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(summary !== undefined && { summary }),
      ...(totalPrice && { totalPrice }),
      ...(validUntil && { validUntil: new Date(validUntil) }),
      ...(content && { content }),
      ...(status && { status }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/admin/proposals/[id] - Delete proposal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({ where: { id } })
  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (proposal.status === 'accepted') {
    return NextResponse.json({ error: 'Cannot delete accepted proposals' }, { status: 400 })
  }

  await prisma.proposal.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
