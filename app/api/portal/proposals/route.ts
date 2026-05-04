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

  let proposals: any[] = []

  if (isAdmin && viewClientId) {
    // Admin viewing specific client
    const client = await prisma.client.findUnique({
      where: { id: viewClientId },
      include: {
        projects: {
          include: {
            proposal: true,  // 1:1 relationship
          },
        },
      },
    })
    
    proposals = client?.projects
      .filter(project => project.proposal)
      .map(project => ({
        id: project.proposal!.id,
        title: project.proposal!.title,
        status: project.proposal!.status,
        totalPrice: project.proposal!.totalPrice,
        createdAt: project.proposal!.createdAt.toISOString(),
        acceptedAt: project.proposal!.acceptedAt?.toISOString() || null,
        projectName: project.name,
      })) || []
  } else {
    // Regular user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientOf: {
          include: {
            projects: {
              include: {
                proposal: true,  // 1:1 relationship
              },
            },
          },
        },
      },
    })

    proposals = user?.clientOf.flatMap(client =>
      client.projects
        .filter(project => project.proposal)
        .map(project => ({
          id: project.proposal!.id,
          title: project.proposal!.title,
          status: project.proposal!.status,
          totalPrice: project.proposal!.totalPrice,
          createdAt: project.proposal!.createdAt.toISOString(),
          acceptedAt: project.proposal!.acceptedAt?.toISOString() || null,
          projectName: project.name,
        }))
    ) || []
  }

  return NextResponse.json({ proposals })
}
