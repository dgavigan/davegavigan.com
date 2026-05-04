'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { demoProposal, totalPrice, totalHours } from '../../data/demo-proposal'

const proposal = demoProposal

export default function DemoProposalPage() {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-primary)] sticky top-[28px] z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/assets/me.jpg" alt="DG" width={28} height={28} className="rounded-full ring-1 ring-[var(--border)]" />
            <span className="text-sm font-medium">Dave Gavigan</span>
            <span className="text-xs text-[var(--text-muted)]">·</span>
            <span className="text-xs text-[var(--text-muted)]">Proposal</span>
          </div>
          <div className="flex items-center gap-3">
            {proposal.status === 'pending' && !accepted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-500/5 font-medium">Awaiting Response</span>
            )}
            {accepted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-600 bg-emerald-500/5 font-medium">Accepted ✓</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Title block */}
        <div className="mb-10">
          <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Proposal for {proposal.client}</p>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">{proposal.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
            <span>Prepared {proposal.date}</span>
            <span>·</span>
            <span>Valid until {proposal.validUntil}</span>
          </div>
        </div>

        {/* What I'm hearing */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">What I&apos;m Hearing</h2>
          <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
            <p className="text-sm text-[var(--text-secondary)] mb-3">Your main concerns:</p>
            <ul className="space-y-2">
              {proposal.concerns.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="text-red-500 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Two-phase approach */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">My Approach</h2>
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              <strong>I&apos;m proposing we do this in two phases.</strong>
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{proposal.summary}</p>
          </div>
        </div>

        {/* Phase overview cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="p-5 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Phase I</h3>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${totalPrice.toLocaleString()}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Fix the knowns, research the unknowns</p>
          </div>
          <div className="p-5 rounded-xl border-2 border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Phase II</h3>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${proposal.phaseII.rangeMin.toLocaleString()} - ${proposal.phaseII.rangeMax.toLocaleString()}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Shopify Plus features & shipping optimization</p>
          </div>
        </div>

        {/* Why discovery needed */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Why These Need Discovery</h2>
          <div className="space-y-4">
            {Object.values(proposal.discoveryDetails).map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400">{item.title}</h3>
                  <span className="text-sm font-mono text-amber-600 dark:text-amber-400">{item.range}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{item.problem}</p>
                <ul className="space-y-1">
                  {item.possibilities.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                      <span className="text-amber-500 shrink-0">→</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-4 italic">I&apos;d rather dig in first than make up a number.</p>
        </div>

        {/* Why rebuild */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Why Rebuild Instead of Patching</h2>
          <div className="p-5 rounded-xl border border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{proposal.whyRebuild}</p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{proposal.pricing.reason}</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{proposal.pricing.comparison}</p>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">
                <strong>Prototype:</strong>{' '}
                <a href="https://medequip-prototype.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
                  medequip-prototype.vercel.app
                </a>
                <span className="ml-2 text-[var(--text-muted)]">— High-fidelity mockup for look and feel</span>
              </p>
            </div>
          </div>
        </div>

        {/* Scope & Pricing */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Phase I Scope & Investment</h2>
          <div className="space-y-4">
            {proposal.scope.map((phase, i) => (
              <div key={phase.phase} className="p-6 rounded-xl border border-[var(--border)] hover:border-[var(--text-muted)]/30 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-sm font-mono text-[var(--text-muted)] shrink-0 bg-[var(--bg-secondary)]">
                      {i + 1}
                    </div>
                    <h3 className="text-[16px] font-semibold">{phase.phase}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold">${phase.price.toLocaleString()}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{phase.hours}</div>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 ml-11">{phase.desc}</p>
                <div className="ml-11">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Deliverables</div>
                  <ul className="space-y-1.5">
                    {phase.deliverables.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="text-emerald-500 shrink-0">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Revisions */}
          <div className="mt-4 p-4 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔄</span>
              <span className="text-sm text-[var(--text-secondary)]">{proposal.revisions.note}</span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 p-6 rounded-xl border-2 border-[var(--text-primary)]/15 bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Phase I Total</div>
                <div className="text-xs text-[var(--text-muted)]">Fixed price · ~{totalHours} hours</div>
              </div>
              <div className="text-3xl font-bold">${totalPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Estimated Timeline</h2>
          <div className="p-5 rounded-xl border border-[var(--border)]">
            <div className="mb-4">
              {/* Parallel tracks */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-28 text-xs font-medium text-right shrink-0">Audit</div>
                  <div className="flex-1 h-6 rounded bg-blue-500/20 border border-blue-500/30 flex items-center px-2">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">Parallel — informs Phase II</span>
                  </div>
                  <div className="w-16"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 text-xs font-medium text-right shrink-0">Theme Dev</div>
                  <div className="flex-1 h-6 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center px-2">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Build & Launch</span>
                  </div>
                  <div className="w-16 h-6 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">Rev</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-2 px-28">
                <span>Week 1</span>
                <span>Week 3</span>
                <span>Week 4-5</span>
              </div>
            </div>
            <div className="text-sm text-[var(--text-secondary)] text-center border-t border-[var(--border)] pt-3 font-medium">
              {proposal.timeline}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Payment Terms</h2>
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="space-y-3 mb-4">
              {proposal.payment.terms.map((term, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{term.milestone}</span>
                  <span className="text-sm font-bold">${term.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-emerald-500/20 space-y-1">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{proposal.payment.note}</p>
              <p className="text-sm text-[var(--text-secondary)]">{proposal.payment.support}</p>
            </div>
          </div>
        </div>

        {/* Accept / Decline */}
        <div className="border-t border-[var(--border)] pt-10">
          {!accepted ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Ready to get started?</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">Accept the proposal to kick off the project.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setAccepted(true)}
                  className="px-8 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all"
                >
                  Accept Proposal
                </button>
                <Link href="mailto:davegavigan@gmail.com?subject=Question about proposal" className="px-8 py-3 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--text-muted)]/30 transition-all text-center">
                  I Have Questions
                </Link>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-4">Valid until {proposal.validUntil}</p>
            </div>
          ) : (
            <div className="text-center p-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-3xl mb-3">🎉</div>
              <h2 className="text-xl font-semibold mb-2">Proposal Accepted!</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">I&apos;ll be in touch to schedule kickoff and get started.</p>
              <Link href="/portal" className="text-sm font-medium underline underline-offset-2 text-[var(--accent)]">
                Go to your Portal →
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <Image src="/assets/me.jpg" alt="DG" width={20} height={20} className="rounded-full" />
            <span>Dave Gavigan · Austin, TX ·{' '}
              <Link href="https://davegavigan.com" className="underline underline-offset-2">davegavigan.com</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
