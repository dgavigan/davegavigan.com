'use client'

import { useState } from 'react'

type MilestoneStatus = 'completed' | 'review' | 'revising' | 'active' | 'upcoming'

interface Revision {
  round: number
  requestedAt: string
  summary: string
  status: 'pending' | 'in-progress' | 'completed'
}

interface Milestone {
  name: string
  status: MilestoneStatus
  description: string
  revisionsIncluded: number
  revisionsUsed: number
  revisions: Revision[]
  tasks: { name: string; done: boolean }[]
  aiSuggestions?: string[]
}

const initialMilestones: Milestone[] = [
  {
    name: 'Discovery & Requirements',
    status: 'completed',
    description: 'Understanding your business, competitors, and goals. Documenting everything needed to build the right thing.',
    revisionsIncluded: 2,
    revisionsUsed: 1,
    revisions: [
      { round: 1, requestedAt: 'Mar 18', summary: 'Add bulk order quote request form for hospital clients. Expand sitemap to include B2B landing page.', status: 'completed' },
    ],
    tasks: [
      { name: 'Initial discovery call', done: true },
      { name: 'Requirements document', done: true },
      { name: 'Sitemap & information architecture', done: true },
      { name: 'Design direction approval', done: true },
    ],
  },
  {
    name: 'Design & Prototyping',
    status: 'review',
    description: 'Wireframes, high-fidelity mockups, and interactive prototypes for review and approval.',
    revisionsIncluded: 2,
    revisionsUsed: 0,
    revisions: [],
    tasks: [
      { name: 'Wireframes', done: true },
      { name: 'High-fidelity mockups', done: true },
      { name: 'Design review & approval', done: false },
    ],
    aiSuggestions: [
      'Make freight shipping calculator more prominent on product pages (mentioned 3x in updates)',
      'Mobile navigation needs to surface product categories faster (Sarah, Mar 22)',
      'Hero section — consider showing equipment in-use photos vs white background (Jared, Mar 21)',
    ],
  },
  {
    name: 'Development',
    status: 'upcoming',
    description: 'Building the Shopify store — theme, products, shipping, payments, and all custom functionality.',
    revisionsIncluded: 2,
    revisionsUsed: 0,
    revisions: [],
    tasks: [
      { name: 'Shopify theme build', done: false },
      { name: 'Product catalog setup', done: false },
      { name: 'Freight shipping integration', done: false },
      { name: 'Payment & checkout configuration', done: false },
      { name: 'Content migration', done: false },
    ],
  },
  {
    name: 'Launch & Handoff',
    status: 'upcoming',
    description: 'Testing, final review, go-live, and training so you can run everything yourself.',
    revisionsIncluded: 2,
    revisionsUsed: 0,
    revisions: [],
    tasks: [
      { name: 'QA testing', done: false },
      { name: 'Client review & approval', done: false },
      { name: 'DNS & go-live', done: false },
      { name: 'Training & documentation', done: false },
    ],
  },
]

