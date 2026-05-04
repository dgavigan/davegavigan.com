import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.comment.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.deliverable.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.task.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.project.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.client.deleteMany()

  // Create admin user (you)
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'dave@davegavigan.com',
      name: 'Dave Gavigan',
      password: adminPassword,
      role: 'admin',
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create demo client user
  const demoPassword = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Alex Thompson',
      password: demoPassword,
      role: 'client',
    },
  })
  console.log('✅ Created demo user:', demoUser.email)

  // Create demo client company
  const demoClient = await prisma.client.create({
    data: {
      name: 'Acme Medical Supply',
      slug: 'acme-medical',
      email: 'info@acmemedical.example.com',
      ownerId: demoUser.id,
      users: {
        connect: { id: demoUser.id },
      },
    },
  })
  console.log('✅ Created demo client:', demoClient.name)

  // Create demo project
  const demoProject = await prisma.project.create({
    data: {
      name: 'Phase I: Foundation & Discovery',
      description: 'Complete Shopify theme rebuild with parallel audit of ShipperHQ and Shopify Plus configuration.',
      status: 'pending',
      clientId: demoClient.id,
    },
  })
  console.log('✅ Created demo project:', demoProject.name)

  // Create proposal
  const proposalContent = JSON.stringify({
    summary: "Phase I tackles the known problems — site rebuild, bugs, mobile, SEO — while I research the unknowns. Phase II delivers the Shopify Plus features and ShipperHQ fixes with real estimates based on what I learn.",
    concerns: [
      "Shopping experience is clunky on mobile (68% of traffic)",
      "ShipperHQ freight quotes failing or showing wrong rates",
      "Shopify Plus features you're paying for but not using (B2B, abandoned carts, analytics)",
      "Site feels dated compared to competitors"
    ],
    phases: [
      {
        name: 'Onboarding & Audit',
        price: 220000,
        hours: '8-10',
        items: [
          'Kick-off call + asset collection',
          'ShipperHQ configuration audit',
          'Shopify Plus feature assessment',
          'Current theme code review',
          'Competitor analysis snapshot'
        ]
      },
      {
        name: 'Theme Development',
        price: 430000,
        hours: '20-25',
        items: [
          'Modern responsive design (Figma mockups)',
          'Clean Dawn-based theme build',
          'Product filtering + quick view',
          'Mobile-first checkout optimization',
          'SEO technical implementation',
          '2 rounds of revisions'
        ]
      }
    ],
    discovery: [
      {
        name: 'ShipperHQ Configuration',
        description: 'Root cause analysis of freight quote failures + recommended fixes'
      },
      {
        name: 'Shopify Plus Features',
        description: 'B2B customer portal, abandoned cart recovery, analytics — what to enable and how'
      }
    ],
    phase2Range: '$2,500 - $8,000',
    phase2Note: 'Exact scope determined by audit findings. Could include B2B portal buildout, ShipperHQ rebuild, custom shipping rules, or Shopify Flow automations.',
    timeline: '4-5 weeks from kick-off to launch',
    payment: {
      deposit: 455000,
      final: 195000,
      depositNote: '70% to start',
      finalNote: '30% at launch'
    },
    includes: [
      'All source files and Figma designs',
      'Knowledge transfer documentation',
      '30 days support after go-live',
      'Phase II recommendations report'
    ]
  })

  const proposal = await prisma.proposal.create({
    data: {
      title: 'Phase I: Foundation & Discovery',
      summary: 'Complete site rebuild with ShipperHQ and Shopify Plus audit',
      status: 'pending',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      totalPrice: 650000, // $6,500 in cents
      content: proposalContent,
      projectId: demoProject.id,
    },
  })
  console.log('✅ Created demo proposal:', proposal.title)

  // Create phases
  const phases = [
    { name: 'Pre-Project', order: 0 },
    { name: 'Onboarding & Audit', order: 1 },
    { name: 'Theme Development', order: 2 },
    { name: 'Launch & Handoff', order: 3 },
  ]

  for (const phase of phases) {
    await prisma.phase.create({
      data: {
        name: phase.name,
        order: phase.order,
        status: phase.order === 0 ? 'in-progress' : 'pending',
        projectId: demoProject.id,
      },
    })
  }
  console.log('✅ Created project phases')

  // Create some activities
  await prisma.activity.create({
    data: {
      type: 'proposal',
      title: 'Phase I Proposal Sent',
      body: 'Complete proposal for Phase I: Foundation & Discovery. Includes Shopify/ShipperHQ audit ($2,200) and complete theme development ($4,300).',
      projectId: demoProject.id,
      userId: admin.id,
    },
  })

  await prisma.activity.create({
    data: {
      type: 'update',
      title: 'Discovery call recap',
      body: "• ShipperHQ issues causing checkout friction — need to diagnose root cause\n• B2B portal features desired but unclear what's already configured\n• Tyler's bug list needs to be addressed in any rebuild\n• SEO audit findings haven't been implemented\n• Current theme has accumulated cruft over time",
      projectId: demoProject.id,
      userId: admin.id,
    },
  })
  console.log('✅ Created activities')

  // Create a real client (Booth Medical) - for actual use
  const boothUser = await prisma.user.create({
    data: {
      email: 'jared@boothmed.com',
      name: 'Jared Booth',
      password: await bcrypt.hash('booth2026', 10),
      role: 'client',
    },
  })

  const boothClient = await prisma.client.create({
    data: {
      name: 'Booth Medical Equipment',
      slug: 'booth-medical',
      email: 'info@boothmed.com',
      ownerId: boothUser.id,
      users: {
        connect: { id: boothUser.id },
      },
    },
  })
  console.log('✅ Created Booth Medical client')

  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Test accounts:')
  console.log('   Admin: dave@davegavigan.com / admin123')
  console.log('   Demo:  demo@example.com / demo123')
  console.log('   Booth: jared@boothmed.com / booth2026')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
