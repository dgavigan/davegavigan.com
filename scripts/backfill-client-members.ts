/**
 * One-shot backfill: create ClientMember rows for any user who is linked to a
 * Client via the legacy clientOf relation but has no corresponding ClientMember.
 *
 * Role is inferred: Client.ownerId match -> 'owner', otherwise 'viewer'.
 *
 * Run with: npx tsx scripts/backfill-client-members.ts
 */
import prisma from '@/lib/prisma'

async function main() {
  const clients = await prisma.client.findMany({
    include: {
      users: { select: { id: true, email: true } },
      members: { select: { userId: true } },
    },
  })

  let created = 0
  for (const client of clients) {
    const existingMemberIds = new Set(client.members.map(m => m.userId))
    for (const user of client.users) {
      if (existingMemberIds.has(user.id)) continue
      const role = client.ownerId === user.id ? 'owner' : 'viewer'
      await prisma.clientMember.create({
        data: { clientId: client.id, userId: user.id, role },
      })
      created++
      console.log(`  + ${user.email} -> ${client.name} (${role})`)
    }
  }

  console.log(`\nDone. Created ${created} ClientMember rows.`)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
