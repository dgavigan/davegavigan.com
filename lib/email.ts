import { Resend } from 'resend'

const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== 'false'
const resend = process.env.RESEND_API_KEY && EMAIL_ENABLED ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.FROM_EMAIL || 'Dave Gavigan <dave@davegavigan.com>'
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'davegavigan@gmail.com'
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3002'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail({ to, subject, html, text, attachments }: EmailOptions) {
  if (!resend) {
    console.log('[Email] No RESEND_API_KEY - would send:', { to, subject })
    return { success: true, mock: true }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to,
      subject,
      html,
      text,
      attachments,
    })
    console.log('[Email] Sent:', { to, subject, id: result.data?.id })
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('[Email] Failed:', error)
    return { success: false, error }
  }
}

// ============================================
// CORE EMAILS (action required - always send)
// ============================================

// New proposal ready for review
export async function sendProposalReadyEmail(to: string, name: string, proposalTitle: string, proposalId: string, totalPrice: number) {
  const proposalUrl = `${SITE_URL}/portal/proposals/${proposalId}`
  const formattedPrice = `$${(totalPrice / 100).toLocaleString()}`
  
  return sendEmail({
    to,
    subject: `Proposal Ready: ${proposalTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>Your proposal is ready for review:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px;">${proposalTitle}</h3>
          <p style="margin: 0; font-size: 24px; font-weight: bold;">${formattedPrice}</p>
        </div>
        <p><a href="${proposalUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Review & Sign Proposal</a></p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">Questions? Just reply to this email.</p>
        <p>— Dave</p>
      </div>
    `,
  })
}

// Proposal accepted - sent to client with PDF
export async function sendProposalAcceptedToClient(
  to: string, 
  name: string, 
  proposalTitle: string, 
  totalPrice: number,
  pdfHtml?: string
) {
  const formattedPrice = `$${(totalPrice / 100).toLocaleString()}`
  
  return sendEmail({
    to,
    subject: `Signed: ${proposalTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thanks for signing, ${name}! 🎉</h2>
        <p>Your signed proposal is confirmed:</p>
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <h3 style="margin: 0 0 8px; color: #155724;">${proposalTitle}</h3>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #155724;">${formattedPrice}</p>
        </div>
        <p>A copy of your signed proposal is attached for your records.</p>
        <p><a href="${SITE_URL}/portal" style="display: inline-block; background: #28a745; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Project Portal</a></p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">I'll be in touch soon to kick things off!</p>
        <p>— Dave</p>
      </div>
    `,
  })
}

// Proposal accepted - notification to Dave
export async function sendProposalAcceptedToAdmin(to: string, signerName: string, signerEmail: string, proposalTitle: string, clientName: string, totalPrice: number) {
  const formattedPrice = `$${(totalPrice / 100).toLocaleString()}`
  
  return sendEmail({
    to,
    subject: `💰 Proposal Accepted: ${proposalTitle} (${formattedPrice})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 New signed proposal!</h2>
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <h3 style="margin: 0 0 8px; color: #155724;">${proposalTitle}</h3>
          <p style="margin: 0 0 8px; font-size: 24px; font-weight: bold; color: #155724;">${formattedPrice}</p>
          <p style="margin: 0; color: #155724;"><strong>${signerName}</strong> (${signerEmail})</p>
          <p style="margin: 5px 0 0; color: #666;">${clientName}</p>
        </div>
        <p><a href="${SITE_URL}/admin" style="display: inline-block; background: #28a745; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View in Admin</a></p>
      </div>
    `,
  })
}

// Invoice sent
export async function sendInvoiceEmail(
  to: string, 
  name: string, 
  invoiceNumber: string,
  description: string,
  amount: number,
  dueDate: string,
  paymentLink?: string
) {
  const formattedAmount = `$${(amount / 100).toLocaleString()}`
  const formattedDue = new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  
  return sendEmail({
    to,
    subject: `Invoice ${invoiceNumber}: ${formattedAmount} due ${formattedDue}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>Here's your invoice:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Invoice ${invoiceNumber}</p>
          <h3 style="margin: 0 0 8px;">${description}</h3>
          <p style="margin: 0; font-size: 32px; font-weight: bold;">${formattedAmount}</p>
          <p style="margin: 10px 0 0; color: #666;">Due: ${formattedDue}</p>
        </div>
        ${paymentLink ? `
          <p><a href="${paymentLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Pay Now</a></p>
        ` : `
          <p style="color: #666;">Payment details will be provided separately.</p>
        `}
        <p style="color: #666; font-size: 14px; margin-top: 20px;">Questions about this invoice? Just reply to this email.</p>
        <p>— Dave</p>
      </div>
    `,
  })
}

// ============================================
// ACCOUNT EMAILS (one-time setup)
// ============================================

export async function sendWelcomeEmail(to: string, name: string, password: string) {
  return sendEmail({
    to,
    subject: 'Your Client Portal Access',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${name}!</h2>
        <p>Your client portal account is ready:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 10px 0 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p><a href="${SITE_URL}/login" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Login to Portal</a></p>
        <p style="color: #666; font-size: 14px;">Questions? Just reply to this email.</p>
        <p>— Dave</p>
      </div>
    `,
  })
}

// Timeline update posted — notify opted-in users
export async function sendTimelineUpdateEmail(
  to: string,
  recipientName: string,
  clientName: string,
  updateTitle: string,
  updateBody: string | null,
  updateType: string,
  projectName: string
) {
  const portalUrl = `${SITE_URL}/portal/timeline`
  const icon = updateType === 'milestone' ? '✅' : updateType === 'deliverable' ? '📦' : '📣'
  const label = updateType === 'milestone' ? 'Milestone' : updateType === 'deliverable' ? 'Deliverable' : 'Update'

  // Escape HTML in the body then convert newlines to <br>
  const safeBody = updateBody
    ? updateBody
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#2563eb">$1</a>')
        .replace(/\n/g, '<br>')
    : ''

  return sendEmail({
    to,
    subject: `${icon} ${label}: ${updateTitle} — ${clientName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <p style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">${label} · ${projectName}</p>
        <h2 style="margin: 0 0 16px;">${icon} ${updateTitle}</h2>
        ${safeBody ? `<div style="color: #374151; line-height: 1.6; background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">${safeBody}</div>` : ''}
        <p style="margin-top: 24px;"><a href="${portalUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View in Portal</a></p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          You're getting this because you have timeline notifications on. Manage notifications in your <a href="${SITE_URL}/portal/settings" style="color: #6b7280;">settings</a>.
        </p>
      </div>
    `,
  })
}

export async function sendInviteEmail(to: string, clientName: string, inviteToken: string) {
  const inviteUrl = `${SITE_URL}/invite/${inviteToken}`
  return sendEmail({
    to,
    subject: `You're invited to ${clientName}'s project portal`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're Invited!</h2>
        <p>You've been invited to the client portal for <strong>${clientName}</strong>.</p>
        <p><a href="${inviteUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Accept Invite</a></p>
        <p style="color: #666; font-size: 14px;">This link expires in 7 days.</p>
        <p>— Dave</p>
      </div>
    `,
  })
}
