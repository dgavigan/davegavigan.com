'use client'

import { useState } from 'react'
import Image from 'next/image'

const updates = [
  {
    id: '3',
    type: 'video' as const,
    date: 'Mar 16, 2026',
    time: '9:15 AM',
    title: 'Site walkthrough — homepage & product pages',
    body: 'Quick walkthrough of the homepage layout and product page templates. Looking for feedback on the hero section and whether the freight shipping calculator placement makes sense.',
    videoUrl: '#',
    videoDuration: '4:32',
    videoThumb: null,
    reactions: [{ emoji: '👍', from: 'Sarah' }],
    comments: [
      { from: 'Jared Booth', initials: 'JB', time: '10:02 AM', text: 'Love the hero. Can we make the freight calculator more prominent? Customers always ask about shipping first.' },
    ],
  },
  {
    id: '2',
    type: 'photo' as const,
    date: 'Mar 15, 2026',
    time: '3:30 PM',
    title: 'Design direction — two options',
    body: 'Here are two directions for the overall visual style. Option A is cleaner/minimal, Option B leans more into the medical equipment industry feel. Let me know which resonates.',
    photos: ['/placeholder-design-a.png', '/placeholder-design-b.png'],
    reactions: [],
    comments: [],
  },
  {
    id: '1',
    type: 'text' as const,
    date: 'Mar 14, 2026',
    time: '4:45 PM',
    title: 'Discovery call recap',
    body: 'Great call today! Here\'s a summary of what we covered:\n\n• Current site pain points — slow load times, no mobile optimization, confusing checkout\n• Target audience — medical offices, clinics, and hospital procurement teams\n• Key requirement — freight shipping for items over 100 lbs needs to be front and center\n• Competitor sites reviewed — McKesson, Medline, Henry Schein\n• Timeline alignment — targeting May launch\n\nI\'ll have the full requirements doc ready by Monday. In the meantime, if anything else comes to mind, drop it in the comments here.',
    reactions: [{ emoji: '🙏', from: 'Jared' }],
    comments: [
      { from: 'Jared Booth', initials: 'JB', time: '5:12 PM', text: 'Perfect recap. One thing I forgot to mention — we need a quote request form for bulk orders. Some of our hospital clients order 50+ units.' },
      { from: 'Dave Gavigan', initials: 'DG', time: '5:20 PM', text: 'Great catch — I\'ll add that to the requirements. Makes total sense for the B2B flow.' },
    ],
  },
]

export default function UpdatesPage() {
  const [commentText, setCommentText] = useState<Record<string, string>>({})

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Updates</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Project Updates</h1>
        <p className="text-sm text-[var(--text-secondary)]">Async updates, demos, and discussions. No meetings required.</p>
      </div>

      {/* Updates feed */}
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            {/* Header */}
            <div className="p-5 pb-0">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--border)]">
                  <Image src="/assets/me.jpg" alt="Dave" width={36} height={36} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Dave Gavigan</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{update.date} · {update.time}</span>
                  </div>
                  <h2 className="text-[15px] font-medium mt-0.5">{update.title}</h2>
                </div>
                {update.type === 'video' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 text-red-500 bg-red-500/5 font-medium shrink-0">
                    🎥 Video
                  </span>
                )}
                {update.type === 'photo' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 text-blue-500 bg-blue-500/5 font-medium shrink-0">
                    📸 Photos
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-5 pb-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{update.body}</p>
            </div>

            {/* Video embed */}
            {update.type === 'video' && (
              <div className="mx-5 mb-4 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="aspect-video flex items-center justify-center relative cursor-pointer group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--border)]" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[var(--accent)] flex items-center justify-center text-white group-hover:opacity-80 transition-all shadow-lg">
                      <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{update.videoDuration}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Photo grid */}
            {update.type === 'photo' && update.photos && (
              <div className="mx-5 mb-4 grid grid-cols-2 gap-2">
                {update.photos.map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-center">
                    <span className="text-xs text-[var(--text-muted)]">Design Option {String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {update.reactions.length > 0 && (
              <div className="px-5 pb-3 flex items-center gap-2">
                {update.reactions.map((r, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]">
                    {r.emoji} <span className="text-[var(--text-muted)]">{r.from}</span>
                  </span>
                ))}
                <button className="text-xs px-2 py-0.5 rounded-full border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]/50 transition-colors">
                  + React
                </button>
              </div>
            )}

            {/* Comments */}
            {update.comments.length > 0 && (
              <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50">
                <div className="px-5 py-3 space-y-3">
                  {update.comments.map((c, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text-muted)] shrink-0">
                        {c.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{c.from}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{c.time}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment input */}
            <div className="border-t border-[var(--border)] px-5 py-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText[update.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [update.id]: e.target.value })}
                  className="flex-1 px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-lg placeholder-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none transition-colors"
                />
                <button className="px-3 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-80 transition-all">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
