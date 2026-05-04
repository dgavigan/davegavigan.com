import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/invites/[token] - Get invite details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const invite = await prisma.invite.findUnique({
    where: { token },
  })

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  // Get client name
  const client = await prisma.client.findUnique({
    where: { id: invite.clientId },
    select: { name: true },
  })

  const expired = invite.expiresAt < new Date()
  const used = !!invite.usedAt

  return NextResponse.json({
    email: invite.email,
    clientName: client?.name || 'Unknown',
    role: invite.role,
    expiresAt: invite.expiresAt.toISOString(),
    expired,
    used,
  })
}
