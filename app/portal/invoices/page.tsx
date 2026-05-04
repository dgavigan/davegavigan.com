'use client'

import { useState, useEffect } from 'react'

interface Invoice {
  id: string
  number: string | null
  description: string | null
  amount: number
  status: string
  dueDate: string | null
  paidAt: string | null
  createdAt: string
}

interface InvoicesData {
  projectName: string
  invoices: Invoice[]
  total: number
  paid: number
  remaining: number
}

export default function InvoicesPage() {
  const [data, setData] = useState<InvoicesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/portal/invoices')
      if (res.ok) {
        const invoicesData = await res.json()
        setData(invoicesData)
      }
    } catch (err) {
      console.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Loading invoices...</p>
      </div>
    )
  }

  const paidInvoices = data?.invoices.filter(inv => inv.status === 'paid') || []
  const pendingInvoices = data?.invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent') || []
  const upcomingInvoices = data?.invoices.filter(inv => inv.status === 'draft') || []

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">Invoices</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Billing</h1>
        <p className="text-sm text-[var(--text-secondary)]">Milestone-based billing. You only pay for completed, approved work.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Total</div>
          <div className="text-lg font-bold">{formatCurrency(data?.total || 0)}</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Paid</div>
          <div className="text-lg font-bold text-green-600">{formatCurrency(data?.paid || 0)}</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Remaining</div>
          <div className="text-lg font-bold">{formatCurrency(data?.remaining || 0)}</div>
        </div>
      </div>

      {/* Pending payment */}
      {pendingInvoices.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Payment Due</h2>
          <div className="space-y-2">
            {pendingInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold">{inv.number || 'Invoice'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
                      {inv.status === 'sent' ? 'Awaiting Payment' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {inv.description}
                    {inv.dueDate && ` · Due ${formatDate(inv.dueDate)}`}
                  </div>
                </div>
                <div className="text-lg font-bold shrink-0">{formatCurrency(inv.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid */}
      {paidInvoices.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Paid</h2>
          <div className="space-y-2">
            {paidInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold">{inv.number || 'Invoice'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 font-medium">Paid</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {inv.description}
                    {inv.paidAt && ` · Paid ${formatDate(inv.paidAt)}`}
                  </div>
                </div>
                <div className="text-lg font-bold shrink-0">{formatCurrency(inv.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingInvoices.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Upcoming</h2>
          <div className="space-y-2">
            {upcomingInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] opacity-50">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{inv.description || 'Invoice'}</div>
                  <div className="text-xs text-[var(--text-muted)]">On completion</div>
                </div>
                <div className="text-lg font-bold shrink-0">{formatCurrency(inv.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!data?.invoices || data.invoices.length === 0) && (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
          <span className="text-3xl mb-3 block">💳</span>
          <p className="text-[var(--text-muted)]">No invoices yet.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Invoices will appear here as milestones are completed.</p>
        </div>
      )}

      {/* Note */}
      <div className="mt-8 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
        <p className="text-xs text-[var(--text-muted)]">
          <strong>Payment Terms:</strong> Invoices are due within 7 days. Pay via bank transfer or credit card. 
          Questions? Contact <a href="mailto:dave@davegavigan.com" className="text-[var(--accent)] hover:underline">dave@davegavigan.com</a>
        </p>
      </div>
    </div>
  )
}
