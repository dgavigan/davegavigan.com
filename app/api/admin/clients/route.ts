import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/clients - List all clients with their projects
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    include: {
      projects: {
        include: {
          proposal: true,  // 1:1 relationship
        },
      },
      users: true,
      owner: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

// POST /api/admin/clients - Create a new client
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, phone, address } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const client = await prisma.client.create({
    data: {
      name,
      slug,
      email,
      phone,
      address,
    },
  })

  return NextResponse.json(client)
}
