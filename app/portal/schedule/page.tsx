'use client'

import { useState } from 'react'

export default function SchedulePage() {
  const [sent, setSent] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Open mailto
    const mailtoUrl = `mailto:dave@davegavigan.com?subject=${encodeURIComponent(subject || 'Office Hours Request')}&body=${encodeURIComponent(message)}`
    window.open(mailtoUrl, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Office Hours</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Schedule a Call</h1>
        <p className="text-sm text-[var(--text-secondary)]">Need to discuss something? Let's find a time to chat.</p>
      </div>

      {/* Quick contact */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <a
          href="mailto:dave@davegavigan.com"
          className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 transition-all group"
        >
          <span className="text-2xl mb-3 block">✉️</span>
          <h3 className="font-semibold mb-1">Email</h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">Best for async questions and updates</p>
          <span className="text-sm text-[var(--accent)] group-hover:underline">dave@davegavigan.com</span>
        </a>

        <a
          href="https://calendly.com/davegavigan"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 transition-all group"
        >
          <span className="text-2xl mb-3 block">📅</span>
          <h3 className="font-semibold mb-1">Book a Call</h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">30-min video call for deeper discussions</p>
          <span className="text-sm text-[var(--accent)] group-hover:underline">Schedule on Calendly →</span>
        </a>
      </div>

      {/* Quick message form */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <h3 className="font-semibold mb-4">Quick Message</h3>
        
        {sent ? (
          <div className="text-center py-8">
            <span className="text-3xl mb-3 block">✅</span>
            <p className="font-medium">Email client opened!</p>
            <p className="text-sm text-[var(--text-muted)]">Send when ready.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Quick question about..."
                className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full px-4 py-2.5 bg-transparent border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90"
            >
              Open in Email Client
            </button>
          </form>
        )}
      </div>

      {/* Response time */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
        <p className="text-sm text-[var(--text-muted)]">
          <strong>Response Time:</strong> I typically respond within 24 hours on business days. 
          For urgent matters, mention "URGENT" in the subject line.
        </p>
      </div>
    </div>
  )
}
