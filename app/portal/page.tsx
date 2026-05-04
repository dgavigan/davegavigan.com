'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GoLiveCountdown } from '@/components/GoLiveCountdown'

interface PortalData {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    isOwner: boolean
  }
  client: {
    id: string
    name: string
    slug: string
  } | null
  projects: Project[]
  team: any[]
}

interface Proposal {
  id: string
  title: string
  status: string
  totalPrice: number
  validUntil: string | null
  content: any
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  progress: number | null
  endDate: string | null
  proposal: Proposal | null  // 1:1 relationship
  phases: any[]
  activities: any[]
  deliverables: any[]
  invoices: any[]
}

export default function PortalDashboard() {
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')
  const projectId = searchParams.get('projectId')
  
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPortalData()
  }, [clientId, projectId])

  const fetchPortalData = async () => {
    try {
      const params = new URLSearchParams()
      if (clientId) params.set('clientId', clientId)
      if (projectId) params.set('projectId', projectId)
      const url = params.toString() ? `/api/portal?${params}` : '/api/portal'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load portal data')
      const portalData = await res.json()
      setData(portalData)
    } catch (err) {
      setError('Failed to load your portal')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Loading your portal...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">{error || 'Something went wrong'}</p>
        <button onClick={fetchPortalData} className="text-sm text-[var(--accent)]">Try again</button>
      </div>
    )
  }

  if (!data.client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">No Projects Yet</h2>
        <p className="text-[var(--text-muted)] mb-4">You don&apos;t have any active projects. Contact Dave to get started.</p>
        <a href="mailto:dave@davegavigan.com" className="text-sm text-[var(--accent)]">dave@davegavigan.com</a>
      </div>
    )
  }

  // Get project from URL params, fall back to active project then first project
  const getDefaultProject = () => {
    const activeProj = data.projects.find(p => p.status === 'active')
    return activeProj || data.projects[0]
  }
  const activeProject = projectId 
    ? data.projects.find(p => p.id === projectId) || getDefaultProject()
    : getDefaultProject()
  const proposal = activeProject?.proposal
  const pendingProposal = proposal?.status === 'pending' ? proposal : null
  const acceptedProposal = proposal?.status === 'accepted' ? proposal : null

  const userName = data.user.name?.split(' ')[0] || data.user.email.split('@')[0]

  // Manually-set progress wins; otherwise derive from status.
  let progress: number
  if (activeProject?.progress !== null && activeProject?.progress !== undefined) {
    progress = activeProject.progress
  } else {
    progress = 5
    if (activeProject?.status === 'active') progress = 25
    if (activeProject?.status === 'completed') progress = 100
    if (acceptedProposal) progress = Math.max(progress, 10)
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
      </div>

      {/* Status Card */}
      <div className="p-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-card)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium">{data.client.name}</span>
            <h2 className="text-lg font-bold">{activeProject?.name || 'No active project'}</h2>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
            activeProject?.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
            activeProject?.status === 'completed' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
            'bg-amber-500/10 text-amber-600 border border-amber-500/20'
          }`}>
            {activeProject?.status || 'pending'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold">{progress}%</div>
            <div className="text-[10px] text-[var(--text-muted)]">Progress</div>
          </div>
          <div>
            <div className="text-xl font-bold">{activeProject?.proposal ? 1 : 0}</div>
            <div className="text-[10px] text-[var(--text-muted)]">Proposal</div>
          </div>
          <div>
            <div className="text-xl font-bold">{activeProject?.deliverables.length || 0}</div>
            <div className="text-[10px] text-[var(--text-muted)]">Deliverables</div>
          </div>
          <div>
            <div className="text-xl font-bold">{data.team.length}</div>
            <div className="text-[10px] text-[var(--text-muted)]">Team</div>
          </div>
        </div>
      </div>

      {/* Go-Live Countdown */}
      <GoLiveCountdown endDate={activeProject?.endDate} />

      {/* Pending Proposal CTA */}
      {pendingProposal && (
        <Link href={`/portal/proposals/${pendingProposal.id}`} className="block mb-6">
          <div className="p-5 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-amber-700 dark:text-amber-400">Proposal ready for review</div>
                <div className="text-xs text-[var(--text-muted)]">{pendingProposal.title} — ${pendingProposal.totalPrice.toLocaleString()}</div>
              </div>
              <span className="text-xs font-medium text-amber-600">Review →</span>
            </div>
          </div>
        </Link>
      )}

      {/* Accepted Proposal */}
      {acceptedProposal && !pendingProposal && (
        <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Proposal accepted</div>
              <div className="text-xs text-[var(--text-muted)]">{acceptedProposal.title} — ${acceptedProposal.totalPrice.toLocaleString()}</div>
            </div>
            <Link href={`/portal/proposals/${acceptedProposal.id}`} className="text-xs font-medium text-emerald-600">View →</Link>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Link href="/portal/timeline" className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 transition-all">
          <span className="text-lg mb-2 block">📋</span>
          <span className="text-sm font-medium">Timeline</span>
        </Link>
        <Link href="/portal/deliverables" className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 transition-all">
          <span className="text-lg mb-2 block">📦</span>
          <span className="text-sm font-medium">Deliverables</span>
        </Link>
        <Link href="/portal/invoices" className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 transition-all">
          <span className="text-lg mb-2 block">💳</span>
          <span className="text-sm font-medium">Invoices</span>
        </Link>
        <Link href="/portal/team" className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 transition-all">
          <span className="text-lg mb-2 block">👥</span>
          <span className="text-sm font-medium">Team</span>
        </Link>
      </div>

      {/* Recent Activity */}
      {activeProject?.activities && activeProject.activities.length > 0 && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activeProject.activities.slice(0, 5).map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-3">
                <span className="text-sm">
                  {activity.type === 'proposal' ? '📝' : activity.type === 'milestone' ? '✅' : '📣'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.title}</p>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No activity yet */}
      {(!activeProject?.activities || activeProject.activities.length === 0) && (
        <div className="p-5 rounded-2xl border border-dashed border-[var(--border)] text-center">
          <p className="text-sm text-[var(--text-muted)]">No activity yet. Updates will appear here as your project progresses.</p>
        </div>
      )}
    </div>
  )
}
