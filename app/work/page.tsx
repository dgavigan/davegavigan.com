import Link from 'next/link'
import { ThemeToggle } from '../components/ThemeToggle'
import { MobileNav } from '../components/MobileNav'

const services = [
  {
    title: 'E-Commerce & Shopify',
    desc: 'Custom Shopify Plus builds, migrations, headless commerce, theme development, and performance optimization.',
    deliverables: ['Custom themes', 'Migrations', 'App development', 'Performance audits'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    ),
  },
  {
    title: 'AI Integration',
    desc: 'Production AI tools — agents, automation, chatbots, and intelligent workflows that replace manual work.',
    deliverables: ['Custom agents', 'Automation', 'Chatbots', 'Strategy'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
  },
  {
    title: 'Web Applications',
    desc: 'Full-stack web apps from zero to production. React, Next.js, Node, databases, auth, payments — shipped.',
    deliverables: ['MVPs', 'Full-stack apps', 'APIs', 'Architecture'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
]

export default function WorkPage() {
  return (
    <main className="relative">
      <div className="grain absolute inset-0 pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">dg</Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">About</Link>
            <Link href="/work" className="text-[var(--text-primary)] font-medium">Work With Me</Link>
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
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 leading-tight">
            Seasoned expertise.<br />
            <span className="text-[var(--text-muted)]">No agency overhead.</span>
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] max-w-xl">
            I take on select projects directly. You get one person who actually builds the thing — no account managers, no handoffs, no surprises. Fixed pricing. Milestone payments. Full visibility.
          </p>
        </div>

        {/* Services */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Services</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {services.map((s) => (
              <div key={s.title} className="group p-5 rounded-xl border border-[var(--border)] hover:border-[var(--text-muted)]/30 transition-all">
                <div className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--text-muted)]/30 transition-all mb-4">
                  {s.icon}
                </div>
                <h3 className="text-[15px] font-semibold mb-2">{s.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.deliverables.map((d) => (
                    <span key={d} className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--text-muted)]">{d}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Process</h2>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[18px] top-8 bottom-8 w-px bg-[var(--border)] hidden md:block" />

            <div className="space-y-0">
              {[
                { num: '01', title: 'Discovery', desc: 'Free 30-minute call. You tell me what you need, I tell you honestly if I\'m the right fit.' },
                { num: '02', title: 'Scope & Quote', desc: 'Detailed scope document with fixed pricing. No hourly billing. You know exactly what you\'re paying before we start.' },
                { num: '03', title: 'Build & Track', desc: 'I build. You track everything in your client portal — milestones, tasks, deliverables, all in real time.' },
                { num: '04', title: 'Ship & Support', desc: 'Production-ready delivery with documentation. 30 days of bug support included.' },
              ].map((s, i) => (
                <div key={s.num} className={`flex gap-5 py-5 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                  <div className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-xs font-mono text-[var(--text-muted)] shrink-0 bg-[var(--bg-primary)] relative z-10">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why not an agency */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Why Not an Agency?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Agency', items: ['Account manager relays your feedback', 'Junior dev does the work', 'Hourly billing adds up', 'Slow communication loops'] },
              { label: 'Working with me', items: ['You talk to the person building it', 'Senior engineer from day one', 'Fixed price, no surprises', 'Direct Slack/email, same day'] },
            ].map((col) => (
              <div key={col.label} className={`p-5 rounded-xl border ${col.label === 'Agency' ? 'border-[var(--border)] opacity-60' : 'border-[var(--text-primary)]/15 bg-[var(--bg-secondary)]'}`}>
                <h3 className={`text-xs uppercase tracking-wider mb-4 ${col.label === 'Agency' ? 'text-[var(--text-muted)]' : 'font-semibold'}`}>{col.label}</h3>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${col.label === 'Agency' ? 'bg-[var(--border)]' : 'bg-[var(--text-primary)]'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Client portal callout */}
        <div className="mb-16 p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg border border-[var(--border)] flex items-center justify-center text-lg shrink-0 bg-[var(--bg-primary)]">
              📊
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold mb-0.5">Every client gets a portal</h3>
              <p className="text-sm text-[var(--text-muted)]">Track your project milestones, download deliverables, and view invoices — all in one place.</p>
            </div>
            <Link href="/portal" className="text-sm font-medium text-[var(--text-primary)] underline underline-offset-2 shrink-0 hover:opacity-70 transition-all">
              See demo →
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Get in touch</h2>
          <div className="p-6 rounded-xl border border-[var(--border)]">
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Name" className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none transition-colors" />
                <input type="email" placeholder="Email" className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none transition-colors" />
              </div>
              <select className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-lg text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none transition-colors">
                <option>What do you need?</option>
                <option>E-Commerce / Shopify</option>
                <option>AI Integration</option>
                <option>Web Application</option>
                <option>Consulting / Strategy</option>
                <option>Something else</option>
              </select>
              <textarea placeholder="Tell me about your project..." rows={4} className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none transition-colors resize-none" />
              <button className="w-full py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all">
                Send Message
              </button>
            </div>
            <p className="text-center text-xs text-[var(--text-muted)] mt-4">
              or{' '}
              <Link href="mailto:davegavigan@gmail.com" className="underline underline-offset-2">davegavigan@gmail.com</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
