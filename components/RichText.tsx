import React from 'react'

const URL_REGEX = /(https?:\/\/[^\s<>"')]+)/g

function renderWithLinks(text: string, keyPrefix: string) {
  const parts = text.split(URL_REGEX)
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      return (
        <a
          key={`${keyPrefix}-a-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline hover:opacity-80 break-all"
        >
          {part}
        </a>
      )
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>
  })
}

/**
 * Renders plain text while preserving line breaks, converting leading `* ` /
 * `- ` into bullets, and auto-linking URLs. Safe — no HTML interpretation.
 */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n')
  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {lines.map((line, i) => {
        const bulletMatch = line.match(/^\s*[*-]\s+(.*)$/)
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--text-muted)] shrink-0">•</span>
              <span className="min-w-0">{renderWithLinks(bulletMatch[1], `l${i}`)}</span>
            </div>
          )
        }
        return (
          <div key={i} className={line.trim() === '' ? 'h-2' : ''}>
            {renderWithLinks(line, `l${i}`)}
          </div>
        )
      })}
    </div>
  )
}
