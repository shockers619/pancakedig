import { NextResponse } from 'next/server'
import { sendEmail, emailShell, emailButton } from '@/lib/email'

// Emails the claimant when the admin approves their claim (fired fire-and-forget
// from AdminQueue.resolveClaim). Closes the loop promised in ClaimListingButton's
// confirmation ("we'll reach out once it's approved"). Always returns ok — a failed
// email must never block the approval, which is already committed in the DB.
export async function POST(req: Request) {
  try {
    const { listingTitle, requesterEmail, requesterName } = await req.json()
    if (requesterEmail) {
      await sendEmail({
        to: requesterEmail,
        subject: `You're approved: ${listingTitle}`,
        html: emailShell(`
          <div style="font-size:11px;color:#FFC42B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Claim approved</div>
          <p style="font-size:14px;line-height:1.6;">Hi${requesterName ? ` ${requesterName}` : ''} — good news. Your claim on <strong>${listingTitle}</strong> has been approved.</p>
          <p style="font-size:14px;line-height:1.6;">Sign in at pancakedig.com and you can edit your listing anytime — update the details, add socials, and post other listings if you'd like. It's yours to keep current.</p>
          ${emailButton('Sign in & edit your listing')}
          <p style="font-size:13px;color:rgba(244,246,242,0.7);line-height:1.6;margin-top:20px;">Anything look off, or need a hand? Just reply to this email.</p>`),
      })
    }
  } catch {}
  return NextResponse.json({ ok: true })
}
