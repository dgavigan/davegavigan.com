import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '../components/ThemeToggle'
import { MobileNav } from '../components/MobileNav'

const experience = [
  {
    company: 'Tecovas',
    role: 'Engineering Manager, Backend Systems',
    period: '2024 —',
    tech: ['Systems Integration', 'E-Commerce', 'TypeScript', 'Node.js'],
    desc: 'Architecting and managing the integration layer that connects retail storefronts to fulfillment, inventory, ERP, and operational tooling for a high-growth DTC brand.',
    current: true,
    timeline: [
      { title: 'Engineering Manager, Backend Systems', period: '2025 —' },
      { title: 'Principal Core Systems Engineer', period: '2024 — 25' },
    ],
  },
  {
    company: 'Extend',
    role: 'Engineering Manager',
    period: '2021 — 23',
    tech: ['React', 'Remix', 'AWS', 'DynamoDB', 'TypeScript'],
    desc: 'Owned the merchant-facing web platform for warranty program management. Built and led a team of 6 fullstack engineers, drove org-wide adoption of Remix, and set front-end quality standards that became the default across engineering.',
    metrics: ['75th %ile annual story points', '85th %ile sprint completion', '92nd %ile defect resolution'],
  },
  {
    company: 'Whole Foods Market',
    role: 'Senior Engineer',
    period: '2019 — 21',
    tech: ['React', 'Angular', 'Web Components', 'C#', 'AWS'],
    desc: 'Designed and shipped a cross-framework design system using web components with React and Angular bindings — giving teams autonomy while enforcing consistency. Led the pilot that replaced legacy handhelds with modern in-store mobile apps.',
  },
  {
    company: 'Rent.com',
    role: 'Senior Engineer',
    period: '2018 — 19',
    tech: ['React', 'TypeScript', 'GraphQL', 'Ruby on Rails'],
    desc: 'Delivered high-performance features on a platform with millions of monthly visitors. Key contributor to a Rails rewrite that introduced feature flags and A/B testing, directly improving conversion rates and site performance.',
  },
  {
    company: 'Independent Consulting',
    role: 'Web & Mobile Engineer',
    period: '2017 — 18',
    tech: ['Shopify', 'React Native', 'Ionic', 'React'],
    desc: 'Built headless Shopify e-commerce experiences for retail brands. Mentored early-stage founders on technology decisions and provided hands-on React and Angular training.',
  },
  {
    company: 'SensorInsight',
    role: 'Lead Engineer',
    period: '2014 — 17',
    tech: ['AngularJS', 'Java EE', 'MQTT', 'PostgreSQL', 'AWS'],
    desc: 'First engineering hire. Grew and led a distributed team of 8-10 developers building an enterprise IoT platform from scratch. Individually designed the web app UX, JavaScript SDK, and all frontend tooling. Regularly translated exec vision into technical specs.',
  },
  {
    company: 'ClearBlade',
    role: 'Mobile Consultant & Web Engineer',
    period: '2012 — 14',
    tech: ['Cordova', 'AngularJS', 'Go', 'MQTT'],
    desc: 'Modernized IBM System Z mainframe clients onto web and mobile. Early adopter of cross-platform mobile development with Apache Cordova and AngularJS.',
  },
]

const quotes = [
  { text: "Dave built a great team and developed some of Extend's most impactful B2B technologies!", who: 'Lucas Gacek', title: 'Product Leader' },
  { text: "It's possible to be both an outstanding manager and highly skilled engineer. Dave proves it.", who: 'Bill Hefty', title: 'Software Engineer' },
  { text: "A remarkable blend of technical prowess, industry knowledge, and emotional intelligence.", who: 'Aaron Deane', title: 'Software Engineer' },
  { text: "Dave makes working together easy. Driven, considerate, best solution for everyone.", who: 'Heather Nelson', title: 'Software Architect' },
]

