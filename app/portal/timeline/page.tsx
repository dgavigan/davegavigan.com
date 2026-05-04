'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { RichText } from '@/components/RichText'

interface Activity {
  id: string
  type: string
  title: string
  description: string | null
  createdAt: string
  metadata?: any
}

interface Deliverable {
  id: string
  name: string
  type: string
  status: string
  url: string | null
  createdAt: string
}

interface TimelineData {
  projectName: string
  projectStatus: string
  activities: Activity[]
  deliverables: Deliverable[]
  nextAction: {
    text: string
    owner: 'client' | 'dave'
    dueDate?: string
  } | null
}

interface Comment {
  id: string
  body: string
  createdAt: string
  user: { id: string; name: string | null; email: string; role?: string }
}

// Combine activities and deliverables into a unified timeline
interface TimelineItem {
  id: string
  type: 'update' | 'milestone' | 'deliverable' | 'proposal' | 'comment' | 'system' | 'proposal_comment'
  title: string
  description: string | null
  date: Date
  icon: string
  status?: string
  url?: string | null
  owner?: string
  activityId?: string
  user?: { id: string; name: string | null; email: string; role?: string }
  commentCount?: number
}

export default function TimelinePage() {
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')
  const projectId = searchParams.get('projectId')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const [data, setData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [postingComment, setPostingComment] = useState<string | null>(null)
  const [deletingComment, setDeletingComment] = useState<string | null>(null)

  useEffect(() => {
    fetchTimeline()
    // Get current user ID from session
    fetch('/api/auth/session').then(r => r.json()).then(d => setCurrentUserId(d?.user?.id || null)).catch(() => {})
  }, [clientId, projectId])

  const toggleComments = async (activityId: string) => {
    setExpandedComments(prev => ({ ...prev, [activityId]: !prev[activityId] }))
    
    // Fetch comments if not already loaded
    if (!comments[activityId]) {
      try {
        const res = await fetch(`/api/comments?activityId=${activityId}`)
        if (res.ok) {
          const data = await res.json()
          setComments(prev => ({ ...prev, [activityId]: data }))
        }
      } catch (err) {
        console.error('Failed to load comments')
      }
    }
  }

  const postComment = async (activityId: string) => {
    const text = newComment[activityId]
    if (!text?.trim()) return
    
    setPostingComment(activityId)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, text }),
      })
      if (res.ok) {
        const comment = await res.json()
        setComments(prev => ({
          ...prev,
          [activityId]: [...(prev[activityId] || []), comment],
        }))
        setNewComment(prev => ({ ...prev, [activityId]: '' }))
      }
    } catch (err) {
      console.error('Failed to post comment')
    } finally {
      setPostingComment(null)
    }
  }

  const deleteComment = async (activityId: string, commentId: string) => {
    if (!confirm('Delete this comment?')) return
    
    setDeletingComment(commentId)
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' })
      if (res.ok) {
        setComments(prev => ({
          ...prev,
          [activityId]: prev[activityId]?.filter(c => c.id !== commentId) || [],
        }))
      }
    } catch (err) {
      console.error('Failed to delete comment')
    } finally {
      setDeletingComment(null)
    }
  }

  const fetchTimeline = async () => {
    const params = new URLSearchParams()
    if (clientId) params.set('clientId', clientId)
    if (projectId) params.set('projectId', projectId)
    const queryString = params.toString() ? `?${params}` : ''
    try {
      const [timelineRes, deliverablesRes] = await Promise.all([
        fetch(`/api/portal/timeline${queryString}`),
        fetch(`/api/portal/deliverables${queryString}`),
      ])
      
      const timelineData = timelineRes.ok ? await timelineRes.json() : { activities: [] }
      const deliverablesData = deliverablesRes.ok ? await deliverablesRes.json() : { deliverables: [] }
      
      setData({
        ...timelineData,
        deliverables: deliverablesData.deliverables || [],
      })
    } catch (err) {
      console.error('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  // Build unified timeline from activities and deliverables
  const buildTimeline = (): TimelineItem[] => {
    const items: TimelineItem[] = []

    // Add activities
    data?.activities?.forEach((activity: any) => {
      items.push({
        id: activity.id,
        activityId: activity.isDbActivity ? activity.id : undefined,  // Only real DB activities can have comments
        type: activity.type as TimelineItem['type'],
        title: activity.title,
        description: activity.description,
        date: new Date(activity.createdAt),
        icon: getActivityIcon(activity.type),
        owner: activity.metadata?.owner,
        user: activity.user,
        commentCount: activity.commentCount || 0,
      })
    })

    // Add deliverables as timeline items
    data?.deliverables?.forEach(deliverable => {
      items.push({
        id: `del-${deliverable.id}`,
        type: 'deliverable',
        title: deliverable.name,
        description: `${deliverable.type} ready for review`,
        date: new Date(deliverable.createdAt),
        icon: '📦',
        status: deliverable.status,
        url: deliverable.url,
      })
    })

    // Sort by date, newest first
    return items.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const getActivityIcon = (type: string): string => {
    const icons: Record<string, string> = {
      proposal: '📝',
      milestone: '✅',
      update: '📣',
      comment: '💬',
      deliverable: '📦',
      system: '⚙️',
    }
    return icons[type] || '📌'
  }

  const formatDate = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Loading timeline...</p>
      </div>
    )
  }

  const timeline = buildTimeline()

  // Determine current status
  const projectStatus = data?.projectStatus || 'pending'
  const statusConfig: Record<string, { label: string; color: string; description: string }> = {
    pending: { 
      label: 'Proposal Stage', 
      color: 'amber',
      description: 'Waiting for proposal review and approval',
    },
    active: { 
      label: 'In Progress', 
      color: 'emerald',
      description: 'Work is underway',
    },
    paused: { 
      label: 'Paused', 
      color: 'gray',
      description: 'Project is temporarily on hold',
    },
    completed: { 
      label: 'Completed', 
      color: 'blue',
      description: 'Project delivered',
    },
  }
  const status = statusConfig[projectStatus] || statusConfig.pending

  // Mock next action for now (would come from DB in production)
  const nextAction = timeline.length === 0 ? {
    text: 'Review and accept the proposal to kick off the project',
    owner: 'client' as const,
  } : null

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Timeline</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Project Progress</h1>
        <p className="text-sm text-[var(--text-secondary)]">Track updates, milestones, and deliverables as your project evolves.</p>
      </div>

      {/* Current Status Card */}
      <div className={`mb-6 p-5 rounded-2xl border-2 border-${status.color}-500/30 bg-${status.color}-500/5`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full bg-${status.color}-500 animate-pulse`} />
              <span className={`text-sm font-semibold text-${status.color}-600`}>{status.label}</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{status.description}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Project</div>
            <div className="text-sm font-medium">{data?.projectName || 'Your Project'}</div>
          </div>
        </div>
      </div>

      {/* Next Action */}
      {nextAction && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              nextAction.owner === 'client' 
                ? 'bg-amber-500/10 text-amber-600' 
                : 'bg-blue-500/10 text-blue-600'
            }`}>
              {nextAction.owner === 'client' ? '👤' : '👨‍💻'}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-[var(--text-muted)] mb-1">
                {nextAction.owner === 'client' ? 'Your Action Needed' : 'Dave is working on'}
              </div>
              <p className="text-sm">{nextAction.text}</p>
            </div>
            {nextAction.owner === 'client' && (
              <Link 
                href="/portal" 
                className="px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90"
              >
                Take Action →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Timeline Feed */}
      {timeline.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />

          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  item.type === 'milestone' ? 'bg-emerald-500/10 border-2 border-emerald-500/30' :
                  item.type === 'deliverable' ? 'bg-blue-500/10 border-2 border-blue-500/30' :
                  item.type === 'proposal' ? 'bg-amber-500/10 border-2 border-amber-500/30' :
                  'bg-[var(--bg-card)] border-2 border-[var(--border)]'
                }`}>
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-medium text-sm">{item.title}</h3>
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    {/* Author */}
                    {item.user && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium ${
                          item.user.role === 'admin' ? 'bg-blue-500/20 text-blue-600' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                        }`}>
                          {item.user.name?.[0]?.toUpperCase() || item.user.email[0].toUpperCase()}
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          {item.user.name || item.user.email.split('@')[0]}
                          {item.user.role === 'admin' && <span className="ml-1 text-blue-600">· Dave</span>}
                        </span>
                      </div>
                    )}
                    
                    {item.description && (
                      <RichText
                        text={item.description}
                        className="text-sm text-[var(--text-muted)] mb-2"
                      />
                    )}

                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                      >
                        View deliverable →
                      </a>
                    )}

                    {item.owner && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <span className={item.owner === 'client' ? 'text-amber-600' : 'text-blue-600'}>
                          {item.owner === 'client' ? '👤 Your action' : '👨‍💻 Dave'}
                        </span>
                      </div>
                    )}

                    {/* Comment toggle - only for non-comment items */}
                    {item.activityId && item.type !== 'proposal_comment' && (() => {
                      const loadedCount = comments[item.activityId!]?.length
                      const count = loadedCount !== undefined ? loadedCount : item.commentCount || 0
                      return (
                        <button
                          onClick={() => toggleComments(item.activityId!)}
                          className={`mt-3 text-xs flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                            count > 0
                              ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                              : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)]'
                          }`}
                        >
                          💬 
                          {count > 0 ? (
                            <span className="font-medium">
                              {count} {count === 1 ? 'comment' : 'comments'}
                            </span>
                          ) : (
                            <span>{expandedComments[item.activityId!] ? 'Hide' : 'Add comment'}</span>
                          )}
                        </button>
                      )
                    })()}

                    {/* Comments section */}
                    {item.activityId && expandedComments[item.activityId] && (
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        {/* Existing comments */}
                        {comments[item.activityId]?.map((comment) => (
                          <div key={comment.id} className="flex gap-2 mb-3 group">
                            <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-medium shrink-0">
                              {comment.user.name?.[0] || comment.user.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{comment.user.name || comment.user.email}</span>
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                {comment.user.id === currentUserId && (
                                  <button
                                    onClick={() => deleteComment(item.activityId!, comment.id)}
                                    disabled={deletingComment === comment.id}
                                    className="text-[10px] text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                  >
                                    {deletingComment === comment.id ? '...' : 'delete'}
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)]">{comment.body}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add comment input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment[item.activityId] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [item.activityId!]: e.target.value }))}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-1.5 text-xs bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && postComment(item.activityId!)}
                          />
                          <button
                            onClick={() => postComment(item.activityId!)}
                            disabled={postingComment === item.activityId || !newComment[item.activityId]?.trim()}
                            className="px-3 py-1.5 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg disabled:opacity-50"
                          >
                            {postingComment === item.activityId ? '...' : 'Post'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state with helpful info */
        <div className="space-y-4">
          {/* What to expect */}
          <div className="p-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]">
            <h3 className="font-semibold mb-3">What you&apos;ll see here</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">📝</span>
                <div>
                  <div className="text-sm font-medium">Proposals</div>
                  <div className="text-xs text-[var(--text-muted)]">When new proposals are ready for review</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📦</span>
                <div>
                  <div className="text-sm font-medium">Deliverables</div>
                  <div className="text-xs text-[var(--text-muted)]">Designs, code, and assets ready for review</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <div>
                  <div className="text-sm font-medium">Milestones</div>
                  <div className="text-xs text-[var(--text-muted)]">When key phases are completed</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📣</span>
                <div>
                  <div className="text-sm font-medium">Updates</div>
                  <div className="text-xs text-[var(--text-muted)]">Progress notes and important info</div>
                </div>
              </div>
            </div>
          </div>

          {/* Getting started */}
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">
              <strong>Getting started:</strong> Once you accept a proposal, updates will appear here automatically. 
              You&apos;ll always know where things stand and what&apos;s next.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
