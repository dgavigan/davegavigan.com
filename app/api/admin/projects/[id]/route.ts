import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/admin/projects/[id] - Update a project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, description, status, progress } = body

  // Validate progress: null (clear) or integer 0-100
  let progressUpdate: number | null | undefined = undefined
  if (progress === null) {
    progressUpdate = null
  } else if (typeof progress === 'number' && Number.isInteger(progress) && progress >= 0 && progress <= 100) {
    progressUpdate = progress
  } else if (progress !== undefined) {
    return NextResponse.json({ error: 'progress must be an integer 0-100 or null' }, { status: 400 })
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(progressUpdate !== undefined && { progress: progressUpdate }),
    },
    include: {
      client: true,
      proposal: true,
    },
  })

  return NextResponse.json(project)
}

// DELETE /api/admin/projects/[id] - Delete a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await prisma.project.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
