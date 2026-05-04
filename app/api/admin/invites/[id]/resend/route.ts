import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendInviteEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const invite = await prisma.invite.findUnique({
    where: { id },
  })

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const client = await prisma.client.findUnique({
    where: { id: invite.clientId },
    select: { name: true },
  })

  // Check permission: site admin OR client owner/admin
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

  // If the invite already expired, rotate the token and extend the expiry
  // so the resent email actually leads somewhere usable.
  let token = invite.token
  if (invite.expiresAt < new Date() || invite.usedAt) {
    token = crypto.randomBytes(32).toString('hex')
    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usedAt: null,
      },
    })
  }

  await sendInviteEmail(invite.email, client?.name || 'Your Project', token)

  return NextResponse.json({ success: true })
}
