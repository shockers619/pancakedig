import { NextResponse } from 'next/server'
import { sendEmail, emailShell, emailButton, ADMIN_NOTIFY } from '@/lib/email'

// Emails the admin when a director files a claim request (fired fire-and-forget
// from ClaimListingButton). Always returns ok — a failed email must never surface
// to the requester, whose claim is already saved in the DB.
export async function POST(req: Request) {
  try {
    const { listingId, listingTitle, requesterName, requesterEmail, requesterMessage } = await req.json()
    await sendEmail({
      to: ADMIN_NOTIFY,
      replyTo: requesterEmail,
      subject: `Claim request: ${listingTitle}`,
      html: emailShell(`
        <div style="font-size:11px;color:#FFC42B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">New claim request</div>
        <p style="font-size:14px;line-height:1.6;"><strong>${requesterName || 'Someone'}</strong> (${requesterEmail || 'no email'}) wants to claim <strong>${listingTitle}</strong> (listing #${listingId}).</p>
        ${requesterMessage ? `<p style="font-size:13px;color:rgba(244,246,242,0.7);">“${requesterMessage}”</p>` : ''}
        ${emailButton('Open Admin queue')}`),
    })
  } catch {}
  return NextResponse.json({ ok: true })
}
