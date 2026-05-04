'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/portal'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Force navigation with window.location for more reliable redirect
      window.location.href = callbackUrl
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight">
              dave<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>
          <p className="text-sm text-[var(--text-muted)] mt-2">Sign in to your client portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 text-sm bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 text-sm bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-xl placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-semibold bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Don&apos;t have an account?{' '}
          <span className="text-[var(--text-secondary)]">
            Check your email for an invite link.
          </span>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-8 p-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]/50">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-2">Demo Account</p>
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="font-mono">demo@example.com</span> / <span className="font-mono">demo123</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <span className="text-2xl font-bold tracking-tight">
          dave<span className="text-[var(--accent)]">.</span>
        </span>
        <p className="text-sm text-[var(--text-muted)] mt-4">Loading...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
