import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/proposals/[id]/revisions - Get revision history
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
    select: {
      id: true,
      revision: true,
      title: true,
      summary: true,
      totalPrice: true,
      content: true,
      updatedAt: true,
    },
  })

  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const revisions = await prisma.proposalRevision.findMany({
    where: { proposalId: id },
    orderBy: { revision: 'desc' },
  })

  // Return current + historical revisions
  return NextResponse.json({
    current: {
      ...proposal,
      isCurrent: true,
    },
    history: revisions,
  })
}
