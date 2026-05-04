'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface TeamMember {
  id: string
  name: string | null
  email: string
  role: 'owner' | 'admin' | 'viewer'
  isYou: boolean
}

interface PendingInvite {
  id: string
  email: string
  role: string
  createdAt: string
  expiresAt: string
  status: 'pending' | 'expired'
}

interface TeamData {
  clientName: string | null
  clientId: string
  team: TeamMember[]
  currentUserRole: 'owner' | 'admin' | 'viewer' | null
  pendingInvites: PendingInvite[]
  viewerIsSiteAdmin?: boolean
}

export default function TeamPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'viewer'>('viewer')
  const [inviting, setInviting] = useState(false)
  const [invited, setInvited] = useState(false)
  const [resending, setResending] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const canManageTeam = data?.currentUserRole === 'owner' || data?.currentUserRole === 'admin'
  const isSiteAdmin = Boolean(data?.viewerIsSiteAdmin)

  const revokeInvite = async (inviteId: string) => {
    if (!confirm('Revoke this invite?')) return
    setRevoking(inviteId)
    try {
      const res = await fetch(`/api/admin/invites/${inviteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to revoke')
      }
      await fetchTeam()
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    } finally {
      setRevoking(null)
    }
  }

  const removeMember = async (userId: string, alsoDeleteUser = false) => {
    const msg = alsoDeleteUser
      ? 'Permanently delete this user? They will lose access to every portal.'
      : 'Remove this user from the team? Their account will remain.'
    if (!confirm(msg)) return
    setRemoving(userId)
    try {
      if (alsoDeleteUser) {
        const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to delete user')
        }
      } else {
        const clientId = data?.clientId
        if (!clientId) throw new Error('Missing clientId')
        const res = await fetch(`/api/portal/team/${userId}?clientId=${clientId}`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to remove member')
        }
      }
      await fetchTeam()
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    } finally {
      setRemoving(null)
    }
  }

  const resendInvite = async (inviteId: string) => {
    setResending(inviteId)
    try {
      const res = await fetch(`/api/admin/invites/${inviteId}/resend`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to resend')
      }
      alert('Invite resent!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setResending(null)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [searchParams])

  const fetchTeam = async () => {
    try {
      const clientId = searchParams.get('clientId')
      const params = clientId ? `?clientId=${clientId}` : ''
      const res = await fetch(`/api/portal/team${params}`)
      if (res.ok) {
        const teamData = await res.json()
        setData(teamData)
      }
    } catch (err) {
      console.error('Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!newEmail) return
    setInviting(true)
    
    try {
      const clientId = searchParams.get('clientId')
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          role: newRole,
          clientId,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send invite')
      }
      
      setInvited(true)
      setNewEmail('')
      setTimeout(() => {
        setInvited(false)
        setShowInvite(false)
        fetchTeam() // Refresh to show pending invite
      }, 2000)
    } catch (err: any) {
      console.error('Invite failed:', err.message)
      alert(err.message)
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Loading team...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Team</p>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Access</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Add or remove team members who can view this project.</p>
        </div>
        {canManageTeam && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all"
          >
            + Invite
          </button>
        )}
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] mb-6">
          {!invited ? (
            <>
              <h2 className="text-sm font-semibold mb-4">Invite a team member</h2>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'viewer')}
                  className="px-3 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !newEmail}
                  className="px-5 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-3">
                They&apos;ll receive an email with a link to access the portal.
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <span className="text-2xl mb-2 block">✅</span>
              <p className="font-medium">Invite sent!</p>
            </div>
          )}
        </div>
      )}

      {/* Team list */}
      <div className="space-y-3">
        {data?.team.map((member) => (
          <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-sm font-medium">
              {member.name?.split(' ').map(n => n[0]).join('') || member.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{member.name || member.email}</span>
                {member.isYou && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-medium">You</span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  member.role === 'owner' 
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : member.role === 'admin'
                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                }`}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{member.email}</p>
            </div>
            {canManageTeam && !member.isYou && member.role !== 'owner' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => removeMember(member.id, false)}
                  disabled={removing === member.id}
                  className="text-xs text-[var(--text-muted)] hover:text-red-600 disabled:opacity-50"
                >
                  {removing === member.id ? 'Removing...' : 'Remove'}
                </button>
                {isSiteAdmin && (
                  <button
                    onClick={() => removeMember(member.id, true)}
                    disabled={removing === member.id}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    title="Permanently delete this user account"
                  >
                    Delete user
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pending + Expired Invites */}
      {data?.pendingInvites && data.pendingInvites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Outstanding Invites</h3>
          <div className="space-y-2">
            {data.pendingInvites.map((invite) => {
              const isExpired = invite.status === 'expired'
              return (
                <div
                  key={invite.id}
                  className={`flex items-center justify-between p-4 rounded-xl border border-dashed ${
                    isExpired ? 'border-red-500/30 bg-red-500/5' : 'border-[var(--border)] bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm ${
                      isExpired ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)]'
                    }`}>
                      {isExpired ? '⚠️' : '✉️'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {isExpired
                          ? `Expired ${new Date(invite.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — never accepted`
                          : 'Invited · awaiting signup'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => resendInvite(invite.id)}
                      disabled={resending === invite.id}
                      className="text-xs text-[var(--accent)] hover:underline disabled:opacity-50"
                    >
                      {resending === invite.id ? 'Sending...' : isExpired ? 'Re-invite' : 'Resend'}
                    </button>
                    {canManageTeam && (
                      <button
                        onClick={() => revokeInvite(invite.id)}
                        disabled={revoking === invite.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        {revoking === invite.id ? 'Revoking...' : isExpired ? 'Delete' : 'Revoke'}
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      isExpired
                        ? 'bg-red-500/10 text-red-600'
                        : invite.role === 'admin'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-gray-500/10 text-gray-600'
                    }`}>
                      {isExpired ? 'expired' : invite.role}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!data?.team || data.team.length === 0) && (!data?.pendingInvites || data.pendingInvites.length === 0) && (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
          <span className="text-3xl mb-3 block">👥</span>
          <p className="text-[var(--text-muted)]">No team members yet.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Invite colleagues to give them access to this portal.</p>
        </div>
      )}

      {/* Permissions note */}
      <div className="mt-8 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
        <h3 className="text-sm font-medium mb-2">Access Levels</h3>
        <div className="text-xs text-[var(--text-muted)] space-y-1">
          <p><strong className="text-amber-600">Owner:</strong> Sign proposals, manage team, full access</p>
          <p><strong className="text-blue-600">Admin:</strong> Invite users, comment, approve deliverables</p>
          <p><strong className="text-gray-500">Viewer:</strong> Read-only access, can comment</p>
        </div>
      </div>
    </div>
  )
}
