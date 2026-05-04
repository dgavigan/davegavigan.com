'use client'

import Link from 'next/link'

type ProjectStatus = 'active' | 'upcoming' | 'completed'

interface Project {
  id: string
  name: string
  client: string
  status: ProjectStatus
  progress: number
  startDate: string
  endDate?: string
  investment: number
  description: string
  proposalLink?: string
}

const projects: Project[] = [
  {
    id: 'demo-acme-2026',
    name: 'Phase I: Foundation & Discovery',
    client: 'Acme Medical Supply',
    status: 'active',
    progress: 5,
    startDate: 'Mar 2026',
    investment: 6500,
    description: 'Complete Shopify theme rebuild with parallel audit of ShipperHQ and Shopify Plus configuration.',
    proposalLink: '/portal/proposals/demo-acme-2026',
  },
  {
    id: 'demo-acme-phase2',
    name: 'Phase II: Shopify Plus Features',
    client: 'Acme Medical Supply',
    status: 'upcoming',
    progress: 0,
    startDate: 'TBD',
    investment: 0,
    description: 'B2B customer portal, abandoned cart flows, analytics setup, and ShipperHQ optimization. Scope determined by Phase I audit.',
  },
]

// Group by client
const clients = [...new Set(projects.map(p => p.client))]

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  upcoming: { label: 'Upcoming', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
}

export default function ProjectsPage() {
  const activeProjects = projects.filter(p => p.status === 'active')
  const upcomingProjects = projects.filter(p => p.status === 'upcoming')
  const completedProjects = projects.filter(p => p.status === 'completed')

  const totalInvested = projects.filter(p => p.status === 'completed' || p.status === 'active').reduce((sum, p) => sum + p.investment, 0)

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Projects</p>
        <h1 className="text-2xl md:text-3xl font-bold">All Projects</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)]">
          <div className="text-2xl font-bold">{activeProjects.length}</div>
          <div className="text-xs text-[var(--text-muted)]">Active</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)]">
          <div className="text-2xl font-bold">{completedProjects.length}</div>
          <div className="text-xs text-[var(--text-muted)]">Completed</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)]">
          <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-muted)]">Total Invested</div>
        </div>
      </div>

      {/* Group by client */}
      {clients.map(client => {
        const clientProjects = projects.filter(p => p.client === client)
        return (
          <div key={client} className="mb-8">
            <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">{client}</h2>
            <div className="space-y-3">
              {clientProjects.map(project => {
                const status = statusConfig[project.status]
                return (
                  <div 
                    key={project.id}
                    className={`p-5 rounded-2xl border-2 transition-all ${
                      project.status === 'active' 
                        ? 'border-emerald-500/30 bg-[var(--bg-card)] hover:border-emerald-500/50' 
                        : project.status === 'upcoming'
                          ? 'border-[var(--border)] bg-[var(--bg-card)] opacity-60'
                          : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold">{project.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{project.description}</p>
                      </div>
                      {project.investment > 0 && (
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold">${project.investment.toLocaleString()}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">{project.startDate}</div>
                        </div>
                      )}
                      {project.status === 'upcoming' && (
                        <div className="text-right shrink-0">
                          <div className="text-sm text-[var(--text-muted)]">TBD</div>
                          <div className="text-[10px] text-[var(--text-muted)]">After Phase I audit</div>
                        </div>
                      )}
                    </div>

                    {/* Progress bar for active/completed */}
                    {project.status !== 'upcoming' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[var(--text-muted)]">Progress</span>
                          <span className="text-[10px] font-mono font-bold">{project.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${project.status === 'completed' ? 'bg-blue-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${project.progress}%` }} 
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {project.status === 'active' && (
                        <>
                          <Link href="/portal" className="px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all">
                            Go to Dashboard
                          </Link>
                          {project.proposalLink && (
                            <Link href={project.proposalLink} className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:border-[var(--text-muted)] transition-all">
                              View Proposal
                            </Link>
                          )}
                        </>
                      )}
                      {project.status === 'upcoming' && (
                        <span className="text-xs text-[var(--text-muted)]">
                          Scope & pricing determined by Phase I audit
                        </span>
                      )}
                      {project.status === 'completed' && (
                        <Link href="/portal" className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:border-[var(--text-muted)] transition-all">
                          View Archive
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Roadmap visualization */}
      <div className="mt-8 p-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-card)]">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-4">Project Roadmap</h2>
        <div className="flex items-center gap-2">
          {projects.map((project, i) => (
            <div key={project.id} className="flex items-center flex-1">
              <div className={`flex-1 p-3 rounded-lg text-center ${
                project.status === 'active' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                project.status === 'completed' ? 'bg-blue-500/10 border border-blue-500/30' :
                'bg-[var(--bg-secondary)] border border-[var(--border)] opacity-50'
              }`}>
                <div className="text-xs font-medium truncate">{project.name.split(':')[0]}</div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {project.status === 'active' && 'In Progress'}
                  {project.status === 'upcoming' && 'Coming Next'}
                  {project.status === 'completed' && 'Done'}
                </div>
              </div>
              {i < projects.length - 1 && (
                <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
