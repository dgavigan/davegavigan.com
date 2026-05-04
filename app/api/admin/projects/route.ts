import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/projects - List all projects
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    include: {
      client: true,
      proposal: true,
      phases: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}

// POST /api/admin/projects - Create a new project
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, clientId, status } = body

  if (!name || !clientId) {
    return NextResponse.json({ error: 'Name and clientId are required' }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status: status || 'pending',
      clientId,
    },
    include: {
      client: true,
    },
  })

  return NextResponse.json(project)
}
