import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientOf: {
        include: {
          projects: {
            include: {
              invoices: {
                orderBy: { createdAt: 'desc' },
              },
              proposal: true,
            },
          },
        },
      },
    },
  })

  if (!user?.clientOf || user.clientOf.length === 0) {
    return NextResponse.json({ invoices: [], total: 0, paid: 0 })
  }

  const client = user.clientOf[0]
  const project = client.projects[0]

  if (!project) {
    return NextResponse.json({ invoices: [], total: 0, paid: 0 })
  }

  const invoices = project.invoices.map(inv => ({
    id: inv.id,
    number: inv.number,
    description: inv.notes,
    amount: inv.total,
    status: inv.status,
    dueDate: inv.dueDate?.toISOString() || null,
    paidAt: inv.paidDate?.toISOString() || null,
    createdAt: inv.createdAt.toISOString(),
  }))

  // Calculate totals
  const total = project.proposal?.status === 'accepted' ? (project.proposal?.totalPrice || 0) : 0
  const paid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  return NextResponse.json({ 
    projectName: project.name,
    invoices,
    total,
    paid,
    remaining: total - paid,
  })
}
