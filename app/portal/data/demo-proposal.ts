// Demo proposal for showcasing the portal - NOT a real client
export const demoProposal = {
  id: 'demo-acme-2026',
  client: 'Acme Medical Supply',
  clientContact: 'Alex Thompson',
  title: 'Phase I: Foundation & Discovery',
  date: 'March 15, 2026',
  validUntil: 'March 29, 2026',
  status: 'pending' as const,

  summary: 'Phase I tackles the known problems — site rebuild, bugs, mobile, SEO — while I research the unknowns. Phase II delivers the ShipperHQ fixes and unlocks the Shopify Plus features you\'re paying for (B2B, abandoned carts, etc.), with real estimates based on what I learn.',

  concerns: [
    'Bugs and UX issues that keep piling up',
    'Mobile experience isn\'t where it needs to be',
    'SEO audit recommendations haven\'t been implemented',
    'ShipperHQ causing friction at checkout',
    'Shopify Plus features you\'re paying for but not using (B2B, abandoned carts, analytics)',
  ],

  whyRebuild: 'Even if we fix the reported bugs, the layout itself is working against you — mega menu, navigation, overall structure. It\'s not set up to convert. AI-assisted development has changed the math. I can build a clean theme faster than I can untangle what\'s there.',

  scope: [
    {
      phase: 'Onboarding & Audit',
      desc: 'Happens in parallel with theme development. I dig into your Shopify admin, ShipperHQ config, and Shopify Plus feature state while building — so Phase II estimates are real numbers, not guesses.',
      deliverables: [
        'Complete Shopify admin review',
        'ShipperHQ root cause diagnosis',
        'Shopify Plus feature assessment (B2B, abandoned carts, analytics — current state vs potential)',
        'Written audit report with Phase II scope & estimates',
      ],
      hours: '~25 hours',
      price: 2200,
    },
    {
      phase: 'Theme Development',
      desc: 'Complete site delivery — not a "basic" site, but the polished, functional site you\'ve been asking for. All reported bugs fixed, all core features working.',
      deliverables: [
        'Bug fixes — all reported issues',
        'Homepage — promotions featured, real categories, trust signals',
        'Shop/PLP — smart filters, sorting, search',
        'Product pages — variants, pricing, financing callouts',
        'Custom landing page templates — flexible, reusable for promos/campaigns',
        'Promotions page — manufacturer rebates, trade-in offers',
        'SEO optimization — all audit findings addressed',
        'Mobile responsive — works on everything',
        'Standard customer accounts — Shopify native',
      ],
      hours: '~45-50 hours',
      price: 4300,
    },
  ],

  revisions: {
    included: 2,
    additionalPrice: 750,
    note: '2 revision sessions included. Additional rounds available at $750 each.',
  },

  discoveryDetails: {
    shipperHQ: {
      title: 'ShipperHQ',
      problem: 'I know it\'s causing checkout issues, but I don\'t know the root cause yet.',
      possibilities: [
        'Could be a small config tweak',
        'Could be shipping rules that need reworking',
        'Could be that ShipperHQ isn\'t the right tool',
      ],
      range: '$500 - $4,000',
    },
    shopifyPlus: {
      title: 'Shopify Plus Features',
      problem: 'B2B customer portal, abandoned cart recovery, analytics — these are built into your plan but need admin configuration and theme work to actually use.',
      possibilities: [
        'Need to see what\'s already set up before I can scope it',
        'Could be quick wins, could be more involved',
        'Depends on current configuration state',
      ],
      range: '$2,000 - $4,000',
    },
  },

  phaseII: {
    title: 'Phase II: Shopify Plus Features & Shipping Optimization',
    rangeMin: 2500,
    rangeMax: 8000,
    note: 'Priced accurately after Phase I discovery. No guessing.',
  },

  pricing: {
    comparison: 'For reference — this typically runs $12-15K at an agency, or $125+/hr with a senior freelancer. I\'m coming in well under that.',
    reason: 'AI-assisted development has changed the math. That prototype? Took hours, not weeks. I\'m passing that efficiency to you.',
  },

  payment: {
    terms: [
      { milestone: 'Rough draft delivery', amount: 4550 },
      { milestone: 'After revisions are complete', amount: 1950 },
    ],
    note: 'No deposit — you don\'t pay until you see work.',
    support: '30 days support included after go-live.',
  },

  timeline: '4-5 weeks from kickoff to launch',
}

// Demo project for showing active project management
export const demoProject = {
  id: 'demo-acme-2026',
  name: 'Acme Medical Supply - Phase I',
  client: 'Acme Medical Supply',
  status: 'in-progress' as const,
  startDate: '2026-03-18',
  estimatedEnd: '2026-04-22',
  
  phases: [
    {
      name: 'Onboarding & Audit',
      status: 'in-progress' as const,
      progress: 60,
      tasks: [
        { name: 'Shopify admin access', done: true },
        { name: 'ShipperHQ access', done: true },
        { name: 'Initial config review', done: true },
        { name: 'Root cause analysis', done: false },
        { name: 'Audit report draft', done: false },
      ]
    },
    {
      name: 'Theme Development',
      status: 'in-progress' as const,
      progress: 35,
      tasks: [
        { name: 'Homepage build', done: true },
        { name: 'Shop/PLP filters', done: true },
        { name: 'Product pages', done: false },
        { name: 'Promotions page', done: false },
        { name: 'Mobile optimization', done: false },
        { name: 'SEO implementation', done: false },
      ]
    },
    {
      name: 'Revisions',
      status: 'pending' as const,
      progress: 0,
      tasks: [
        { name: 'Round 1 feedback', done: false },
        { name: 'Round 1 implementation', done: false },
        { name: 'Round 2 feedback', done: false },
        { name: 'Round 2 implementation', done: false },
      ]
    },
    {
      name: 'Launch',
      status: 'pending' as const,
      progress: 0,
      tasks: [
        { name: 'Final QA', done: false },
        { name: 'Go-live', done: false },
        { name: 'Post-launch support', done: false },
      ]
    }
  ],

  recentActivity: [
    { date: '2026-03-22', action: 'Completed shop page filters implementation' },
    { date: '2026-03-21', action: 'Homepage draft ready for review' },
    { date: '2026-03-20', action: 'ShipperHQ config review started' },
    { date: '2026-03-18', action: 'Project kickoff' },
  ],

  nextMilestone: {
    name: 'Rough Draft Delivery',
    date: '2026-04-01',
    payment: 4550,
  }
}

export const totalPrice = demoProposal.scope.reduce((sum, s) => sum + s.price, 0)
export const totalHours = '70-75'
