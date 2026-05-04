import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/comments - Create a comment on an activity
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { activityId, text } = body

  if (!activityId || !text?.trim()) {
    return NextResponse.json({ error: 'activityId and text required' }, { status: 400 })
  }

  // Verify activity exists and user has access
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      project: {
        include: {
          client: {
            include: { users: { select: { id: true } } },
          },
        },
      },
    },
  })

  if (!activity) {
    return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
  }

  // Check access - admin or client user
  const isAdmin = session.user.role === 'admin'
  const isClientUser = activity.project.client.users.some(u => u.id === session.user.id)

  if (!isAdmin && !isClientUser) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const comment = await prisma.comment.create({
    data: {
      body: text.trim(),
      activityId,
      userId: session.user.id,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return NextResponse.json(comment)
}

// DELETE /api/comments?id=xxx - Delete a comment (own comments only, or admin)
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const commentId = req.nextUrl.searchParams.get('id')
  if (!commentId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  // Only allow deleting own comments (or admin can delete any)
  const isAdmin = session.user.role === 'admin'
  if (comment.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  await prisma.comment.delete({ where: { id: commentId } })

  return NextResponse.json({ success: true })
}

// GET /api/comments?activityId=xxx - Get comments for an activity
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const activityId = req.nextUrl.searchParams.get('activityId')
  if (!activityId) {
    return NextResponse.json({ error: 'activityId required' }, { status: 400 })
  }

  const comments = await prisma.comment.findMany({
    where: { activityId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments)
}
