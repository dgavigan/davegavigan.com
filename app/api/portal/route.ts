import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/portal - Get current user's portal data
// Admin can pass ?clientId=xxx to view as that client
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = session.user.role === 'admin'
  const viewClientId = req.nextUrl.searchParams.get('clientId')

  // Get user with their client associations
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientOf: {
        include: {
          projects: {
            include: {
              proposal: true,  // 1:1 relationship
              phases: {
                orderBy: { order: 'asc' },
              },
              activities: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                  user: {
                    select: { name: true, email: true, image: true },
                  },
                  comments: {
                    include: {
                      user: {
                        select: { name: true, email: true },
                      },
                    },
                  },
                },
              },
              deliverables: true,
              invoices: {
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          owner: {
            select: { id: true },
          },
        },
      },
      ownedClients: {
        select: { id: true },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Admin: get all clients for switcher
  let allClients: { id: string; name: string; slug: string }[] = []
  if (isAdmin) {
    const clients = await prisma.client.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    })
    allClients = clients
  }

  // Determine which client to show
  let client = null
  
  if (isAdmin && viewClientId) {
    // Admin viewing specific client
    client = await prisma.client.findUnique({
      where: { id: viewClientId },
      include: {
        projects: {
          include: {
            proposal: true,  // 1:1 relationship
            phases: {
              orderBy: { order: 'asc' },
            },
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 10,
              include: {
                user: {
                  select: { name: true, email: true, image: true },
                },
                comments: {
                  include: {
                    user: {
                      select: { name: true, email: true },
                    },
                  },
                },
              },
            },
            deliverables: true,
            invoices: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        owner: {
          select: { id: true },
        },
      },
    })
  } else {
    // Regular user or admin not viewing specific client
    client = user.clientOf[0] || null
  }

  if (!client) {
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOwner: false,
      },
      client: null,
      clients: isAdmin ? allClients : undefined,
      projects: [],
    })
  }

  // Check if user is owner and get member role
  const isOwner = client.owner?.id === user.id
  
  // Get member role from ClientMember table
  const membership = await prisma.clientMember.findFirst({
    where: { clientId: client.id, userId: user.id },
    select: { role: true },
  })
  const memberRole = isOwner ? 'owner' : (membership?.role || 'viewer')

  // Format projects with parsed proposal content
  const projects = client.projects.map(project => {
    let proposalData = null
    if (project.proposal) {
      let content = {}
      try {
        content = JSON.parse(project.proposal.content)
      } catch (e) {
        content = {}
      }
      proposalData = {
        ...project.proposal,
        content,
        totalPrice: project.proposal.totalPrice / 100,
      }
    }
    return {
      ...project,
      proposal: proposalData,
    }
  })

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isOwner,
    },
    client: {
      id: client.id,
      name: client.name,
      slug: client.slug,
    },
    clients: isAdmin ? allClients : undefined,
    projects,
    team: client.users,
    memberRole,
  })
}
