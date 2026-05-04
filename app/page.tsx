import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from './components/ThemeToggle'
import { MobileNav } from './components/MobileNav'

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] relative">
      {/* Subtle grain texture overlay */}
      <div className="grain absolute inset-0 pointer-events-none" />

      {/* Nav — minimal, floating */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            dg
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">About</Link>
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

      {/* Card — centered */}
      <section className="relative z-10 min-h-[100dvh] flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          {/* Photo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-1 ring-[var(--border)]">
                <Image
                  src="/assets/me.jpg"
                  alt="Dave Gavigan"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-[var(--bg-primary)]" />
            </div>
          </div>

          {/* Name */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Dave Gavigan</h1>
            <p className="text-sm text-[var(--text-muted)] tracking-wide">Software Developer · Austin, TX</p>
          </div>

          {/* Bio */}
          <p className="text-center text-[15px] text-[var(--text-secondary)] leading-relaxed mb-10 px-4">
            Experienced engineer building AI-powered tools, e-commerce platforms, and digital products.
          </p>

          {/* Actions */}
          <div className="flex gap-3 mb-10">
            <Link
              href="/about"
              className="flex-1 py-3 text-center text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--text-muted)] transition-all"
            >
              About
            </Link>
            <Link
              href="/work"
              className="flex-1 py-3 text-center text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all"
            >
              Work With Me
            </Link>
          </div>

          {/* Links — horizontal, minimal */}
          <div className="flex items-center justify-center gap-1 mb-10">
            {[
              { href: 'https://github.com/dgavigan', label: 'GitHub', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
              { href: 'https://linkedin.com/in/davidgavigan', label: 'LinkedIn', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
              { href: 'https://x.com/davegavigan', label: 'X', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
              { href: 'mailto:davegavigan@gmail.com', label: 'Email', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg> },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                aria-label={link.label}
              >
                {link.icon}
              </Link>
            ))}
          </div>

          {/* TSL callout */}
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)]">
              I teach at{' '}
              <Link href="https://thestartuplab.io" target="_blank" className="underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors">
                The Startup Lab
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
