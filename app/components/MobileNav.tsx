'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 text-[var(--text-secondary)]" aria-label="Menu">
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-xl p-6 flex flex-col gap-4 shadow-xl">
          <Link href="/about" onClick={() => setOpen(false)} className="text-[var(--text-primary)] font-medium py-2">About Me</Link>
          <Link href="/work" onClick={() => setOpen(false)} className="text-[var(--text-primary)] font-medium py-2">Work With Me</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="text-[var(--text-primary)] font-medium py-2">Client Login</Link>
        </div>
      )}
    </div>
  )
}
