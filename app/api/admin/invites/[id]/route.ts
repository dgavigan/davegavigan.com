import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const invite = await prisma.invite.findUnique({ where: { id } })
  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const isAdmin = session.user.role === 'admin'
  if (!isAdmin) {
    const membership = await prisma.clientMember.findFirst({
      where: {
        userId: session.user.id,
        clientId: invite.clientId,
        role: { in: ['owner', 'admin'] },
      },
    })
    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
  }

  await prisma.invite.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
