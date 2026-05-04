import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendTimelineUpdateEmail } from '@/lib/email'

// GET /api/admin/activities - List activities for a project
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 })
  }

  const activities = await prisma.activity.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(activities)
}

// POST /api/admin/activities - Create a timeline update
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { projectId, type, title, description } = body

  if (!projectId || !title) {
    return NextResponse.json({ error: 'projectId and title required' }, { status: 400 })
  }

  const activity = await prisma.activity.create({
    data: {
      projectId,
      type: type || 'update',
      title,
      body: description || null,
      userId: session.user.id,
    },
  })

  // Notify opted-in users — fire-and-forget so a mail failure doesn't fail the post
  notifyTimelineSubscribers(projectId, session.user.id, {
    title,
    body: description || null,
    type: type || 'update',
  }).catch(err => console.error('[timeline-notify] failed', err))

  return NextResponse.json(activity)
}

async function notifyTimelineSubscribers(
  projectId: string,
  posterUserId: string,
  update: { title: string; body: string | null; type: string }
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, notifyTimelineUpdate: true },
              },
            },
          },
        },
      },
    },
  })
  if (!project) return

  // Client members who opted in
  const memberRecipients = project.client.members
    .map(m => m.user)
    .filter(u => u.notifyTimelineUpdate && u.email)

  // Site admins who opted in (they don't live in ClientMember)
  const siteAdmins = await prisma.user.findMany({
    where: { role: 'admin', notifyTimelineUpdate: true },
    select: { id: true, name: true, email: true, notifyTimelineUpdate: true },
  })

  // Dedupe by id — a site admin could also be a ClientMember
  const byId = new Map<string, { id: string; name: string | null; email: string }>()
  for (const u of [...memberRecipients, ...siteAdmins]) {
    if (u.email) byId.set(u.id, { id: u.id, name: u.name, email: u.email })
  }

  // Include the poster so you get a "sent" copy (useful for site admins
  // verifying email delivery on clients they're not a member of). The poster
  // must have the pref on — respect their setting.
  const alreadyIncluded = byId.has(posterUserId)
  if (!alreadyIncluded) {
    const poster = await prisma.user.findUnique({
      where: { id: posterUserId },
      select: { id: true, name: true, email: true, notifyTimelineUpdate: true },
    })
    if (poster?.notifyTimelineUpdate && poster.email) {
      byId.set(poster.id, { id: poster.id, name: poster.name, email: poster.email })
    }
  }

  await Promise.all(
    Array.from(byId.values()).map(u =>
      sendTimelineUpdateEmail(
        u.email,
        u.name || u.email.split('@')[0],
        project.client.name,
        update.title,
        update.body,
        update.type,
        project.name
      )
    )
  )
}
