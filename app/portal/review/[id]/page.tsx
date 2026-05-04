'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Mock review data
const review = {
  id: 'design-v1',
  deliverable: 'Design & Prototyping — V1',
  milestone: 'Design',
  status: 'awaiting-review' as const,
  submittedAt: 'Mar 20, 2026',
  revisionsUsed: 0,
  revisionsIncluded: 2,

  previewUrl: 'https://booth-med-preview.vercel.app',

  pages: [
    { name: 'Homepage', status: 'new' },
    { name: 'Product Listing', status: 'new' },
    { name: 'Product Detail', status: 'new' },
    { name: 'Cart & Checkout', status: 'new' },
    { name: 'About / Contact', status: 'new' },
  ],

  notes: 'This is the first design pass based on our discovery findings. Key things to look at:\n\n• Homepage hero — showcases top-selling equipment with lifestyle photography\n• Product pages — freight shipping calculator is visible before add-to-cart\n• Checkout — streamlined 2-step process with quote request option for bulk orders\n\nPlease review each page and let me know what feels right and what needs adjustment.',

  aiSuggestions: [
    { text: 'Make freight shipping calculator more prominent on product pages', source: 'Jared, mentioned 3x in updates', selected: true },
    { text: 'Mobile navigation should surface product categories faster', source: 'Sarah, Mar 22 comment', selected: true },
    { text: 'Consider equipment in-use photos vs white background for hero', source: 'Jared, Mar 21 comment', selected: false },
    { text: 'Add bulk order quote CTA above the fold on product pages', source: 'Discovery call notes', selected: true },
  ],
}

type FeedbackItem = {
  page: string
  type: 'change' | 'question' | 'approval'
  text: string
}