const skillGroups = [
  { label: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Remix', 'Angular'] },
  { label: 'Backend', skills: ['Node.js', 'Go', 'PostgreSQL', 'DynamoDB', 'GraphQL', 'REST APIs'] },
  { label: 'E-Commerce', skills: ['Shopify Plus', 'Liquid', 'Headless Commerce', 'Systems Integration'] },
  { label: 'AI & Tooling', skills: ['AI Agents', 'LLM Integration', 'Workflow Automation', 'Prompt Engineering'] },
  { label: 'Infrastructure', skills: ['AWS', 'Docker', 'GitHub Actions', 'Vercel', 'CI/CD'] },
]

export default function AboutPage() {
  return (
    <main className="relative">
      <div className="grain absolute inset-0 pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">dg</Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/about" className="text-[var(--text-primary)] font-medium">About</Link>
            <Link href="/work" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Work With Me</Link>
            <Link href="/login" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Client Login</Link>
            <ThemeToggle />
          </div>
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-14">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-[var(--border)] shrink-0">
            <Image src="/assets/me.jpg" alt="Dave Gavigan" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Dave Gavigan</h1>
            <p className="text-sm text-[var(--text-muted)] mb-2">Software Developer · Austin, TX</p>
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-medium">Available for projects</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-4 text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-16">
          <p>
            I&apos;ve been building software since 2012. Started at startups building IoT platforms from scratch, moved through e-commerce, enterprise supply chain, and warranty tech. Today I manage backend systems engineering at <span className="text-[var(--text-primary)] font-medium">Tecovas</span> — owning the integration layer that connects retail storefronts to everything else.
          </p>
          <p>
            Along the way I&apos;ve managed engineering teams, built design systems used across orgs, shipped products with millions of users, and consistently been the person who bridges the gap between business goals and technical execution.
          </p>
        </div>

        {/* Skills */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Skills</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-primary)] mb-3">{group.label}</h3>
                <div className="space-y-1.5">
                  {group.skills.map((skill) => (
                    <div key={skill} className="text-sm text-[var(--text-secondary)]">{skill}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Experience</h2>
          <div className="space-y-3">
            {experience.map((job) => (
              <div
                key={job.company + job.role}
                className={`p-5 rounded-xl border transition-all ${
                  job.current
                    ? 'border-[var(--text-primary)]/15 bg-[var(--bg-secondary)]'
                    : 'border-[var(--border)] hover:border-[var(--text-muted)]/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold">{job.role}</h3>
                      {job.current && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold uppercase tracking-wider">Now</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{job.company}</p>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">{job.period}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{job.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.tech.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--text-muted)]">{t}</span>
                  ))}
                </div>
                {job.timeline && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
                    {job.timeline.map((t: { title: string; period: string }) => (
                      <div key={t.title} className="flex items-center justify-between">
                        <span className="text-[11px] text-[var(--text-secondary)]">{t.title}</span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{t.period}</span>
                      </div>
                    ))}
                  </div>
                )}
                {job.metrics && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-[var(--border)]">
                    {job.metrics.map((m) => (
                      <span key={m} className="text-[11px] text-[var(--text-muted)]">
                        <span className="text-[var(--text-primary)] font-medium">↗</span> {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Education</h2>
          <div className="p-5 rounded-xl border border-[var(--border)]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-semibold">BBA, Computer Information Systems</h3>
                <p className="text-sm text-[var(--text-muted)]">Texas State University · San Marcos, TX</p>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">2007 — 12</span>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Kind Words</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quotes.map((q) => (
              <div key={q.who} className="p-5 rounded-xl border border-[var(--border)] hover:border-[var(--text-muted)]/30 transition-all">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic mb-3">&ldquo;{q.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  <p className="text-xs text-[var(--text-muted)]">{q.who}, {q.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-[var(--border)] pt-10 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-5">Interested in working together?</p>
          <Link href="/work" className="inline-block px-8 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all">
            Work With Me →
          </Link>
        </div>
      </div>
    </main>
  )
}
