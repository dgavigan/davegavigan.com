import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// DELETE /api/admin/users/[id]
// Hard-deletes a user entirely. Site admin only.
// Cascades via Prisma relations: ClientMember, Account, Session, Comments, etc.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Null out any Client.ownerId references (ownerId is optional, onDelete is not set)
  await prisma.client.updateMany({
    where: { ownerId: id },
    data: { ownerId: null },
  })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
