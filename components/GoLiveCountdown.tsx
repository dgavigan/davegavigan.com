'use client'

import { useEffect, useState } from 'react'

function daysUntil(target: Date): number {
  // endDate is a date-only value stored at UTC midnight. Compare UTC calendar
  // days so the countdown matches what we display (May 29 everywhere).
  const t = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  const now = new Date()
  const n = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((t - n) / (1000 * 60 * 60 * 24))
}

export function GoLiveCountdown({ endDate }: { endDate: string | Date | null | undefined }) {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    if (!endDate) return
    const compute = () => setDays(daysUntil(new Date(endDate)))
    compute()
    // Recompute on midnight rollover
    const id = setInterval(compute, 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [endDate])

  if (!endDate || days === null) return null

  const formatted = new Date(endDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const label =
    days > 1 ? `${days} days till Go-Live` :
    days === 1 ? 'Go-Live tomorrow' :
    days === 0 ? 'Go-Live today 🚀' :
    days === -1 ? 'Go-Live was yesterday' :
    `Go-Live was ${Math.abs(days)} days ago`

  return (
    <div className="p-5 rounded-2xl border-2 border-[var(--accent)]/30 bg-[var(--accent)]/5 mb-6 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--accent)] font-medium mb-1">
          Target Go-Live
        </p>
        <h3 className="text-lg font-bold">{label}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {formatted} — penciled in
        </p>
      </div>
      <div className="text-right">
        <div className="text-3xl md:text-4xl font-bold tabular-nums">{Math.max(days, 0)}</div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          {days === 1 ? 'day' : 'days'}
        </div>
      </div>
    </div>
  )
}
