/**
 * Idempotent demo client seed. Safe to re-run — resets demo data without
 * touching real clients.
 *
 * Creates:
 *   - Client: "Verdant Wellness" (slug: verdant-wellness)
 *   - 3 users with davegavigan+demo_*@gmail.com aliases (real inboxes so
 *     email flows can be QA'd end-to-end). Password for all: demo2026
 *       · Alex Rivera  — owner  (davegavigan+demo_owner@gmail.com)
 *       · Jordan Kim   — admin  (davegavigan+demo_admin@gmail.com)
 *       · Sam Patel    — viewer (davegavigan+demo_viewer@gmail.com)
 *   - Project "Phase I: Storefront Rebuild" (active) with accepted proposal,
 *     endDate 2026-05-29, 3 phases, 4 timeline activities, 2 deliverables.
 *   - Project "Phase II: Growth Engine" (pending) with pending proposal.
 *
 * Run: npx tsx scripts/seed-demo-client.ts
 */
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const DEMO_SLUG = 'verdant-wellness'
const DEMO_PASSWORD = 'demo2026'

async function upsertUser(email: string, name: string) {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10)
  return prisma.user.upsert({
    where: { email },
    create: { email, name, password: hashed, role: 'client' },
    update: { name, password: hashed },
  })
}

async function main() {
  console.log('Seeding demo client...')

  // Users
  const owner = await upsertUser('davegavigan+demo_owner@gmail.com', 'Alex Rivera')
  const admin = await upsertUser('davegavigan+demo_admin@gmail.com', 'Jordan Kim')
  const viewer = await upsertUser('davegavigan+demo_viewer@gmail.com', 'Sam Patel')

  // Client
  const client = await prisma.client.upsert({
    where: { slug: DEMO_SLUG },
    create: {
      name: 'Verdant Wellness',
      slug: DEMO_SLUG,
      email: 'hello@verdantwellness.demo',
      ownerId: owner.id,
    },
    update: { ownerId: owner.id },
  })

  // Connect owner via legacy clientOf too (some code paths still read it)
  await prisma.client.update({
    where: { id: client.id },
    data: { users: { connect: [{ id: owner.id }, { id: admin.id }, { id: viewer.id }] } },
  })

  // ClientMember rows (role-based)
  for (const [user, role] of [[owner, 'owner'], [admin, 'admin'], [viewer, 'viewer']] as const) {
    await prisma.clientMember.upsert({
      where: { clientId_userId: { clientId: client.id, userId: user.id } },
      create: { clientId: client.id, userId: user.id, role },
      update: { role },
    })
  }

  // Wipe prior demo projects so re-runs are clean
  await prisma.project.deleteMany({ where: { clientId: client.id } })

  // ============ Project 1: active, accepted proposal ============
  const phase1 = await prisma.project.create({
    data: {
      name: 'Phase I: Storefront Rebuild',
      description: 'Shopify theme rebuild with SEO fixes, mobile-first redesign, and checkout optimization.',
      status: 'pending',
      clientId: client.id,
      endDate: new Date('2026-05-29T00:00:00Z'),
    },
  })

  const acceptedContent = {
    summary: 'Full rebuild of the Verdant Wellness Shopify storefront with a parallel audit of subscription flow and fulfillment.',
    concerns: [
      'Mobile conversion lagging desktop by 40%',
      'Subscription flow fragmented across 3 apps',
      'SEO audit recommendations stalled for 6 months',
      'Abandoned cart recovery never configured',
    ],
    phases: [
      { name: 'Discovery & Audit', price: 180000, hours: '~20 hours' },
      { name: 'Theme Development', price: 420000, hours: '~50 hours' },
      { name: 'Launch & Handoff', price: 120000, hours: '~15 hours' },
    ],
    timeline: 'Six weeks from kickoff to launch. May 29 is the penciled-in go-live.',
    timelineBreakdown: [
      { week: 1, activity: 'Discovery sessions, brand asset audit, tech review' },
      { week: 2, activity: 'Design system + homepage wireframes' },
      { week: 3, activity: 'PLP + PDP builds, subscription flow integration' },
      { week: 4, activity: 'Checkout customization + abandoned cart setup' },
      { week: 5, activity: 'QA, content migration, SEO pass' },
      { week: 6, activity: 'Launch, monitoring, handoff documentation' },
    ],
  }

  const phase1Proposal = await prisma.proposal.create({
    data: {
      title: 'Verdant Wellness — Phase I: Storefront Rebuild',
      summary: acceptedContent.summary,
      status: 'pending',
      totalPrice: 72000000, // $720,000 in cents (demo value)
      validUntil: new Date('2026-05-15T00:00:00Z'),
      content: JSON.stringify(acceptedContent),
      projectId: phase1.id,
    },
  })

  // Activities on phase1
  await prisma.activity.createMany({
    data: [
      {
        type: 'milestone',
        title: 'Kickoff call complete',
        body: 'Scope locked. Heading into discovery week.',
        projectId: phase1.id,
        userId: owner.id,
        createdAt: new Date('2026-04-11T15:00:00Z'),
      },
      {
        type: 'update',
        title: 'Week 1 discovery notes',
        body: 'Brand audit complete. Three key takeaways:\n\n* Subscription UX needs a rethink — current flow bleeds 30% at step 2\n* Product photography is strong; lean on it harder in design\n* GA4 / Meta pixel setup is clean, no remediation needed\n\nMore in the shared doc: https://example.com/verdant-week1',
        projectId: phase1.id,
        userId: null,
        createdAt: new Date('2026-04-15T18:30:00Z'),
      },
      {
        type: 'deliverable',
        title: 'Homepage wireframes delivered',
        body: 'V1 of desktop + mobile wireframes in Figma. Feedback by EOD Friday please.',
        projectId: phase1.id,
        userId: null,
        createdAt: new Date('2026-04-16T20:00:00Z'),
      },
      {
        type: 'update',
        title: 'Friday Sync — April 17',
        body: 'Week 1 wrap + week 2 plan.\n\n* Wireframes approved with minor tweaks\n* Subscription flow research underway\n* SEO audit items backlogged into week 5\n\nTargeting end of May — ~May 29 — for go-live. Penciled in collectively; subject to scope lock.',
        projectId: phase1.id,
        userId: null,
        createdAt: new Date('2026-04-17T16:00:00Z'),
      },
    ],
  })

  // Deliverables
  await prisma.deliverable.createMany({
    data: [
      {
        name: 'Homepage wireframes (desktop + mobile)',
        description: 'Figma file with annotated flows. Two rounds of revision included.',
        status: 'approved',
        projectId: phase1.id,
      },
      {
        name: 'SEO audit report',
        description: 'Technical SEO review and prioritized remediation list.',
        status: 'draft',
        projectId: phase1.id,
      },
    ],
  })

  // ============ Project 2: pending, pending proposal ============
  const phase2 = await prisma.project.create({
    data: {
      name: 'Phase II: Growth Engine',
      description: 'Post-launch optimization: lifecycle emails, loyalty program, and data warehousing.',
      status: 'pending',
      clientId: client.id,
    },
  })

  const pendingContent = {
    summary: 'Phase II picks up after launch with lifecycle marketing, loyalty, and the analytics layer needed to compound revenue.',
    concerns: [
      'Email lifecycle is ad-hoc — no post-purchase series',
      'No loyalty program — high-LTV customers have no reason to stay',
      'Reporting lives in spreadsheets; no single source of truth',
    ],
    phases: [
      { name: 'Lifecycle Email', price: 240000, hours: '~30 hours' },
      { name: 'Loyalty Integration', price: 300000, hours: '~35 hours' },
      { name: 'Analytics & Reporting', price: 220000, hours: '~25 hours' },
    ],
    timeline: 'Eight weeks, starting after Phase I launch.',
  }

  await prisma.proposal.create({
    data: {
      title: 'Verdant Wellness — Phase II: Growth Engine',
      summary: pendingContent.summary,
      status: 'pending',
      totalPrice: 76000000, // $760,000 in cents (demo value)
      validUntil: new Date('2026-06-15T00:00:00Z'),
      content: JSON.stringify(pendingContent),
      projectId: phase2.id,
    },
  })

  console.log('\nDemo client ready:')
  console.log(`  Client: ${client.name} (slug: ${client.slug})`)
  console.log(`  Login: ${owner.email} / ${DEMO_PASSWORD}   [owner]`)
  console.log(`         ${admin.email} / ${DEMO_PASSWORD}   [admin]`)
  console.log(`         ${viewer.email} / ${DEMO_PASSWORD}  [viewer]`)
  console.log(`  Projects: ${phase1.name} (pending proposal), ${phase2.name} (pending proposal)`)
  console.log(`  Proposals: ${phase1Proposal.title}`)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
