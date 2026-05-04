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
  let project = null

  const projectId = req.nextUrl.searchParams.get('projectId')

  if (isAdmin && viewClientId) {
    // Admin viewing specific client
    client = await prisma.client.findUnique({
      where: { id: viewClientId },
      include: {
        projects: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 50,
              include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                _count: { select: { comments: true } },
              },
            },
            proposal: true,  // 1:1 relationship
          },
        },
      },
    })
    // Use projectId from URL or default to first
    project = projectId 
      ? client?.projects.find(p => p.id === projectId) || client?.projects[0]
      : client?.projects[0]
  } else {
    // Regular user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientOf: {
          include: {
            projects: {
              include: {
                activities: {
                  orderBy: { createdAt: 'desc' },
                  take: 50,
                  include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    _count: { select: { comments: true } },
                  },
                },
                proposal: true,  // 1:1 relationship
              },
            },
          },
        },
      },
    })
    client = user?.clientOf?.[0]
    // Use projectId from URL or default to first
    project = projectId 
      ? client?.projects.find(p => p.id === projectId) || client?.projects[0]
      : client?.projects[0]
  }

  if (!project) {
    return NextResponse.json({ 
      projectName: null,
      projectStatus: 'pending',
      activities: [],
    })
  }

  // Build activities array from DB activities + proposal events
  const activities: any[] = [...project.activities]

  // Add proposal events to timeline (1:1 relationship now)
  const proposal = project.proposal
  if (proposal) {
    // Proposal sent
    activities.push({
      id: `proposal-sent-${proposal.id}`,
      type: 'proposal',
      title: `Proposal: ${proposal.title}`,
      body: proposal.status === 'pending'
        ? 'Awaiting your review'
        : proposal.status === 'accepted'
          ? 'Accepted'
          : null,
      createdAt: proposal.createdAt,
      metadata: JSON.stringify({ 
        owner: 'client',
        proposalId: proposal.id,
        status: proposal.status,
      }),
      projectId: project.id,
      userId: null,
    })

    // Proposal accepted
    if (proposal.acceptedAt) {
      activities.push({
        id: `proposal-accepted-${proposal.id}`,
        type: 'milestone',
        title: 'Proposal accepted — Project kicked off! 🎉',
        body: `${proposal.title} approved. Work begins now.`,
        createdAt: proposal.acceptedAt,
        metadata: JSON.stringify({ proposalId: proposal.id }),
        projectId: project.id,
        userId: null,
      })
    }
  }

  // Sort all activities by date, newest first
  activities.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return NextResponse.json({
    projectName: project.name,
    projectStatus: project.status,
    activities: activities.map((a: any) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.body,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      metadata: a.metadata ? (typeof a.metadata === 'string' ? JSON.parse(a.metadata) : a.metadata) : null,
      user: a.user ? { id: a.user.id, name: a.user.name, email: a.user.email, role: a.user.role } : null,
      isDbActivity: !a.id.toString().startsWith('proposal-'),  // Real DB activity vs synthetic
      commentCount: a._count?.comments || 0,
    })),
  })
}
