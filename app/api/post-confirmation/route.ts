import { NextResponse } from 'next/server'
import { sendEmail, emailShell } from '@/lib/email'

// Confirms to the poster that their listing was received (fired fire-and-forget
// after a successful post). Best-effort — never blocks the posting flow.
export async function POST(req: Request) {
  try {
    const { to, title } = await req.json()
    if (to) await sendEmail({
      to,
      subject: `We got your listing: ${title}`,
      html: emailShell(`
        <div style="font-size:11px;color:#FFC42B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Listing received</div>
        <p style="font-size:14px;line-height:1.6;">Thanks for posting <strong>${title}</strong> to Pancake Dig. It’s <strong>pending review</strong> — once approved it goes live on the directory. You can manage it anytime from your account menu.</p>`),
    })
  } catch {}
  return NextResponse.json({ ok: true })
}
