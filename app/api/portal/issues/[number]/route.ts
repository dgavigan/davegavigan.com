import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getPortalIssue, getIssueComments, addIssueComment } from '@/lib/github'

// GET /api/portal/issues/[number] - Get issue details with comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { number } = await params
  const issueNumber = parseInt(number)
  const projectId = req.nextUrl.searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: { include: { members: { where: { userId: session.user.id } } } } },
  })

  if (!project?.githubRepo) {
    return NextResponse.json({ error: 'No repo configured' }, { status: 400 })
  }

  // Check access
  const isAdmin = session.user.role === 'admin'
  const isMember = project.client.members.length > 0
  if (!isAdmin && !isMember) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const issue = await getPortalIssue(project.githubRepo, issueNumber)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const comments = await getIssueComments(project.githubRepo, issueNumber)

    return NextResponse.json({ issue, comments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/portal/issues/[number] - Add a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { number } = await params
  const issueNumber = parseInt(number)
  const body = await req.json()
  const { projectId, comment } = body

  if (!projectId || !comment) {
    return NextResponse.json({ error: 'projectId and comment required' }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: { include: { members: { where: { userId: session.user.id } } } } },
  })

  if (!project?.githubRepo) {
    return NextResponse.json({ error: 'No repo configured' }, { status: 400 })
  }

  // Check access
  const isAdmin = session.user.role === 'admin'
  const isMember = project.client.members.length > 0
  if (!isAdmin && !isMember) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const newComment = await addIssueComment(
      project.githubRepo,
      issueNumber,
      comment,
      { name: session.user.name || null, email: session.user.email! }
    )

    return NextResponse.json(newComment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
