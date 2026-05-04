import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

// GET /api/admin/users - List all users
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      clientOf: {
        select: {
          id: true,
          name: true,
        },
      },
      ownedClients: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, password, role, clientId } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'client',
      ...(clientId && {
        clientOf: {
          connect: { id: clientId },
        },
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  // If clientId provided, also set as owner if they're the first user
  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (client && !client.ownerId) {
      await prisma.client.update({
        where: { id: clientId },
        data: { ownerId: user.id },
      })
    }
  }

  // Send welcome email with credentials
  await sendWelcomeEmail(email, name, password)

  return NextResponse.json(user)
}
