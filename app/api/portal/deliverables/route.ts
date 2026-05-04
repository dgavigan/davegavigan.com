import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientOf: {
        include: {
          projects: {
            include: {
              deliverables: {
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      },
    },
  })

  if (!user?.clientOf || user.clientOf.length === 0) {
    return NextResponse.json({ deliverables: [] })
  }

  const client = user.clientOf[0]
  const project = client.projects[0]

  if (!project) {
    return NextResponse.json({ deliverables: [] })
  }

  const deliverables = project.deliverables.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    type: d.type,
    status: d.status,
    url: d.url,
    createdAt: d.createdAt.toISOString(),
  }))

  return NextResponse.json({ 
    projectName: project.name,
    deliverables 
  })
}
