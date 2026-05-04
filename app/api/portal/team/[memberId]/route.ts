import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// DELETE /api/portal/team/[memberId]?clientId=xxx
// Removes a user from a client's team (does NOT delete the user record).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { memberId } = await params
  const clientId = req.nextUrl.searchParams.get('clientId')

  const isAdmin = session.user.role === 'admin'

  // Non-admins can only operate on the client they're a member of
  let targetClientId = clientId
  if (!isAdmin) {
    const actor = await prisma.clientMember.findFirst({
      where: { userId: session.user.id },
    })
    if (!actor || (clientId && clientId !== actor.clientId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    if (actor.role !== 'owner' && actor.role !== 'admin') {
      return NextResponse.json({ error: 'Only owners and admins can remove members' }, { status: 403 })
    }
    targetClientId = actor.clientId
  }

  if (!targetClientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  }

  const target = await prisma.clientMember.findUnique({
    where: { clientId_userId: { clientId: targetClientId, userId: memberId } },
  })
  if (!target) {
    return NextResponse.json({ error: 'Member not found on this client' }, { status: 404 })
  }

  if (target.userId === session.user.id) {
    return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 })
  }

  if (target.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove the client owner' }, { status: 400 })
  }

  await prisma.clientMember.delete({ where: { id: target.id } })
  return NextResponse.json({ success: true })
}
