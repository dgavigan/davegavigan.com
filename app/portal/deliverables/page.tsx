'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Deliverable {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  url: string | null
  createdAt: string
}

interface DeliverablesData {
  projectName: string
  deliverables: Deliverable[]
}

const typeIcons: Record<string, string> = {
  preview: '🖥️',
  document: '📄',
  design: '🎨',
  code: '💻',
  report: '📋',
  other: '📦',
}

const statusStyles: Record<string, string> = {
  ready: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  review: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  pending: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

export default function DeliverablesPage() {
  const [data, setData] = useState<DeliverablesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliverables()
  }, [])

  const fetchDeliverables = async () => {
    try {
      const res = await fetch('/api/portal/deliverables')
      if (res.ok) {
        const deliverablesData = await res.json()
        setData(deliverablesData)
      }
    } catch (err) {
      console.error('Failed to load deliverables')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Loading deliverables...</p>
      </div>
    )
  }

  const ready = data?.deliverables.filter(d => d.status === 'ready') || []
  const pending = data?.deliverables.filter(d => d.status !== 'ready') || []

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Deliverables</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Files & Assets</h1>
        <p className="text-sm text-[var(--text-secondary)]">Everything produced during your project. Download or preview anytime.</p>
      </div>

      {/* Ready for review */}
      {ready.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Ready for Review</h2>
          <div className="grid gap-3">
            {ready.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] flex items-center gap-4">
                <span className="text-2xl">{typeIcons[item.type.toLowerCase()] || typeIcons.other}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusStyles[item.status] || statusStyles.pending}`}>
                      {item.status}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-[var(--text-muted)] truncate">{item.description}</p>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(item.createdAt)}</p>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
                  >
                    View →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">In Progress</h2>
          <div className="grid gap-3">
            {pending.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]/50 flex items-center gap-4 opacity-60">
                <span className="text-2xl">{typeIcons[item.type.toLowerCase()] || typeIcons.other}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate">{item.name}</span>
                  {item.description && (
                    <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                  )}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusStyles[item.status] || statusStyles.pending}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!data?.deliverables || data.deliverables.length === 0) && (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
          <span className="text-3xl mb-3 block">📦</span>
          <p className="text-[var(--text-muted)]">No deliverables yet.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Files and assets will appear here as your project progresses.</p>
        </div>
      )}
    </div>
  )
}
