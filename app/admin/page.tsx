'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'

interface Client {
  id: string
  name: string
  slug: string
  email: string | null
  projects: Project[]
  users: User[]
  owner: User | null
}

interface Proposal {
  id: string
  title: string
  status: string
  totalPrice: number
  validUntil: string | null
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  progress: number | null
  proposal: Proposal | null  // 1:1 relationship
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

export default function AdminPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'clients' | 'activity'>('clients')
  
  // Forms
  const [showNewClient, setShowNewClient] = useState(false)
  const [showNewProject, setShowNewProject] = useState<string | null>(null)
  const [showPostUpdate, setShowPostUpdate] = useState<string | null>(null)
  const [showCreateUser, setShowCreateUser] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState<string | null>(null)
  
  const [newClient, setNewClient] = useState({ name: '', email: '' })
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '', type: 'update' })
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })
  const [newInvite, setNewInvite] = useState({ email: '', role: 'viewer' })
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/clients')
      if (!res.ok) throw new Error('Failed to fetch')
      setClients(await res.json())
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const createClient = async () => {
    if (!newClient.name) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      if (!res.ok) throw new Error('Failed')
      setNewClient({ name: '', email: '' })
      setShowNewClient(false)
      fetchData()
      showSuccess('Client created!')
    } catch (err) {
      setError('Failed to create client')
    } finally {
      setSaving(false)
    }
  }

  const createProject = async (clientId: string) => {
    if (!newProject.name) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProject, clientId }),
      })
      if (!res.ok) throw new Error('Failed')
      setNewProject({ name: '', description: '' })
      setShowNewProject(null)
      fetchData()
      showSuccess('Project created!')
    } catch (err) {
      setError('Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const updateProjectProgress = async (projectId: string, progress: number | null) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      // Update local state without a full refetch
      setClients(prev =>
        prev.map(c => ({
          ...c,
          projects: c.projects.map(p => (p.id === projectId ? { ...p, progress } : p)),
        }))
      )
      showSuccess(progress === null ? 'Progress cleared' : `Progress set to ${progress}%`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
    }
  }

  const postUpdate = async (projectId: string) => {
    if (!newUpdate.title) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUpdate, projectId }),
      })
      if (!res.ok) throw new Error('Failed')
      setNewUpdate({ title: '', description: '', type: 'update' })
      setShowPostUpdate(null)
      showSuccess('Update posted to timeline!')
    } catch (err) {
      setError('Failed to post update')
    } finally {
      setSaving(false)
    }
  }

  const createUser = async (clientId: string) => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, clientId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      setNewUser({ name: '', email: '', password: '' })
      setShowCreateUser(null)
      fetchData()
      showSuccess('User account created!')
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const createInvite = async (clientId: string) => {
    if (!newInvite.email) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newInvite, clientId }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const inviteUrl = `${window.location.origin}/invite/${data.token}`
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedInvite(data.token)
      setTimeout(() => setCopiedInvite(null), 3000)
      setNewInvite({ email: '', role: 'viewer' })
      setShowInvite(null)
      showSuccess('Invite link copied to clipboard!')
    } catch (err) {
      setError('Failed to create invite')
    } finally {
      setSaving(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
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
      {/* Nav */}
      <nav className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg-primary)] z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/assets/me.jpg" alt="DG" width={28} height={28} className="rounded-full ring-1 ring-[var(--border)]" />
            <span className="text-sm font-medium">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Client Portal</Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          ✓ {successMsg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Clients & Projects</h1>
            <p className="text-sm text-[var(--text-muted)]">Manage client portals, proposals, and timeline updates</p>
          </div>
          <button
            onClick={() => setShowNewClient(!showNewClient)}
            className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90"
          >
            + New Client
          </button>
        </div>

        {/* New client form */}
        {showNewClient && (
          <div className="p-5 rounded-xl border border-[var(--border)] mb-6 bg-[var(--bg-card)]">
            <h2 className="font-medium mb-4">Create new client</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                placeholder="Company name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="email"
                placeholder="Contact email (optional)"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={createClient} disabled={saving || !newClient.name} className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Client'}
              </button>
              <button onClick={() => setShowNewClient(false)} className="px-4 py-2 text-sm text-[var(--text-muted)]">Cancel</button>
            </div>
          </div>
        )}

        {/* Clients list */}
        {clients.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
            <p className="text-[var(--text-muted)]">No clients yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                {/* Client header */}
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{client.name}</h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      {client.users.length} user{client.users.length !== 1 ? 's' : ''} · {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNewProject(showNewProject === client.id ? null : client.id)}
                      className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
                    >
                      + Project
                    </button>
                    <button
                      onClick={() => setShowCreateUser(showCreateUser === client.id ? null : client.id)}
                      className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
                    >
                      + User
                    </button>
                    <button
                      onClick={() => setShowInvite(showInvite === client.id ? null : client.id)}
                      className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg hover:border-emerald-500 hover:text-emerald-500"
                    >
                      📧 Invite
                    </button>
                  </div>
                </div>

                {/* New project form */}
                {showNewProject === client.id && (
                  <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Project name"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <button onClick={() => createProject(client.id)} disabled={saving || !newProject.name} className="px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg disabled:opacity-50">
                      {saving ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                )}

                {/* Create user form */}
                {showCreateUser === client.id && (
                  <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <h4 className="text-xs font-medium mb-2">Create User Account</h4>
                    <div className="grid sm:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <button onClick={() => createUser(client.id)} disabled={saving || !newUser.name || !newUser.email || !newUser.password} className="px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg disabled:opacity-50">
                      {saving ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                )}

                {/* Invite form */}
                {showInvite === client.id && (
                  <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <h4 className="text-xs font-medium mb-2">Send Invite Link</h4>
                    <div className="flex gap-3 mb-3">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={newInvite.email}
                        onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                        className="flex-1 px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                      />
                      <select
                        value={newInvite.role}
                        onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                        className="px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                    <button onClick={() => createInvite(client.id)} disabled={saving || !newInvite.email} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg disabled:opacity-50">
                      {saving ? 'Creating...' : 'Create & Copy Link'}
                    </button>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2">Link will be copied to clipboard</p>
                  </div>
                )}

                {/* Team members */}
                {client.users.length > 0 && (
                  <div className="p-4 border-b border-[var(--border)]">
                    <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2">Team ({client.users.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {client.users.map(user => (
                        <div key={user.id} className="flex items-center gap-2 px-2 py-1 bg-[var(--bg-secondary)] rounded text-xs">
                          <span>{user.name || user.email}</span>
                          {client.owner?.id === user.id && (
                            <span className="text-[9px] px-1 py-0.5 bg-amber-500/20 text-amber-600 rounded">Owner</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                <div className="p-4">
                  {client.projects.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">No projects yet</p>
                  ) : (
                    <div className="space-y-3">
                      {client.projects.map((project) => (
                        <div key={project.id} className="p-4 border border-[var(--border)] rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{project.name}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[project.status] || statusColors.pending}`}>
                                  {project.status}
                                </span>
                              </div>
                              {project.description && <p className="text-xs text-[var(--text-muted)]">{project.description}</p>}
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  step={5}
                                  value={project.progress ?? 0}
                                  onChange={e => {
                                    const v = parseInt(e.target.value, 10)
                                    setClients(prev =>
                                      prev.map(c => ({
                                        ...c,
                                        projects: c.projects.map(p => (p.id === project.id ? { ...p, progress: v } : p)),
                                      }))
                                    )
                                  }}
                                  onMouseUp={e => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value, 10))}
                                  onTouchEnd={e => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value, 10))}
                                  className="w-32 accent-[var(--accent)]"
                                />
                                <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums w-10">
                                  {project.progress ?? '—'}{project.progress !== null && project.progress !== undefined ? '%' : ''}
                                </span>
                                {project.progress !== null && project.progress !== undefined && (
                                  <button
                                    onClick={() => updateProjectProgress(project.id, null)}
                                    className="text-[10px] text-[var(--text-muted)] hover:text-red-500"
                                    title="Clear progress (use status default)"
                                  >
                                    clear
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={`/admin/proposals/new?projectId=${project.id}`}
                                className="px-2 py-1 text-xs border border-[var(--border)] rounded hover:border-[var(--accent)]"
                              >
                                + Proposal
                              </Link>
                              <button
                                onClick={() => setShowPostUpdate(showPostUpdate === project.id ? null : project.id)}
                                className="px-2 py-1 text-xs border border-[var(--border)] rounded hover:border-emerald-500 hover:text-emerald-500"
                              >
                                📣 Post Update
                              </button>
                            </div>
                          </div>

                          {/* Post update form */}
                          {showPostUpdate === project.id && (
                            <div className="p-3 mb-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
                              <div className="mb-2">
                                <input
                                  type="text"
                                  placeholder="Update title"
                                  value={newUpdate.title}
                                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                                  className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                                />
                              </div>
                              <div className="mb-2">
                                <textarea
                                  placeholder="Description (optional)"
                                  value={newUpdate.description}
                                  onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none resize-none"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <select
                                  value={newUpdate.type}
                                  onChange={(e) => setNewUpdate({ ...newUpdate, type: e.target.value })}
                                  className="px-2 py-1 text-xs bg-transparent border border-[var(--border)] rounded"
                                >
                                  <option value="update">📣 Update</option>
                                  <option value="milestone">✅ Milestone</option>
                                  <option value="deliverable">📦 Deliverable</option>
                                </select>
                                <button onClick={() => postUpdate(project.id)} disabled={saving || !newUpdate.title} className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded disabled:opacity-50">
                                  {saving ? 'Posting...' : 'Post to Timeline'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Proposal - 1:1 */}
                          {project.proposal && (
                            <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{project.proposal.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColors[project.proposal.status] || statusColors.pending}`}>
                                  {project.proposal.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">${(project.proposal.totalPrice / 100).toLocaleString()}</span>
                                <Link href={`/admin/proposals/${project.proposal.id}`} className="text-xs text-[var(--accent)]">Edit</Link>
                                <Link href={`/portal/proposals/${project.proposal.id}`} className="text-xs text-[var(--text-muted)]">View</Link>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
