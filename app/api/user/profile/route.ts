import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notifyTimelineUpdate: true,
    },
  })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : undefined
  const notifyTimelineUpdate =
    typeof body.notifyTimelineUpdate === 'boolean' ? body.notifyTimelineUpdate : undefined

  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(notifyTimelineUpdate !== undefined && { notifyTimelineUpdate }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notifyTimelineUpdate: true,
    },
  })
  return NextResponse.json(updated)
}
