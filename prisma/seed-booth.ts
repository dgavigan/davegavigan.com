import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏥 Seeding Booth Medical proposal...')

  // Find Booth Medical client
  let boothClient = await prisma.client.findFirst({
    where: { slug: 'booth-medical' },
  })

  if (!boothClient) {
    console.log('Creating Booth Medical client...')
    boothClient = await prisma.client.create({
      data: {
        name: 'Booth Medical Equipment',
        slug: 'booth-medical',
        email: 'info@boothmed.com',
      },
    })
  }

  // Find or create Jared user
  let jaredUser = await prisma.user.findUnique({
    where: { email: 'jared@boothmed.com' },
  })

  if (!jaredUser) {
    const bcrypt = require('bcryptjs')
    jaredUser = await prisma.user.create({
      data: {
        name: 'Jared Booth',
        email: 'jared@boothmed.com',
        password: await bcrypt.hash('booth2026', 10),
        role: 'client',
      },
    })
  }

  // Connect user to client
  await prisma.client.update({
    where: { id: boothClient.id },
    data: {
      ownerId: jaredUser.id,
      users: {
        connect: { id: jaredUser.id },
      },
    },
  })

  // Create project
  let project = await prisma.project.findFirst({
    where: { clientId: boothClient.id },
  })

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Phase I: Foundation & Discovery',
        description: 'Complete Shopify theme rebuild with parallel audit of ShipperHQ and Shopify Plus configuration.',
        status: 'pending',
        clientId: boothClient.id,
      },
    })
  }

  // Create proposal with full content
  const proposalContent = {
    summary: "Phase I tackles the known problems — site rebuild, bugs, mobile, SEO — while I research the unknowns. Phase II delivers the ShipperHQ fixes and unlocks the Shopify Plus features you're paying for (B2B, abandoned carts, etc.), with real estimates based on what I learn.",
    concerns: [
      "Bugs and UX issues that keep piling up (Tyler's list)",
      "Mobile experience isn't where it needs to be",
      "SEO audit recommendations haven't been implemented",
      "ShipperHQ causing friction at checkout",
      "Shopify Plus features you're paying for but not using (B2B, abandoned carts, analytics)"
    ],
    phases: [
      {
        name: 'Onboarding & Audit',
        price: 220000,
        hours: '~25 hours',
        items: [
          'Complete Shopify admin review',
          'ShipperHQ root cause diagnosis',
          'Shopify Plus feature assessment (B2B, abandoned carts, analytics)',
          'Written audit report with Phase II scope & estimates'
        ]
      },
      {
        name: 'Theme Development',
        price: 430000,
        hours: '~45-50 hours',
        items: [
          "Bug fixes — all reported issues (Tyler's list, etc.)",
          'Homepage — promotions featured, real categories, trust signals',
          'Shop/PLP — smart filters (multi-select categories, radio for condition), sorting, search',
          'Product pages — variants, pricing, "call for quote" support, financing callouts',
          'Custom landing page templates — flexible, reusable for promos/campaigns',
          'Promotions page — manufacturer rebates, trade-in offers',
          'SEO optimization — all audit findings addressed',
          'Mobile responsive — works on everything',
          'Standard customer accounts — Shopify native'
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
  }

  // Check if proposal exists
  const existingProposal = await prisma.proposal.findFirst({
    where: { projectId: project.id },
  })

  if (existingProposal) {
    // Update existing
    await prisma.proposal.update({
      where: { id: existingProposal.id },
      data: {
        title: 'Phase I: Foundation & Discovery',
        summary: 'Complete site rebuild with ShipperHQ and Shopify Plus audit',
        status: 'pending',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        totalPrice: 650000,
        content: JSON.stringify(proposalContent),
      },
    })
    console.log('✅ Updated existing proposal')
  } else {
    // Create new
    await prisma.proposal.create({
      data: {
        title: 'Phase I: Foundation & Discovery',
        summary: 'Complete site rebuild with ShipperHQ and Shopify Plus audit',
        status: 'pending',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        totalPrice: 650000,
        content: JSON.stringify(proposalContent),
        projectId: project.id,
      },
    })
    console.log('✅ Created new proposal')
  }

  console.log('\n🎉 Booth Medical setup complete!')
  console.log('\n📋 Login credentials:')
  console.log('   Email: jared@boothmed.com')
  console.log('   Password: booth2026')
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
