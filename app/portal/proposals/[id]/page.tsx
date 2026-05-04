'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type SignatureCanvasType from 'react-signature-canvas'

// Dynamically import SignatureCanvas to avoid SSR issues
const SignatureCanvas = dynamic(
  () => import('react-signature-canvas'),
  { ssr: false }
) as React.ComponentType<any>

interface ProposalData {
  id: string
  title: string
  summary: string | null
  status: string
  totalPrice: number
  validUntil: string | null
  acceptedAt: string | null
  createdAt: string
  updatedAt: string
  revision: number
  content: any
  signature: any
  project: {
    id: string
    name: string
    endDate: string | null
    client: {
      id: string
      name: string
    }
  }
  currentUserRole?: 'owner' | 'admin' | 'viewer' | null
  canAccept?: boolean
}

interface Comment {
  id: string
  text: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export default function ProposalPage() {
  const params = useParams()
  const router = useRouter()
  const proposalId = params.id as string
  const sigCanvas = useRef<any>(null)

  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureEmpty, setSignatureEmpty] = useState(true)
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw')
  const [typedName, setTypedName] = useState('')
  
  // Comments
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  useEffect(() => {
    fetchProposal()
    fetchComments()
  }, [proposalId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/comments`)
      if (res.ok) {
        setComments(await res.json())
      }
    } catch (err) {
      console.error('Failed to load comments')
    }
  }

  const postComment = async () => {
    if (!newComment.trim()) return
    setPostingComment(true)
    try {
      const res = await fetch(`/api/proposals/${proposalId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      })
      if (res.ok) {
        const comment = await res.json()
        setComments([...comments, comment])
        setNewComment('')
      }
    } catch (err) {
      console.error('Failed to post comment')
    } finally {
      setPostingComment(false)
    }
  }

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Proposal not found')
        } else if (res.status === 403) {
          setError('You don\'t have access to this proposal')
        } else {
          setError('Failed to load proposal')
        }
        return
      }
      const data = await res.json()
      setProposal(data)
    } catch (err) {
      setError('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const clearSignature = () => {
    sigCanvas.current?.clear()
    setSignatureEmpty(true)
  }

  const handleAcceptWithSignature = async () => {
    let signatureDataUrl: string

    if (signatureMode === 'draw') {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        return
      }
      signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
    } else {
      // Generate signature from typed name
      if (!typedName.trim()) return
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.font = 'italic 36px Georgia, serif'
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2)
      }
      signatureDataUrl = canvas.toDataURL('image/png')
    }

    setAccepting(true)
    try {
      const res = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureDataUrl }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to accept proposal')
      }
      
      setShowSignatureModal(false)
      fetchProposal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAccepting(false)
    }
  }

  const downloadPdf = async () => {
    // Fetch the HTML from the API
    const res = await fetch(`/api/proposals/${proposalId}/pdf`, {
      credentials: 'include',
    })
    if (!res.ok) {
      alert('Failed to generate PDF')
      return
    }
    const html = await res.text()
    
    // Create a hidden iframe, load HTML, and trigger print (save as PDF)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
    
    const doc = iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
      
      // Wait for content to load then print
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print()
          // Remove iframe after print dialog closes
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 1000)
        }, 500)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Loading proposal...</p>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-400 mb-4">{error || 'Proposal not found'}</p>
        <Link href="/portal" className="text-sm text-[var(--accent)]">← Back to Dashboard</Link>
      </div>
    )
  }

  const content = proposal.content || {}
  const isPending = proposal.status === 'pending'
  const isAccepted = proposal.status === 'accepted'
  const isExpired = proposal.validUntil && new Date(proposal.validUntil) < new Date()
  const signature = proposal.signature ? JSON.parse(proposal.signature) : null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // For date-only fields (like project endDate) stored at UTC midnight — format
  // in UTC so the calendar day is stable across viewer timezones.
  const formatDateOnly = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/portal" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] mb-4 inline-block">← Back to Dashboard</Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">
              Proposal {proposal.revision > 1 && <span className="text-[var(--text-muted)]">· v{proposal.revision}</span>}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{proposal.title}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {proposal.project.client.name}
              <span className="mx-2">·</span>
              <span className="text-xs">Updated {formatDate(proposal.updatedAt)}</span>
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
              isAccepted ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
              isPending && !isExpired ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
              'bg-gray-500/10 text-gray-600 border border-gray-500/20'
            }`}>
              {isAccepted ? 'Accepted' : isExpired ? 'Expired' : 'Pending Review'}
            </span>
            {proposal.validUntil && !isAccepted && (
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Valid until {formatDate(proposal.validUntil)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {proposal.summary && (
        <div className="p-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-card)] mb-6">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{proposal.summary}</p>
        </div>
      )}

      {/* Problem Statement */}
      {content.problemStatement && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">{content.problemStatement.title}</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{content.problemStatement.content}</p>
        </div>
      )}

      {/* Context */}
      {content.context && (
        <div className="mb-8 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">Current Situation</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{content.context.situation}</p>
          {content.context.opportunity && (
            <>
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-2">The Opportunity</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{content.context.opportunity}</p>
            </>
          )}
        </div>
      )}

      {/* Concerns */}
      {content.concerns && content.concerns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">What We're Addressing</h2>
          <ul className="space-y-2">
            {content.concerns.map((concern: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[var(--accent)]">•</span>
                <span className="text-[var(--text-secondary)]">{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Why Rebuild */}
      {content.whyRebuild && (
        <div className="mb-8 p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <h2 className="text-sm font-semibold text-blue-600 mb-3">{content.whyRebuild.title || 'Why Rebuild Instead of Patching'}</h2>
          <ul className="space-y-2 mb-4">
            {content.whyRebuild.reasons?.map((reason: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-blue-500 mt-0.5">→</span>
                {reason}
              </li>
            ))}
          </ul>
          {content.whyRebuild.prototype && (
            <a 
              href={content.whyRebuild.prototype} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              🔗 View high-fidelity prototype
            </a>
          )}
        </div>
      )}

      {/* Custom Sections (Why Rebuild, Prototype, etc.) */}
      {content.sections && content.sections.length > 0 && (
        <div className="mb-8 space-y-6">
          {content.sections.map((section: any, i: number) => (
            <div key={i} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h3 className="font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{section.content}</p>
              {section.link && (
                <a 
                  href={section.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-[var(--accent)] hover:underline"
                >
                  {section.link} →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Functional Requirements */}
      {content.functionalRequirements && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">{content.functionalRequirements.title}</h2>
          <ul className="space-y-1.5">
            {content.functionalRequirements.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Integrations */}
      {content.integrations && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-4">{content.integrations.title}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h4 className="text-xs font-semibold mb-2 text-[var(--text-muted)]">Google Ecosystem</h4>
              <ul className="space-y-1">
                {content.integrations.google.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)]">• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h4 className="text-xs font-semibold mb-2 text-[var(--text-muted)]">Third Party</h4>
              <ul className="space-y-1">
                {content.integrations.thirdParty.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)]">• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h4 className="text-xs font-semibold mb-2 text-[var(--text-muted)]">Shopify Apps</h4>
              <ul className="space-y-1">
                {content.integrations.shopifyApps.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)]">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Non-Functional Requirements */}
      {content.nonFunctionalRequirements && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">{content.nonFunctionalRequirements.title}</h2>
          <ul className="space-y-1.5">
            {content.nonFunctionalRequirements.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-blue-500 mt-0.5">◆</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deliverables */}
      {content.deliverables && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">{content.deliverables.title}</h2>
          <ul className="space-y-1.5">
            {content.deliverables.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent)] mt-0.5">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phases */}
      {content.phases && content.phases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-4">Investment</h2>
          <div className="space-y-4">
            {content.phases.map((phase: any, i: number) => (
              <div key={i} className="p-5 rounded-2xl border-2 border-[var(--accent)]/30 bg-[var(--accent)]/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{phase.name}</h3>
                    {phase.hours && <p className="text-xs text-[var(--text-muted)]">{phase.hours}</p>}
                  </div>
                  <span className="text-2xl font-bold">${(phase.price / 100).toLocaleString()}</span>
                </div>
                {phase.breakdown && (
                  <div className="mb-3 text-xs text-[var(--text-muted)]">
                    {phase.breakdown.map((b: any, j: number) => (
                      <span key={j}>{b.task}: {b.hours}{j < phase.breakdown.length - 1 ? ' | ' : ''}</span>
                    ))}
                  </div>
                )}
                {phase.items && (
                  <ul className="space-y-1">
                    {phase.items.map((item: string, j: number) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="text-emerald-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline with Milestones */}
      {content.milestones && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-4">Timeline</h2>
          <p className="text-sm mb-4">{content.timeline}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {content.milestones.map((m: any, i: number) => (
              <div key={i} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
                <div className="text-xs font-semibold text-[var(--accent)]">{m.week}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{m.milestone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment */}
      {content.payment && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-4">Payment Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <div className="text-2xl font-bold">${(content.payment.deposit / 100).toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)]">{content.payment.depositNote || 'Deposit to start'}</div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <div className="text-2xl font-bold">${(content.payment.final / 100).toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)]">{content.payment.finalNote || 'Final at launch'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Items */}
      {content.discovery && content.discovery.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-4">Why These Need Discovery</h2>
          <div className="space-y-3">
            {content.discovery.map((item: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  {item.estimatedRange && (
                    <span className="text-xs text-amber-600 font-medium">{item.estimatedRange}</span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase II (Future) */}
      {content.phaseTwo && (
        <div className="mb-8 p-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-[var(--text-muted)]">{content.phaseTwo.title}</h3>
            <span className="text-sm text-[var(--text-muted)]">{content.phaseTwo.priceRange}</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-3">{content.phaseTwo.description}</p>
          {content.phaseTwo.potentialItems && (
            <ul className="space-y-1">
              {content.phaseTwo.potentialItems.map((item: string, i: number) => (
                <li key={i} className="text-xs text-[var(--text-muted)]">• {item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Phase II Range (alternative format) */}
      {content.phase2Range && !content.phaseTwo && (
        <div className="mb-8 p-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-[var(--text-muted)]">Phase II: Shopify Plus & Shipping Optimization</h3>
            <span className="text-sm font-medium">{content.phase2Range}</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{content.phase2Note}</p>
        </div>
      )}

      {/* Payment Terms */}
      {content.terms && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">Payment Terms</h2>
          <ul className="space-y-1.5">
            {content.terms.map((term: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-emerald-500">✓</span>
                {term}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimers */}
      {content.disclaimers && content.disclaimers.length > 0 && (
        <div className="mb-8 space-y-4">
          {content.disclaimers.map((disclaimer: any, i: number) => (
            <div key={i} className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <h3 className="text-sm font-semibold text-amber-600 mb-2">⚠️ {disclaimer.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{disclaimer.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Includes */}
      {content.includes && content.includes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">Also Included</h2>
          <ul className="space-y-1">
            {content.includes.map((item: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent)]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Not Included */}
      {content.notIncluded && content.notIncluded.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">Not Included in Phase I</h2>
          <ul className="space-y-1">
            {content.notIncluded.map((item: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="text-gray-400">○</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline Breakdown */}
      {content.timelineBreakdown && content.timelineBreakdown.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-2">Timeline</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">{content.timeline}</p>
          <div className="space-y-2">
            {content.timelineBreakdown.map((item: any, i: number) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-[var(--accent)] font-mono text-xs w-16 shrink-0">Week {item.week}</span>
                <span className="text-[var(--text-secondary)]">{item.activity}</span>
              </div>
            ))}
          </div>
          {proposal.project.endDate && (
            <div className="mt-4 p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--accent)] font-medium mb-1">Target Go-Live</p>
                <p className="text-sm font-semibold">{formatDateOnly(proposal.project.endDate)}</p>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Penciled in — subject to scope lock</p>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="p-6 rounded-2xl border-2 border-[var(--accent)]/30 bg-[var(--accent)]/5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)]">Total Investment</h3>
            <p className="text-3xl font-bold">${(proposal.totalPrice / 100).toLocaleString()}</p>
          </div>
          {isPending && !isExpired && proposal.canAccept && (
            <button
              onClick={() => setShowSignatureModal(true)}
              className="px-6 py-3 text-sm font-semibold bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 transition-all"
            >
              Sign & Accept
            </button>
          )}
          {isPending && !isExpired && !proposal.canAccept && (
            <div className="text-right text-xs text-[var(--text-muted)] max-w-[200px]">
              Only the project owner can sign this proposal.
            </div>
          )}
          {isAccepted && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <span className="text-xl">✓</span>
                <span className="text-sm font-medium">Accepted {proposal.acceptedAt && formatDate(proposal.acceptedAt)}</span>
              </div>
              <button
                onClick={downloadPdf}
                className="px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
              >
                📄 Download PDF
              </button>
            </div>
          )}
        </div>
        {!isAccepted && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]/50 flex justify-end">
            <button
              onClick={downloadPdf}
              className="px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
            >
              📄 Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Signature display for accepted proposals */}
      {isAccepted && signature && (
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 mb-8">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-emerald-600 font-medium mb-3">Signed & Accepted</h3>
          <div className="flex items-end gap-6">
            <div>
              <img src={signature.dataUrl} alt="Signature" className="h-16 mb-1" />
              <p className="text-sm font-medium">{signature.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{signature.email}</p>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {formatDate(signature.timestamp)}
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-2">Sign to Accept</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              By signing below, you agree to the scope and pricing outlined in this proposal.
            </p>

            {/* Signature mode toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSignatureMode('draw')}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                  signatureMode === 'draw' 
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5 font-medium' 
                    : 'border-[var(--border)] text-[var(--text-muted)]'
                }`}
              >
                ✏️ Draw Signature
              </button>
              <button
                onClick={() => setSignatureMode('type')}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                  signatureMode === 'type' 
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5 font-medium' 
                    : 'border-[var(--border)] text-[var(--text-muted)]'
                }`}
              >
                ⌨️ Type Name
              </button>
            </div>

            {signatureMode === 'draw' ? (
              <>
                <div className="border-2 border-[var(--border)] rounded-xl overflow-hidden bg-white mb-4">
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      className: 'w-full',
                      style: { width: '100%', height: '150px' }
                    }}
                    backgroundColor="white"
                    penColor="black"
                    onEnd={() => setSignatureEmpty(sigCanvas.current?.isEmpty() ?? true)}
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <button onClick={clearSignature} className="text-sm text-[var(--text-muted)]">Clear</button>
                  <p className="text-xs text-[var(--text-muted)]">Draw your signature above</p>
                </div>
              </>
            ) : (
              <>
                <div className="border-2 border-[var(--border)] rounded-xl overflow-hidden bg-white mb-4 p-4">
                  <p className="text-center font-['Georgia',serif] italic text-3xl text-black min-h-[100px] flex items-center justify-center">
                    {typedName || 'Your Name'}
                  </p>
                </div>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your full name"
                  className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none mb-4"
                />
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAcceptWithSignature}
                disabled={accepting || (signatureMode === 'draw' ? signatureEmpty : !typedName.trim())}
                className="flex-1 py-3 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                {accepting ? 'Processing...' : 'Sign & Accept Proposal'}
              </button>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-6 py-3 text-sm text-[var(--text-muted)]"
              >
                Cancel
              </button>
            </div>

            <p className="text-[10px] text-center text-[var(--text-muted)] mt-4">
              A signed copy will be emailed to you and Dave for your records.
            </p>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mb-8 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <h3 className="font-semibold mb-4">Discussion</h3>
        
        {comments.length > 0 && (
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  comment.user.role === 'admin' 
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]' 
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}>
                  {comment.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || comment.user.email[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.user.name || comment.user.email}</span>
                    {comment.user.role === 'admin' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">Dave</span>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or leave a comment..."
            rows={2}
            className="flex-1 px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-xl placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none resize-none"
          />
          <button
            onClick={postComment}
            disabled={postingComment || !newComment.trim()}
            className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 disabled:opacity-50 self-end"
          >
            {postingComment ? '...' : 'Send'}
          </button>
        </div>
      </div>

    </div>
  )
}
