import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = session.user.role === 'admin'
  const viewClientId = req.nextUrl.searchParams.get('clientId')

  let client = null
  let currentUserRole: string | null = null

  // Admin viewing specific client
  if (isAdmin && viewClientId) {
    client = await prisma.client.findUnique({
      where: { id: viewClientId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })
    currentUserRole = 'admin' // Admin has full access
  } else {
    // Regular user - get their membership
    const membership = await prisma.clientMember.findFirst({
      where: { userId: session.user.id },
      include: {
        client: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ team: [], clientName: null, currentUserRole: null })
    }

    client = membership.client
    currentUserRole = membership.role
  }

  if (!client) {
    return NextResponse.json({ team: [], clientName: null, currentUserRole: null, pendingInvites: [] })
  }

  const team = client.members.map(m => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role as 'owner' | 'admin' | 'viewer',
    isYou: m.user.id === session.user.id,
  }))

  // Get pending and expired invites for owners/admins (excluding accepted)
  let pendingInvites: {
    id: string
    email: string
    role: string
    createdAt: Date
    expiresAt: Date
    status: 'pending' | 'expired'
  }[] = []
  if (isAdmin || currentUserRole === 'owner' || currentUserRole === 'admin') {
    const invites = await prisma.invite.findMany({
      where: {
        clientId: client.id,
        usedAt: null,
      },
      select: { id: true, email: true, role: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    })
    const now = new Date()
    pendingInvites = invites.map(i => ({
      ...i,
      status: i.expiresAt > now ? ('pending' as const) : ('expired' as const),
    }))
  }

  return NextResponse.json({
    clientName: client.name,
    clientId: client.id,
    team,
    currentUserRole: currentUserRole as 'owner' | 'admin' | 'viewer',
    pendingInvites,
    viewerIsSiteAdmin: isAdmin,
  })
}
