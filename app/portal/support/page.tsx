'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Category = 'bug' | 'question' | 'feature' | 'urgent'
type Filter = 'all' | 'open' | 'closed'

interface Issue {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  comments: number
}

interface Comment {
  id: number
  body: string
  user: { login: string }
  created_at: string
}

export default function SupportPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const clientId = searchParams.get('clientId')
  
  // Issues state
  const [issues, setIssues] = useState<Issue[]>([])
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [noRepo, setNoRepo] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  // Detail view state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [issueComments, setIssueComments] = useState<Comment[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [newReply, setNewReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // New issue state (inline, not modal)
  const [isCreating, setIsCreating] = useState(false)
  const [category, setCategory] = useState<Category>('question')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'bug', label: 'Bug', icon: '🐛' },
    { value: 'question', label: 'Question', icon: '❓' },
    { value: 'feature', label: 'Feature', icon: '💡' },
    { value: 'urgent', label: 'Urgent', icon: '🚨' },
  ]

  useEffect(() => {
    fetchIssues()
  }, [projectId, clientId])

  const fetchIssues = async () => {
    setLoadingIssues(true)
    try {
      const qs = new URLSearchParams()
      if (projectId) qs.set('projectId', projectId)
      else if (clientId) qs.set('clientId', clientId)
      const params = qs.toString() ? `?${qs.toString()}` : ''
      const res = await fetch(`/api/portal/issues${params}`)
      const data = await res.json()
      
      if (data.noRepo) {
        setNoRepo(true)
        setCurrentProjectId(data.projectId)
      } else {
        setNoRepo(false)
        setIssues(data.issues || [])
        setCurrentProjectId(data.projectId)
      }
    } catch (err) {
      console.error('Failed to load issues')
    } finally {
      setLoadingIssues(false)
    }
  }

  const startCreating = () => {
    setIsCreating(true)
    setSelectedIssue(null)
    setCategory('question')
    setSubject('')
    setDescription('')
    setError('')
  }

  const cancelCreating = () => {
    setIsCreating(false)
  }

  const openIssueDetail = async (issue: Issue) => {
    setIsCreating(false)
    setSelectedIssue(issue)
    setLoadingDetail(true)
    setIssueComments([])
    
    try {
      const res = await fetch(`/api/portal/issues/${issue.number}?projectId=${currentProjectId}`)
      const data = await res.json()
      if (data.issue) {
        setSelectedIssue(data.issue)
      }
      setIssueComments(data.comments || [])
    } catch (err) {
      console.error('Failed to load issue details')
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeDetail = () => {
    setSelectedIssue(null)
    setIssueComments([])
    setNewReply('')
  }

  const handleReply = async () => {
    if (!newReply.trim() || !selectedIssue) return
    
    setSendingReply(true)
    try {
      const res = await fetch(`/api/portal/issues/${selectedIssue.number}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProjectId,
          comment: newReply,
        }),
      })
      
      if (res.ok) {
        const comment = await res.json()
        setIssueComments(prev => [...prev, comment])
        setNewReply('')
        setIssues(prev => prev.map(i => 
          i.number === selectedIssue.number 
            ? { ...i, comments: i.comments + 1 }
            : i
        ))
      }
    } catch (err) {
      console.error('Failed to post reply')
    } finally {
      setSendingReply(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    setSending(true)
    setError('')

    const categoryLabel = categories.find(c => c.value === category)?.label || 'Support'
    const fullTitle = `[${categoryLabel}] ${subject}`

    try {
      const res = await fetch('/api/portal/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProjectId,
          title: fullTitle,
          description,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      const newIssue = await res.json()
      
      // Optimistically add to list
      setIssues(prev => [newIssue, ...prev])
      setSubject('')
      setDescription('')
      setCategory('question')
      setIsCreating(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // Parse submitter info from issue body
  const parseSubmitter = (body: string | null): { name: string; email: string } | null => {
    if (!body) return null
    const match = body.match(/\*\*Submitted by:\*\* (.+?) \((.+?)\)/)
    if (match) {
      return { name: match[1], email: match[2] }
    }
    return null
  }

  // Remove the portal-generated "**Submitted by:**" header block only.
  // Issues authored directly on GitHub may contain their own `---` horizontal
  // rules and should NOT be truncated — render as-is.
  const parseIssueBody = (body: string | null) => {
    if (!body) return ''
    if (!body.startsWith('**Submitted by:**')) return body
    // Portal-submitted format: "**Submitted by:** ...\n---\n<content>"
    const idx = body.indexOf('---')
    if (idx === -1) return body
    return body.slice(idx + 3).trim()
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true
    return issue.state === filter
  })

  const openCount = issues.filter(i => i.state === 'open').length
  const closedCount = issues.filter(i => i.state === 'closed').length

  // If no GitHub repo configured, fall back to email
  if (noRepo && !loadingIssues) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Support</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">How can I help?</h1>
        </div>

        <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <span className="text-4xl mb-4 block">📧</span>
          <p className="text-[var(--text-muted)] mb-4">
            Email me directly for support on this project.
          </p>
          <a 
            href="mailto:dave@davegavigan.com" 
            className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl font-medium hover:opacity-90"
          >
            dave@davegavigan.com
          </a>
        </div>
      </div>
    )
  }

  // New Issue Form - rendered inline (not as a component to avoid re-mount issues)
  const renderNewIssueForm = (onCancel?: () => void) => (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">New Issue</h2>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  category === cat.value
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                    : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                }`}
              >
                <span className="text-xl block">{cat.icon}</span>
                <span className="text-[10px] block mt-1 text-[var(--text-muted)]">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of the issue..."
            required
            className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-xl focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={category === 'bug' 
              ? "What happened? What did you expect to happen?"
              : "Provide as much detail as possible..."
            }
            required
            rows={8}
            className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-xl focus:border-[var(--accent)] focus:outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={sending || !subject.trim() || !description.trim()}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              category === 'urgent'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90'
            } disabled:opacity-50`}
          >
            {sending ? 'Submitting...' : 'Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  )

  // Issue Detail Component
  // Issue Detail - render function to avoid re-mount
  const renderIssueDetail = (onBack?: () => void, showBackButton = true) => {
    if (!selectedIssue) return null
    
    const submitter = parseSubmitter(selectedIssue.body)
    
    return (
      <div className="flex flex-col">
        {/* Back button - mobile only */}
        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            className="md:hidden flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4"
          >
            ← Back to issues
          </button>
        )}

        {/* Issue Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
              selectedIssue.state === 'open' 
                ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
            }`}>
              {selectedIssue.state}
            </span>
            <span className="text-xs text-[var(--text-muted)]">#{selectedIssue.number}</span>
          </div>
          <h2 className="text-lg font-bold mb-2">{selectedIssue.title}</h2>
          
          {/* Submitter info */}
          {submitter && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-xs font-medium text-[var(--accent)]">
                {getInitials(submitter.name)}
              </div>
              <div>
                <div className="text-sm font-medium">{submitter.name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Submitted {formatFullDate(selectedIssue.created_at)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Issue Body */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] mb-4">
          <div className="prose prose-sm dark:prose-invert max-w-none
                        prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-[var(--text-primary)]
                        prose-p:my-2 prose-p:text-[var(--text-primary)]
                        prose-li:my-1 prose-li:text-[var(--text-primary)]
                        prose-strong:text-[var(--text-primary)]
                        prose-code:text-[var(--accent-pop)] prose-code:bg-[var(--bg-secondary)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-[var(--bg-secondary)] prose-pre:text-[var(--text-primary)]
                        prose-a:text-[var(--accent-pop)]
                        prose-blockquote:text-[var(--text-secondary)] prose-blockquote:border-[var(--accent)]
                        prose-hr:border-[var(--border)]
                        prose-table:text-[var(--text-primary)] prose-th:border-[var(--border)] prose-td:border-[var(--border)] text-[var(--text-primary)]">
            {loadingDetail ? (
              <p>Loading...</p>
            ) : parseIssueBody(selectedIssue.body) ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{parseIssueBody(selectedIssue.body)}</ReactMarkdown>
            ) : (
              <p className="text-[var(--text-muted)]">No description provided.</p>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Activity {issueComments.length > 0 && `(${issueComments.length})`}
          </h3>
          
          {loadingDetail ? (
            <div className="py-6 text-center text-[var(--text-muted)] text-sm">Loading...</div>
          ) : issueComments.length === 0 ? (
            <div className="py-6 text-center text-[var(--text-muted)] text-sm border border-dashed border-[var(--border)] rounded-lg">
              No replies yet
            </div>
          ) : (
            <div className="space-y-3">
              {issueComments.map((comment) => {
                // Parse commenter from comment body if it was submitted via portal
                const portalMatch = comment.body.match(/^\*\*(.+?)\*\* commented via portal:/)
                const commenterName = portalMatch ? portalMatch[1] : (comment.user.login === 'dgavigan' ? 'Dave Gavigan' : comment.user.login)
                const isBot = comment.user.login.includes('[bot]') || comment.user.login === 'gavigan-client-portal'
                const isDave = comment.user.login === 'dgavigan' && !portalMatch
                
                return (
                  <div key={comment.id} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                        isDave ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--accent)]/20 text-[var(--accent)]'
                      }`}>
                        {isDave ? '👨‍💻' : getInitials(commenterName)}
                      </div>
                      <span className="text-sm font-medium">{commenterName}</span>
                      {isDave && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Developer</span>}
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(comment.created_at)}</span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] pl-8 prose prose-sm dark:prose-invert max-w-none
                        prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-[var(--text-primary)]
                        prose-p:my-2 prose-p:text-[var(--text-primary)]
                        prose-li:my-1 prose-li:text-[var(--text-primary)]
                        prose-strong:text-[var(--text-primary)]
                        prose-code:text-[var(--accent-pop)] prose-code:bg-[var(--bg-secondary)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-[var(--bg-secondary)] prose-pre:text-[var(--text-primary)]
                        prose-a:text-[var(--accent-pop)]
                        prose-blockquote:text-[var(--text-secondary)] prose-blockquote:border-[var(--accent)]
                        prose-hr:border-[var(--border)]
                        prose-table:text-[var(--text-primary)] prose-th:border-[var(--border)] prose-td:border-[var(--border)]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.body.replace(/^\*\*.*?\*\* commented via portal:\n\n/, '')}</ReactMarkdown>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Reply Box */}
        {selectedIssue.state === 'open' ? (
          <div className="pt-3 border-t border-[var(--border)]">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Add a reply..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none resize-none mb-2"
            />
            <div className="flex justify-end">
              <button
                onClick={handleReply}
                disabled={sendingReply || !newReply.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {sendingReply ? 'Sending...' : 'Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-3 text-center text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-lg">
            This issue has been resolved and closed.
          </div>
        )}
      </div>
    )
  }

  // Issue List - render function to avoid re-mount
  const renderIssueList = (onSelect: (issue: Issue) => void, selectedId?: number) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Support</p>
          <h1 className="text-xl font-bold">Issues</h1>
        </div>
        <button
          onClick={startCreating}
          className="px-3 py-1.5 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90"
        >
          + New
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg mb-4 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-2 py-1.5 rounded-md transition-all ${
            filter === 'all' ? 'bg-[var(--bg-card)] shadow-sm' : 'text-[var(--text-muted)]'
          }`}
        >
          All ({issues.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`flex-1 px-2 py-1.5 rounded-md transition-all ${
            filter === 'open' ? 'bg-[var(--bg-card)] shadow-sm' : 'text-[var(--text-muted)]'
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setFilter('closed')}
          className={`flex-1 px-2 py-1.5 rounded-md transition-all ${
            filter === 'closed' ? 'bg-[var(--bg-card)] shadow-sm' : 'text-[var(--text-muted)]'
          }`}
        >
          Closed ({closedCount})
        </button>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {loadingIssues ? (
          <div className="py-8 text-center text-[var(--text-muted)] text-sm">Loading...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)] text-sm">
            {filter === 'all' ? 'No issues yet' : `No ${filter} issues`}
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const submitter = parseSubmitter(issue.body)
            return (
              <div 
                key={issue.number} 
                onClick={() => onSelect(issue)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedId === issue.number
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    issue.state === 'open' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{issue.title}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                      {submitter && <span>{submitter.name}</span>}
                      {submitter && <span>·</span>}
                      <span>{formatDate(issue.created_at)}</span>
                      {issue.comments > 0 && (
                        <>
                          <span>·</span>
                          <span>💬 {issue.comments}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  // Mobile: full page views
  // Desktop: master/detail side by side
  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden">
        {isCreating ? (
          <>
            <button 
              onClick={cancelCreating}
              className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4"
            >
              ← Back to issues
            </button>
            {renderNewIssueForm()}
          </>
        ) : selectedIssue ? (
          renderIssueDetail(closeDetail, true)
        ) : (
          renderIssueList(openIssueDetail)
        )}
      </div>

      {/* Desktop Layout - Master/Detail - full width flush to sidebar */}
      <div className="hidden md:block fixed top-0 left-60 right-0 bottom-0">
        <div className="flex h-full">
          {/* List Panel */}
          <div className="w-[280px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-card)] p-4 overflow-y-auto">
            {renderIssueList(openIssueDetail, selectedIssue?.number)}
          </div>

          {/* Detail Panel */}
          <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] p-6 overflow-y-auto">
            {isCreating ? (
              <div className="max-w-xl">
                {renderNewIssueForm(cancelCreating)}
              </div>
            ) : selectedIssue ? (
              <div className="max-w-2xl">
                {renderIssueDetail(undefined, false)}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                <div className="text-center">
                  <span className="text-4xl block mb-2">📋</span>
                  <p className="text-sm">Select an issue to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </>
  )
}
