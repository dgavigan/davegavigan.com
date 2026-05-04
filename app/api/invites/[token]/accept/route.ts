import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/invites/[token]/accept - Accept an invite and create user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json()
  const { name, password } = body

  if (!name || !password) {
    return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
  })

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
  }

  if (invite.usedAt) {
    return NextResponse.json({ error: 'Invite has already been used' }, { status: 400 })
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  })

  const memberRole = invite.role || 'viewer'

  if (existingUser) {
    await prisma.client.update({
      where: { id: invite.clientId },
      data: {
        users: { connect: { id: existingUser.id } },
      },
    })

    await prisma.clientMember.upsert({
      where: { clientId_userId: { clientId: invite.clientId, userId: existingUser.id } },
      create: { clientId: invite.clientId, userId: existingUser.id, role: memberRole },
      update: { role: memberRole },
    })

    if (memberRole === 'owner') {
      const client = await prisma.client.findUnique({ where: { id: invite.clientId } })
      if (client && !client.ownerId) {
        await prisma.client.update({
          where: { id: invite.clientId },
          data: { ownerId: existingUser.id },
        })
      }
    }

    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json({ success: true, userId: existingUser.id })
  }

  // Create new user
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email: invite.email,
      password: hashedPassword,
      role: 'client',
      clientOf: {
        connect: { id: invite.clientId },
      },
      clientMemberships: {
        create: { clientId: invite.clientId, role: memberRole },
      },
    },
  })

  if (memberRole === 'owner') {
    const client = await prisma.client.findUnique({ where: { id: invite.clientId } })
    if (client && !client.ownerId) {
      await prisma.client.update({
        where: { id: invite.clientId },
        data: { ownerId: user.id },
      })
    }
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: { usedAt: new Date() },
  })

  return NextResponse.json({ success: true, userId: user.id })
}