function StatusBadge({ status }: { status: MilestoneStatus }) {
  const styles = {
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    review: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    revising: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    active: 'bg-[var(--accent)]/10 text-[var(--text-primary)] border-[var(--accent)]/20',
    upcoming: 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border)]',
  }
  const labels = {
    completed: 'Completed ✓',
    review: 'Ready for Review',
    revising: 'Revising',
    active: 'In Progress',
    upcoming: 'Upcoming',
  }
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function MilestonesPage() {
  const [milestones] = useState(initialMilestones)
  const [showRevisionForm, setShowRevisionForm] = useState<string | null>(null)
  const [revisionText, setRevisionText] = useState('')
  const [showUpsell, setShowUpsell] = useState<string | null>(null)

  const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0)
  const completedTasks = milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.done).length, 0)

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Milestones</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Project Roadmap</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {completedTasks} of {totalTasks} tasks completed across {milestones.length} milestones
        </p>
      </div>

      {/* Overall progress */}
      <div className="p-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-card)] mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Overall Progress</span>
          <span className="text-xs font-mono font-bold">{Math.round((completedTasks / totalTasks) * 100)}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--text-primary)]" style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        {milestones.map((m, index) => {
          const done = m.tasks.filter(t => t.done).length
          const total = m.tasks.length
          const isReview = m.status === 'review'
          const revisionsLeft = m.revisionsIncluded - m.revisionsUsed
          const isUpcoming = m.status === 'upcoming'

          return (
            <div
              key={m.name}
              className={`rounded-2xl border-2 bg-[var(--bg-card)] overflow-hidden transition-all ${
                isReview ? 'border-amber-500/40' :
                m.status === 'completed' ? 'border-emerald-500/20' :
                m.status === 'active' ? 'border-[var(--text-primary)]/20' :
                'border-[var(--border)]'
              } ${isUpcoming ? 'opacity-50' : ''}`}
            >
              {/* Header */}
              <div className="p-5 md:p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    m.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' :
                    isReview ? 'border-amber-500/30 bg-amber-500/10 text-amber-600' :
                    'border-[var(--border)] text-[var(--text-muted)]'
                  }`}>
                    {m.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-base font-bold">{m.name}</h2>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{m.description}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="ml-11">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-muted)]">{done}/{total} tasks</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        m.status === 'completed' ? 'bg-emerald-500' :
                        isReview ? 'bg-amber-500' :
                        'bg-[var(--text-primary)]'
                      }`}
                      style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Review prompt */}
              {isReview && (
                <div className="mx-5 md:mx-6 mb-4 p-4 rounded-xl border-2 border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">👀</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-1">This milestone is ready for your review</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-3">
                        Review the deliverables and either approve to move forward or request revisions. You have <strong>{revisionsLeft} of {m.revisionsIncluded} revision rounds</strong> remaining for this milestone.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:opacity-80 transition-all">
                          Approve & Continue ✓
                        </button>
                        <button
                          onClick={() => setShowRevisionForm(showRevisionForm === m.name ? null : m.name)}
                          className="px-4 py-2 text-xs font-medium border-2 border-[var(--border)] rounded-lg hover:border-amber-500/30 transition-all"
                        >
                          Request Revisions ({revisionsLeft} remaining)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI-suggested feedback */}
                  {m.aiSuggestions && showRevisionForm !== m.name && (
                    <div className="mt-4 pt-3 border-t border-amber-500/10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs">🤖</span>
                        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Feedback captured from your comments</span>
                      </div>
                      <ul className="space-y-1.5">
                        {m.aiSuggestions.map((s, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Revision request form */}
              {showRevisionForm === m.name && (
                <div className="mx-5 md:mx-6 mb-4 p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-secondary)]">
                  <h3 className="text-sm font-semibold mb-1">Request Revisions — Round {m.revisionsUsed + 1} of {m.revisionsIncluded}</h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3">Describe what needs to change. We&apos;ve pre-loaded feedback from your comments.</p>

                  {/* Pre-populated from AI */}
                  <div className="mb-3">
                    {m.aiSuggestions?.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded" />
                        <span className="text-xs text-[var(--text-secondary)]">{s}</span>
                      </div>
                    ))}
                  </div>

                  <textarea
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    placeholder="Anything else to add..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none transition-colors resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all">
                      Submit Revision Request
                    </button>
                    <button onClick={() => setShowRevisionForm(null)} className="px-4 py-2 text-xs text-[var(--text-muted)]">Cancel</button>
                  </div>
                </div>
              )}

              {/* Completed revisions history */}
              {m.revisions.length > 0 && (
                <div className="mx-5 md:mx-6 mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Revision History</div>
                  {m.revisions.map((r) => (
                    <div key={r.round} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] mb-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Round {r.round}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[var(--text-muted)]">{r.requestedAt}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                            r.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-amber-500/10 text-amber-600'
                          }`}>{r.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{r.summary}</p>
                    </div>
                  ))}
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">
                    {revisionsLeft > 0
                      ? `${revisionsLeft} of ${m.revisionsIncluded} revision rounds remaining`
                      : '0 revision rounds remaining'
                    }
                  </div>
                </div>
              )}

              {/* Upsell when revisions are used up */}
              {m.revisionsUsed >= m.revisionsIncluded && m.status !== 'upcoming' && (
                <div className="mx-5 md:mx-6 mb-4 p-4 rounded-xl border-2 border-dashed border-[var(--border)]">
                  <div className="flex items-start gap-3">
                    <div className="text-lg">🔄</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-0.5">Need more revisions?</h3>
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        You&apos;ve used both included revision rounds for this milestone. Additional rounds are available.
                      </p>
                      <button
                        onClick={() => setShowUpsell(showUpsell === m.name ? null : m.name)}
                        className="px-4 py-2 text-xs font-medium border-2 border-[var(--border)] rounded-lg hover:border-[var(--text-muted)] transition-all"
                      >
                        Add Revision Round — $350
                      </button>
                      {showUpsell === m.name && (
                        <div className="mt-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
                          <p className="text-xs text-[var(--text-secondary)] mb-2">This adds one additional revision round to this milestone. Dave will review and implement your changes within the original scope.</p>
                          <button className="px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all">
                            Confirm & Pay $350
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div className="border-t-2 border-[var(--border)] bg-[var(--bg-secondary)]/50 px-5 md:px-6 py-3">
                <div className="ml-11 space-y-2">
                  {m.tasks.map((t) => (
                    <div key={t.name} className="flex items-center gap-2.5 text-sm py-0.5">
                      <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        t.done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-[var(--border)] bg-[var(--bg-card)]'
                      }`}>
                        {t.done && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        )}
                      </div>
                      <span className={t.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
