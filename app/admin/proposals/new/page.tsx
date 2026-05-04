'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Phase {
  name: string
  price: number
  hours: string
  items: string[]
}

function ProposalEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Basic info
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [validDays, setValidDays] = useState('14')

  // Content sections
  const [concerns, setConcerns] = useState<string[]>([''])
  const [phases, setPhases] = useState<Phase[]>([
    { name: '', price: 0, hours: '', items: [''] }
  ])
  const [includes, setIncludes] = useState<string[]>([''])
  const [timeline, setTimeline] = useState('')
  const [depositPercent, setDepositPercent] = useState('70')

  const addConcern = () => setConcerns([...concerns, ''])
  const updateConcern = (idx: number, value: string) => {
    const updated = [...concerns]
    updated[idx] = value
    setConcerns(updated)
  }
  const removeConcern = (idx: number) => setConcerns(concerns.filter((_, i) => i !== idx))

  const addPhase = () => setPhases([...phases, { name: '', price: 0, hours: '', items: [''] }])
  const updatePhase = (idx: number, field: keyof Phase, value: any) => {
    const updated = [...phases]
    updated[idx] = { ...updated[idx], [field]: value }
    setPhases(updated)
  }
  const addPhaseItem = (phaseIdx: number) => {
    const updated = [...phases]
    updated[phaseIdx].items.push('')
    setPhases(updated)
  }
  const updatePhaseItem = (phaseIdx: number, itemIdx: number, value: string) => {
    const updated = [...phases]
    updated[phaseIdx].items[itemIdx] = value
    setPhases(updated)
  }

  const addInclude = () => setIncludes([...includes, ''])
  const updateInclude = (idx: number, value: string) => {
    const updated = [...includes]
    updated[idx] = value
    setIncludes(updated)
  }

  const calculateTotal = () => {
    return phases.reduce((sum, p) => sum + (p.price || 0), 0)
  }

  const handleSubmit = async () => {
    if (!projectId || !title) {
      setError('Project ID and title are required')
      return
    }

    setSaving(true)
    setError('')

    const total = parseInt(totalPrice) * 100 || calculateTotal()
    const deposit = Math.round(total * (parseInt(depositPercent) / 100))

    const content = {
      summary,
      concerns: concerns.filter(c => c.trim()),
      phases: phases.filter(p => p.name).map(p => ({
        name: p.name,
        price: p.price * 100,
        hours: p.hours,
        items: p.items.filter(i => i.trim()),
      })),
      includes: includes.filter(i => i.trim()),
      timeline,
      payment: {
        deposit,
        final: total - deposit,
        depositNote: `${depositPercent}% to start`,
        finalNote: `${100 - parseInt(depositPercent)}% at launch`,
      },
    }

    try {
      const res = await fetch('/api/admin/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title,
          summary,
          totalPrice: total,
          validUntil: new Date(Date.now() + parseInt(validDays) * 24 * 60 * 60 * 1000).toISOString(),
          content: JSON.stringify(content),
        }),
      })

      if (!res.ok) throw new Error('Failed to create proposal')
      
      router.push('/admin')
    } catch (err) {
      setError('Failed to create proposal')
    } finally {
      setSaving(false)
    }
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-muted)] mb-4">No project selected</p>
          <Link href="/admin" className="text-sm text-[var(--accent)]">← Back to Admin</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg-primary)] z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">← Back to Admin</Link>
            <h1 className="text-lg font-semibold">New Proposal</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !title}
            className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Info */}
          <section className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <h2 className="font-semibold mb-4">Basic Info</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Phase I: Foundation & Discovery"
                  className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief overview of what this proposal covers..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Total Price ($)</label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    placeholder={`${calculateTotal() / 100 || 'Auto from phases'}`}
                    className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Valid for (days)</label>
                  <input
                    type="number"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Deposit %</label>
                  <input
                    type="number"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Concerns */}
          <section className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">What We're Addressing</h2>
              <button onClick={addConcern} className="text-xs text-[var(--accent)]">+ Add</button>
            </div>
            <div className="space-y-2">
              {concerns.map((concern, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={concern}
                    onChange={(e) => updateConcern(idx, e.target.value)}
                    placeholder="Pain point or concern..."
                    className="flex-1 px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                  />
                  {concerns.length > 1 && (
                    <button onClick={() => removeConcern(idx)} className="text-red-400 text-xs px-2">✕</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Phases */}
          <section className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Scope & Pricing</h2>
              <button onClick={addPhase} className="text-xs text-[var(--accent)]">+ Add Phase</button>
            </div>
            <div className="space-y-4">
              {phases.map((phase, pIdx) => (
                <div key={pIdx} className="p-4 border border-[var(--border)] rounded-lg">
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => updatePhase(pIdx, 'name', e.target.value)}
                      placeholder="Phase name"
                      className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={phase.price || ''}
                      onChange={(e) => updatePhase(pIdx, 'price', parseInt(e.target.value) || 0)}
                      placeholder="Price ($)"
                      className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={phase.hours}
                      onChange={(e) => updatePhase(pIdx, 'hours', e.target.value)}
                      placeholder="Hours (~25 hrs)"
                      className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Deliverables</span>
                      <button onClick={() => addPhaseItem(pIdx)} className="text-xs text-[var(--accent)]">+ Add</button>
                    </div>
                    {phase.items.map((item, iIdx) => (
                      <input
                        key={iIdx}
                        type="text"
                        value={item}
                        onChange={(e) => updatePhaseItem(pIdx, iIdx, e.target.value)}
                        placeholder="Deliverable item..."
                        className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline & Includes */}
          <section className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <h2 className="font-semibold mb-4">Timeline & Includes</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Timeline</label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="4-5 weeks from kick-off to launch"
                  className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[var(--text-muted)]">What's Included</label>
                  <button onClick={addInclude} className="text-xs text-[var(--accent)]">+ Add</button>
                </div>
                <div className="space-y-2">
                  {includes.map((item, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={item}
                      onChange={(e) => updateInclude(idx, e.target.value)}
                      placeholder="All source files, 30 days support, etc."
                      className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProposalEditorContent />
    </Suspense>
  )
}
