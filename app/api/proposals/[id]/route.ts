import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/proposals/[id] - Get a proposal (client-facing)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: {
            include: {
              users: { select: { id: true } },
              members: {
                where: { userId: session.user.id },
                select: { role: true },
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

  const isAdmin = session.user.role === 'admin'
  const isClientUser = proposal.project.client.users.some(u => u.id === session.user.id)

  if (!isAdmin && !isClientUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const membership = proposal.project.client.members[0]
  const isClientOwner =
    membership?.role === 'owner' ||
    proposal.project.client.ownerId === session.user.id
  const currentUserRole: 'owner' | 'admin' | 'viewer' | null = isAdmin
    ? 'admin'
    : ((membership?.role as 'owner' | 'admin' | 'viewer' | undefined) ?? null)
  const canAccept = isAdmin || isClientOwner

  let content = {}
  try {
    content = JSON.parse(proposal.content)
  } catch (e) {
    content = {}
  }

  return NextResponse.json({
    ...proposal,
    content,
    totalPrice: proposal.totalPrice,
    currentUserRole,
    canAccept,
  })
}
