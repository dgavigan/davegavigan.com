'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

interface InviteData {
  email: string
  clientName: string
  role: string
  expiresAt: string
  expired: boolean
  used: boolean
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [step, setStep] = useState<'welcome' | 'setup' | 'done'>('welcome')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchInvite()
  }, [token])

  const fetchInvite = async () => {
    try {
      const res = await fetch(`/api/invites/${token}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('This invite link is invalid or has expired.')
        } else {
          setError('Failed to load invite')
        }
        return
      }
      const data = await res.json()
      if (data.expired) {
        setError('This invite link has expired.')
        return
      }
      if (data.used) {
        setError('This invite link has already been used.')
        return
      }
      setInvite(data)
    } catch (err) {
      setError('Failed to load invite')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    if (!name || !password) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to accept invite')
      }

      // Sign in with the new credentials
      const result = await signIn('credentials', {
        email: invite!.email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setStep('done')
      } else {
        router.push('/portal')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite')
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

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-3xl mb-4">😕</div>
          <h1 className="text-xl font-semibold mb-2">Invite Not Found</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">{error}</p>
          <Link href="/login" className="text-sm text-[var(--accent)] hover:underline">
            Go to login →
          </Link>
        </div>
      </div>
    )
  }

  if (!invite) return null

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/assets/me.jpg" alt="Dave Gavigan" width={48} height={48} className="rounded-full ring-1 ring-[var(--border)]" />
        </div>

        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Welcome! 👋</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              You&apos;ve been invited to the client portal for <strong className="text-[var(--text-primary)]">{invite.clientName}</strong>.
            </p>

            <div className="p-5 rounded-xl border border-[var(--border)] text-left mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Company</span>
                  <span className="font-medium">{invite.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Your email</span>
                  <span className="font-medium">{invite.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Access level</span>
                  <span className="font-medium capitalize">{invite.role}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-6">
              Your portal includes project milestones, deliverables, invoices, and proposals.
            </p>

            <button
              onClick={() => setStep('setup')}
              className="w-full py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all"
            >
              Accept Invite
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Set up your account</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Create a password to access your portal.
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="email"
                value={invite.email}
                disabled
                className="w-full px-4 py-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-muted)]"
              />
              <input
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleAcceptInvite}
                disabled={saving || !name || !password}
                className="w-full py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all disabled:opacity-50"
              >
                {saving ? 'Creating account...' : 'Create Account & Enter Portal'}
              </button>
            </div>

            <button onClick={() => setStep('welcome')} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              ← Back
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="text-3xl mb-4">✅</div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Account created!</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Your account is ready. You can now log in to access your portal.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all text-center"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-[var(--text-muted)]">
            This is a private invite from Dave Gavigan ·{' '}
            <Link href="https://davegavigan.com" className="underline underline-offset-2">davegavigan.com</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
