// Server-side PDF generation using html-to-pdf or puppeteer
// For now, we'll create a simple HTML-to-PDF approach

export interface ProposalPdfData {
  title: string
  clientName: string
  summary: string | null
  totalPrice: number
  status: string
  createdAt: string
  acceptedAt: string | null
  signerName: string | null
  signerEmail: string | null
  signatureDataUrl: string | null
  content: {
    concerns?: string[]
    phases?: Array<{
      name: string
      price: number
      hours?: string
      items?: string[]
    }>
    timeline?: string
    payment?: {
      deposit: number
      final: number
      depositNote?: string
      finalNote?: string
    }
    includes?: string[]
  }
}

export function generateProposalHtml(data: ProposalPdfData): string {
  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isSigned = data.status === 'accepted' && !!data.signatureDataUrl
  const statusLabel =
    data.status === 'accepted' ? '✓ Accepted' :
    data.status === 'pending' ? 'Pending Review' :
    data.status === 'draft' ? 'Draft' :
    data.status === 'expired' ? 'Expired' :
    data.status
  const badgeStyle =
    data.status === 'accepted' ? 'background: #22c55e; color: white;' :
    data.status === 'pending' ? 'background: #f59e0b; color: white;' :
    'background: #9ca3af; color: white;'
  const titleSuffix = isSigned ? 'Signed Proposal' : `${statusLabel} — Proposal`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title} - ${titleSuffix}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header .meta { color: #666; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section-title { 
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #666;
      margin-bottom: 10px;
    }
    .summary { font-size: 16px; color: #333; }
    .concerns li { margin-bottom: 8px; color: #333; }
    .phase { 
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
    }
    .phase-header { 
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .phase-name { font-weight: 600; }
    .phase-price { font-weight: 700; font-size: 18px; }
    .phase-hours { color: #666; font-size: 12px; }
    .phase-items { margin-top: 10px; }
    .phase-items li { 
      color: #333;
      margin-bottom: 5px;
      padding-left: 20px;
      position: relative;
    }
    .phase-items li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #22c55e;
    }
    .total-box {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .total-label { font-size: 14px; color: #666; }
    .total-amount { font-size: 36px; font-weight: 700; }
    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }
    .payment-item {
      background: #fafafa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .payment-amount { font-size: 24px; font-weight: 600; }
    .payment-note { font-size: 12px; color: #666; }
    .includes li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .signature-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #000;
    }
    .signature-section h3 { margin-bottom: 20px; }
    .signature-box {
      display: flex;
      gap: 40px;
    }
    .signature-item { flex: 1; }
    .signature-label { font-size: 12px; color: #666; margin-bottom: 5px; }
    .signature-img { 
      max-width: 250px;
      max-height: 80px;
      border-bottom: 1px solid #000;
    }
    .signature-name { margin-top: 5px; font-weight: 500; }
    .signature-date { font-size: 12px; color: #666; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .accepted-badge {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1>${data.title}</h1>
        <p class="meta">${data.clientName}</p>
      </div>
      <span class="accepted-badge" style="${badgeStyle}">${statusLabel}</span>
    </div>
  </div>

  ${data.summary ? `
  <div class="section">
    <p class="section-title">Summary</p>
    <p class="summary">${data.summary}</p>
  </div>
  ` : ''}

  ${data.content.concerns?.length ? `
  <div class="section">
    <p class="section-title">What We're Addressing</p>
    <ul class="concerns">
      ${data.content.concerns.map(c => `<li>${c}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${data.content.phases?.length ? `
  <div class="section">
    <p class="section-title">Scope & Pricing</p>
    ${data.content.phases.map(phase => `
      <div class="phase">
        <div class="phase-header">
          <div>
            <div class="phase-name">${phase.name}</div>
            ${phase.hours ? `<div class="phase-hours">${phase.hours}</div>` : ''}
          </div>
          <div class="phase-price">${formatCurrency(phase.price)}</div>
        </div>
        ${phase.items?.length ? `
          <ul class="phase-items">
            ${phase.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="total-box">
    <p class="total-label">Total Investment</p>
    <p class="total-amount">${formatCurrency(data.totalPrice)}</p>
    ${data.content.payment ? `
      <div class="payment-grid">
        <div class="payment-item">
          <div class="payment-amount">${formatCurrency(data.content.payment.deposit)}</div>
          <div class="payment-note">${data.content.payment.depositNote || 'Deposit to start'}</div>
        </div>
        <div class="payment-item">
          <div class="payment-amount">${formatCurrency(data.content.payment.final)}</div>
          <div class="payment-note">${data.content.payment.finalNote || 'Final at launch'}</div>
        </div>
      </div>
    ` : ''}
  </div>

  ${data.content.timeline ? `
  <div class="section">
    <p class="section-title">Timeline</p>
    <p>${data.content.timeline}</p>
  </div>
  ` : ''}

  ${data.content.includes?.length ? `
  <div class="section">
    <p class="section-title">What's Included</p>
    <ul class="includes">
      ${data.content.includes.map(item => `<li>✓ ${item}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${isSigned ? `
  <div class="signature-section">
    <h3>Acceptance</h3>
    <div class="signature-box">
      <div class="signature-item">
        <p class="signature-label">Client Signature</p>
        <img src="${data.signatureDataUrl}" alt="Signature" class="signature-img" />
        <p class="signature-name">${data.signerName}</p>
        <p class="signature-date">${data.signerEmail}${data.acceptedAt ? ` · ${formatDate(data.acceptedAt)}` : ''}</p>
      </div>
      <div class="signature-item">
        <p class="signature-label">Service Provider</p>
        <p style="font-style: italic; padding: 20px 0; border-bottom: 1px solid #000;">Dave Gavigan</p>
        <p class="signature-name">Dave Gavigan</p>
        <p class="signature-date">dave@davegavigan.com</p>
      </div>
    </div>
  </div>
  ` : `
  <div class="signature-section">
    <h3>Acceptance</h3>
    <p style="color: #666; font-size: 14px; font-style: italic; margin-bottom: 20px;">
      This proposal has not yet been signed. Signature block will appear here once accepted.
    </p>
    <div class="signature-box">
      <div class="signature-item">
        <p class="signature-label">Client Signature</p>
        <div style="height: 80px; border-bottom: 1px dashed #999;"></div>
        <p class="signature-date" style="margin-top: 5px;">Awaiting signature</p>
      </div>
      <div class="signature-item">
        <p class="signature-label">Service Provider</p>
        <p style="font-style: italic; padding: 20px 0; border-bottom: 1px solid #000;">Dave Gavigan</p>
        <p class="signature-name">Dave Gavigan</p>
        <p class="signature-date">dave@davegavigan.com</p>
      </div>
    </div>
  </div>
  `}

  <!-- Footer removed for cleaner look -->
</body>
</html>
`
}
