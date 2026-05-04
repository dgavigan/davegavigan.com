'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Phase {
  name: string
  price: number
  hours: string
  items: string[]
}

export default function EditProposalPage() {
  const router = useRouter()
  const params = useParams()
  const proposalId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentRevision, setCurrentRevision] = useState(1)
  const [showRevisionConfirm, setShowRevisionConfirm] = useState(false)

  // Basic info
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [validDays, setValidDays] = useState('14')
  const [status, setStatus] = useState('pending')
  const [isAccepted, setIsAccepted] = useState(false)

  // Content sections
  const [concerns, setConcerns] = useState<string[]>([''])
  const [phases, setPhases] = useState<Phase[]>([{ name: '', price: 0, hours: '', items: [''] }])
  const [includes, setIncludes] = useState<string[]>([''])
  const [timeline, setTimeline] = useState('')
  const [depositPercent, setDepositPercent] = useState('70')

  useEffect(() => {
    fetchProposal()
  }, [proposalId])

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      
      setTitle(data.title)
      setSummary(data.summary || '')
      setTotalPrice(String(data.totalPrice / 100))
      setStatus(data.status)
      setIsAccepted(data.status === 'accepted')
      setCurrentRevision(data.revision || 1)

      // Parse content
      const content = data.content ? JSON.parse(data.content) : {}
      setConcerns(content.concerns?.length ? content.concerns : [''])
      setPhases(content.phases?.length ? content.phases.map((p: any) => ({
        ...p,
        price: p.price / 100,
        items: p.items?.length ? p.items : [''],
      })) : [{ name: '', price: 0, hours: '', items: [''] }])
      setIncludes(content.includes?.length ? content.includes : [''])
      setTimeline(content.timeline || '')
      if (content.payment?.deposit && data.totalPrice) {
        setDepositPercent(String(Math.round((content.payment.deposit / data.totalPrice) * 100)))
      }
    } catch (err) {
      setError('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const addConcern = () => setConcerns([...concerns, ''])
  const updateConcern = (idx: number, value: string) => {
    const updated = [...concerns]
    updated[idx] = value
    setConcerns(updated)
  }

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

  const handleSave = async (createRevision = false) => {
    setSaving(true)
    setError('')
    setShowRevisionConfirm(false)

    const total = parseInt(totalPrice) * 100
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
      const res = await fetch(`/api/admin/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          totalPrice: total,
          content: JSON.stringify(content),
          createRevision,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      
      const data = await res.json()
      if (data.revisionCreated) {
        setCurrentRevision(data.revision)
        setSuccess(`Published as v${data.revision}! Client notified.`)
      } else {
        setSuccess('Draft saved!')
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg-primary)] z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">← Back to Admin</Link>
            <h1 className="text-lg font-semibold">Edit Proposal</h1>
          </div>
          <div className="flex items-center gap-3">
            {success && <span className="text-sm text-emerald-500">{success}</span>}
            <span className="text-xs text-[var(--text-muted)]">v{currentRevision}</span>
            {isAccepted && (
              <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded">Accepted - View Only</span>
            )}
            {!isAccepted && (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg disabled:opacity-50 hover:border-[var(--accent)]"
                >
                  {saving ? '...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => setShowRevisionConfirm(true)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg disabled:opacity-50"
                >
                  Publish Update
                </button>
              </>
            )}
          </div>
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
                <label className="text-xs text-[var(--text-muted)] block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isAccepted}
                  className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={isAccepted}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50 resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Total Price ($)</label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    disabled={isAccepted}
                    className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Deposit %</label>
                  <input
                    type="number"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(e.target.value)}
                    disabled={isAccepted}
                    className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Status</label>
                  <div className="px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm capitalize">{status}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Concerns */}
          <section className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">What We're Addressing</h2>
              {!isAccepted && <button onClick={addConcern} className="text-xs text-[var(--accent)]">+ Add</button>}
            </div>
            <div className="space-y-2">
              {concerns.map((concern, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={concern}
                  onChange={(e) => updateConcern(idx, e.target.value)}
                  disabled={isAccepted}
                  placeholder="Pain point..."
                  className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50"
                />
              ))}
            </div>
          </section>

          {/* Phases */}
          <section className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Scope & Pricing</h2>
              {!isAccepted && <button onClick={addPhase} className="text-xs text-[var(--accent)]">+ Add Phase</button>}
            </div>
            <div className="space-y-4">
              {phases.map((phase, pIdx) => (
                <div key={pIdx} className="p-4 border border-[var(--border)] rounded-lg">
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <input type="text" value={phase.name} onChange={(e) => updatePhase(pIdx, 'name', e.target.value)} disabled={isAccepted} placeholder="Phase name" className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50" />
                    <input type="number" value={phase.price || ''} onChange={(e) => updatePhase(pIdx, 'price', parseInt(e.target.value) || 0)} disabled={isAccepted} placeholder="Price ($)" className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50" />
                    <input type="text" value={phase.hours} onChange={(e) => updatePhase(pIdx, 'hours', e.target.value)} disabled={isAccepted} placeholder="Hours" className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Deliverables</span>
                      {!isAccepted && <button onClick={() => addPhaseItem(pIdx)} className="text-xs text-[var(--accent)]">+ Add</button>}
                    </div>
                    {phase.items.map((item, iIdx) => (
                      <input key={iIdx} type="text" value={item} onChange={(e) => updatePhaseItem(pIdx, iIdx, e.target.value)} disabled={isAccepted} placeholder="Item..." className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50" />
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
                <input type="text" value={timeline} onChange={(e) => setTimeline(e.target.value)} disabled={isAccepted} placeholder="4-5 weeks" className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[var(--text-muted)]">What's Included</label>
                  {!isAccepted && <button onClick={addInclude} className="text-xs text-[var(--accent)]">+ Add</button>}
                </div>
                <div className="space-y-2">
                  {includes.map((item, idx) => (
                    <input key={idx} type="text" value={item} onChange={(e) => updateInclude(idx, e.target.value)} disabled={isAccepted} placeholder="Source files, support, etc." className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg disabled:opacity-50" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Preview link */}
          <div className="text-center">
            <Link href={`/portal/proposals/${proposalId}`} className="text-sm text-[var(--accent)] hover:underline">
              Preview as client →
            </Link>
          </div>
        </div>
      </div>

      {/* Revision Confirmation Modal */}
      {showRevisionConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">Publish as v{currentRevision + 1}?</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              This will:
            </p>
            <ul className="text-sm text-[var(--text-secondary)] mb-6 space-y-1">
              <li>• Save current version to history</li>
              <li>• Clear any existing comments</li>
              <li>• Require the client to re-review and sign</li>
              <li>• Send an email notification to the client</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Yes, Publish Update'}
              </button>
              <button
                onClick={() => setShowRevisionConfirm(false)}
                className="px-6 py-2.5 text-sm text-[var(--text-muted)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
