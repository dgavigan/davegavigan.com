import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendInviteEmail } from '@/lib/email'

// GET /api/admin/invites - List all invites
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Get client names
  const clientIds = [...new Set(invites.map(i => i.clientId))]
  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true },
  })
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]))

  const invitesWithClients = invites.map(invite => ({
    ...invite,
    clientName: clientMap[invite.clientId] || 'Unknown',
  }))

  return NextResponse.json(invitesWithClients)
}

// POST /api/admin/invites - Create a new invite
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { email, clientId, role } = body

  if (!email || !clientId) {
    return NextResponse.json({ error: 'Email and clientId are required' }, { status: 400 })
  }

  // Check if user has permission: site admin OR client owner/admin
  const isAdmin = session.user.role === 'admin'
  if (!isAdmin) {
    const membership = await prisma.clientMember.findFirst({
      where: { 
        userId: session.user.id, 
        clientId,
        role: { in: ['owner', 'admin'] }
      },
    })
    if (!membership) {
      return NextResponse.json({ error: 'You do not have permission to invite users to this client' }, { status: 403 })
    }
  }

  // Generate unique token
  const token = crypto.randomBytes(32).toString('hex')

  // Expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invite = await prisma.invite.create({
    data: {
      email,
      token,
      role: role || 'viewer',
      clientId,
      expiresAt,
    },
  })

  // Get client name for response
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { name: true },
  })

  // Send invite email
  if (client?.name) {
    await sendInviteEmail(email, client.name, token)
  }

  return NextResponse.json({
    ...invite,
    clientName: client?.name,
    inviteUrl: `/invite/${token}`,
  })
}
