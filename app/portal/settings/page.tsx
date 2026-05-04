'use client'

import { useEffect, useState } from 'react'

interface Profile {
  id: string
  name: string | null
  email: string
  role: string
  notifyTimelineUpdate: boolean
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [savingNotifications, setSavingNotifications] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => (r.ok ? r.json() : null))
      .then(p => {
        if (p) {
          setProfile(p)
          setName(p.name || '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const saveName = async () => {
    setSavingName(true)
    setNameMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setProfile(data)
      setNameMessage({ type: 'ok', text: 'Saved.' })
    } catch (err) {
      setNameMessage({ type: 'err', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setSavingName(false)
    }
  }

  const toggleNotification = async (key: 'notifyTimelineUpdate', value: boolean) => {
    if (!profile) return
    const previous = profile[key]
    // Optimistic update
    setProfile({ ...profile, [key]: value })
    setSavingNotifications(true)
    setNotificationMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setProfile(data)
      setNotificationMessage({ type: 'ok', text: 'Saved.' })
    } catch (err) {
      setProfile({ ...profile, [key]: previous })
      setNotificationMessage({ type: 'err', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setSavingNotifications(false)
    }
  }

  const savePassword = async () => {
    setPasswordMessage(null)
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'err', text: 'New passwords do not match.' })
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage({ type: 'ok', text: 'Password updated.' })
    } catch (err) {
      setPasswordMessage({ type: 'err', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Loading settings...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-400">Could not load profile.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Update your profile and password.
        </p>
      </div>

      <section className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] mb-6">
        <h2 className="text-sm font-semibold mb-4">Profile</h2>

        <label className="block text-xs text-[var(--text-muted)] mb-1">Email</label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full px-4 py-2.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-muted)] mb-4"
        />

        <label className="block text-xs text-[var(--text-muted)] mb-1">Name</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            onClick={saveName}
            disabled={savingName || name.trim() === (profile.name || '').trim() || name.trim() === ''}
            className="px-5 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 disabled:opacity-50"
          >
            {savingName ? 'Saving...' : 'Save'}
          </button>
        </div>
        {nameMessage && (
          <p className={`mt-2 text-xs ${nameMessage.type === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
            {nameMessage.text}
          </p>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] mb-6">
        <h2 className="text-sm font-semibold mb-1">Notifications</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">Control which emails you receive.</p>

        <label className="flex items-start gap-3 cursor-pointer py-2">
          <input
            type="checkbox"
            checked={profile.notifyTimelineUpdate}
            onChange={e => toggleNotification('notifyTimelineUpdate', e.target.checked)}
            disabled={savingNotifications}
            className="mt-1 w-4 h-4 accent-[var(--accent)]"
          />
          <div>
            <div className="text-sm font-medium">Timeline updates</div>
            <p className="text-xs text-[var(--text-muted)]">
              Email me when a new update, milestone, or deliverable is posted to the project timeline.
            </p>
          </div>
        </label>

        {notificationMessage && (
          <p className={`mt-3 text-xs ${notificationMessage.type === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
            {notificationMessage.text}
          </p>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <h2 className="text-sm font-semibold mb-4">Change Password</h2>

        <label className="block text-xs text-[var(--text-muted)] mb-1">Current password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none mb-4"
        />

        <label className="block text-xs text-[var(--text-muted)] mb-1">New password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none mb-4"
        />

        <label className="block text-xs text-[var(--text-muted)] mb-1">Confirm new password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none mb-4"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">Minimum 8 characters.</p>
          <button
            onClick={savePassword}
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="px-5 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 disabled:opacity-50"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
        {passwordMessage && (
          <p className={`mt-3 text-xs ${passwordMessage.type === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
            {passwordMessage.text}
          </p>
        )}
      </section>
    </div>
  )
}
