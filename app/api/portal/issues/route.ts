import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createPortalIssue, getPortalIssues, ensurePortalLabel } from '@/lib/github'

// GET /api/portal/issues - List issues for current project
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projectId = req.nextUrl.searchParams.get('projectId')
  const clientId = req.nextUrl.searchParams.get('clientId')

  // Get project with GitHub repo
  let project = null
  
  if (projectId) {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: { include: { members: { where: { userId: session.user.id } } } } },
    })
  } else if (clientId) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { 
        projects: { where: { status: 'active' }, take: 1 },
        members: { where: { userId: session.user.id } },
      },
    })
    project = client?.projects[0]
    if (project && client) {
      (project as any).client = client
    }
  } else if (session.user.role === 'admin') {
    // Site admin fallback — pick the first active project with a githubRepo
    const found = await prisma.project.findFirst({
      where: { status: 'active', githubRepo: { not: null } },
      orderBy: { createdAt: 'asc' },
      include: { client: true },
    })
    if (found) {
      project = found
      ;(project as any).client = { ...found.client, members: [] }
    }
  } else {
    // Regular user — use their ClientMember
    const membership = await prisma.clientMember.findFirst({
      where: { userId: session.user.id },
      include: {
        client: {
          include: {
            projects: { where: { status: 'active' }, take: 1 },
          },
        },
      },
    })
    project = membership?.client.projects[0]
    if (project && membership) {
      (project as any).client = { members: [membership] }
    }
  }

  if (!project) {
    return NextResponse.json({ issues: [], noProject: true })
  }

  // Check access
  const isAdmin = session.user.role === 'admin'
  const isMember = (project as any).client?.members?.length > 0
  if (!isAdmin && !isMember) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  if (!project.githubRepo) {
    return NextResponse.json({ issues: [], noRepo: true, projectId: project.id })
  }

  try {
    const issues = await getPortalIssues(project.githubRepo)
    return NextResponse.json({ issues, projectId: project.id, repo: project.githubRepo })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, issues: [] }, { status: 500 })
  }
}

// POST /api/portal/issues - Create a new issue
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { projectId, title, description } = body

  if (!projectId || !title) {
    return NextResponse.json({ error: 'projectId and title required' }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: { include: { members: { where: { userId: session.user.id } } } } },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Check access
  const isAdmin = session.user.role === 'admin'
  const isMember = project.client.members.length > 0
  if (!isAdmin && !isMember) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  if (!project.githubRepo) {
    return NextResponse.json({ error: 'No GitHub repo configured for this project' }, { status: 400 })
  }

  try {
    // Ensure portal label exists
    await ensurePortalLabel(project.githubRepo)
    
    // Create the issue
    const result = await createPortalIssue(
      project.githubRepo,
      title,
      description || '',
      { name: session.user.name || null, email: session.user.email! }
    )

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