export default function ReviewPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [currentPage, setCurrentPage] = useState('')
  const [currentType, setCurrentType] = useState<'change' | 'question' | 'approval'>('change')
  const [currentText, setCurrentText] = useState('')
  const [aiSelections, setAiSelections] = useState(review.aiSuggestions.map(s => s.selected))
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'feedback'>('feedback')

  const addFeedback = () => {
    if (!currentText.trim() || !currentPage) return
    setFeedbackItems([...feedbackItems, { page: currentPage, type: currentType, text: currentText }])
    setCurrentText('')
  }

  const removeFeedback = (index: number) => {
    setFeedbackItems(feedbackItems.filter((_, i) => i !== index))
  }

  const toggleAi = (index: number) => {
    const next = [...aiSelections]
    next[index] = !next[index]
    setAiSelections(next)
  }

  const selectedAiCount = aiSelections.filter(Boolean).length
  const totalFeedbackCount = feedbackItems.length + selectedAiCount

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Revision request submitted</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-2">
          {totalFeedbackCount} items submitted · Round {review.revisionsUsed + 1} of {review.revisionsIncluded}
        </p>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Dave will review your feedback and start working on revisions. You&apos;ll get an update when the next version is ready.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/portal/timeline" className="px-5 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all">
            Back to Timeline
          </Link>
          <Link href="/portal" className="px-5 py-2.5 text-sm border-2 border-[var(--border)] rounded-lg hover:border-[var(--text-muted)] transition-all">
            Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/portal/timeline" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-3 block">← Back to Timeline</Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Review</p>
            <h1 className="text-xl md:text-2xl font-bold">{review.deliverable}</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">Submitted {review.submittedAt} · {review.revisionsIncluded - review.revisionsUsed} revision rounds remaining</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium shrink-0">
            Awaiting Review
          </span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${activeTab === 'feedback' ? 'bg-[var(--bg-card)] shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)]'}`}
        >
          Review & Feedback
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-[var(--bg-card)] shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)]'}`}
        >
          Live Preview
        </button>
      </div>

      {/* Preview tab */}
      {activeTab === 'preview' && (
        <div>
          <div className="rounded-xl border-2 border-[var(--border)] overflow-hidden mb-4">
            <div className="bg-[var(--bg-secondary)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{review.previewUrl}</span>
              </div>
              <a href={review.previewUrl} target="_blank" rel="noopener" className="text-[10px] text-[var(--accent-pop)] hover:underline">
                Open in new tab ↗
              </a>
            </div>
            <div className="aspect-[16/10] bg-[var(--bg-secondary)] flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🖥️</div>
                <p className="text-sm text-[var(--text-muted)]">Preview environment</p>
                <a href={review.previewUrl} target="_blank" rel="noopener" className="text-xs text-[var(--accent-pop)] hover:underline mt-1 block">
                  Click to open →
                </a>
              </div>
            </div>
          </div>

          {/* Pages list */}
          <div className="rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
              <span className="text-xs font-medium">Pages to review</span>
            </div>
            {review.pages.map((page, i) => (
              <div key={page.name} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                <span className="text-sm">{page.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">New</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback tab */}
      {activeTab === 'feedback' && (
        <div>
          {/* Dave's notes */}
          <div className="p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/assets/me.jpg" alt="Dave" width={24} height={24} className="rounded-full" />
              <span className="text-xs font-semibold">Dave&apos;s Notes</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{review.notes}</p>
          </div>

          {/* AI-suggested feedback */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🤖</span>
              <h2 className="text-xs font-semibold">Suggested revisions from your feedback</h2>
              <span className="text-[10px] text-[var(--text-muted)]">{selectedAiCount} selected</span>
            </div>
            <div className="rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
              {review.aiSuggestions.map((suggestion, i) => (
                <label key={i} className={`flex items-start gap-3 p-3.5 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                  <input
                    type="checkbox"
                    checked={aiSelections[i]}
                    onChange={() => toggleAi(i)}
                    className="mt-0.5 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">{suggestion.text}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Source: {suggestion.source}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Manual feedback */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold mb-3">Add your own feedback</h2>
            <div className="p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)]">
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-transparent border-2 border-[var(--border)] rounded-lg text-[var(--text-secondary)] focus:border-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Which page?</option>
                  {review.pages.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                  <option value="General">General / Overall</option>
                </select>
                <div className="flex gap-1.5">
                  {[
                    { value: 'change' as const, label: '🔄 Change', desc: 'Something needs to change' },
                    { value: 'question' as const, label: '❓ Question', desc: 'I have a question' },
                    { value: 'approval' as const, label: '👍 Looks good', desc: 'This part is great' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setCurrentType(t.value)}
                      className={`flex-1 py-2 text-[10px] font-medium rounded-lg border-2 transition-all ${
                        currentType === t.value
                          ? 'border-[var(--text-primary)]/20 bg-[var(--bg-secondary)]'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Describe what you'd like to change, your question, or what looks great..."
                rows={3}
                className="w-full px-3 py-2.5 text-xs bg-transparent border-2 border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none resize-none mb-3"
              />
              <button
                onClick={addFeedback}
                disabled={!currentText.trim() || !currentPage}
                className="px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all disabled:opacity-30"
              >
                Add Feedback
              </button>
            </div>
          </div>

          {/* Feedback items added */}
          {feedbackItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold mb-3">Your feedback ({feedbackItems.length})</h2>
              <div className="space-y-2">
                {feedbackItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)]">
                    <span className="text-sm mt-0.5">
                      {item.type === 'change' ? '🔄' : item.type === 'question' ? '❓' : '👍'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)]">{item.page}</span>
                        <span className="text-[10px] text-[var(--text-muted)] capitalize">{item.type}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{item.text}</p>
                    </div>
                    <button onClick={() => removeFeedback(i)} className="text-[10px] text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="p-5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Ready to submit?</h3>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {totalFeedbackCount} items · This uses revision round {review.revisionsUsed + 1} of {review.revisionsIncluded}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)]">{review.revisionsIncluded - review.revisionsUsed - 1} rounds remaining after</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSubmitted(true)}
                disabled={totalFeedbackCount === 0}
                className="px-6 py-2.5 text-sm font-medium bg-amber-600 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-30"
              >
                Submit Revision Request
              </button>
              <button className="px-6 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:opacity-80 transition-all">
                Approve — No Changes Needed ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
