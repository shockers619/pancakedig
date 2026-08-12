// Minimal Resend sender via REST (no SDK dependency). Returns false and no-ops
// when RESEND_API_KEY is unset, so the app runs fine before email is configured —
// every caller treats email as best-effort. Sends from the Resend-verified
// pancakedig.com domain; replies default to the real info@ inbox.
const FROM = 'Pancake Dig <notifications@pancakedig.com>'
const REPLY_TO = 'info@pancakedig.com'
export const ADMIN_NOTIFY = 'kirbyrectify@gmail.com'

export async function sendEmail({ to, subject, html, replyTo }: {
  to: string | string[]; subject: string; html: string; replyTo?: string
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html, reply_to: replyTo || REPLY_TO }),
    })
    if (!res.ok) console.error('Resend send failed:', res.status, await res.text().catch(() => ''))
    return res.ok
  } catch (e) { console.error('Resend error:', e); return false }
}

// Shared branded wrapper for outbound email bodies (PD navy + volley-yellow).
export function emailShell(inner: string): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #10263B; color: #F4F6F2; padding: 40px 32px;">
    <div style="font-size: 22px; font-weight: 800; letter-spacing: 0.02em; margin-bottom: 24px;"><span style="color:#F4F6F2;">PANCAKE</span> <span style="color:#FFC42B;">DIG</span></div>
    ${inner}
    <p style="font-size: 11px; color: rgba(244,246,242,0.3); margin-top: 32px; line-height: 1.6;">Pancake Dig — the grassroots volleyball directory · <a href="https://pancakedig.com" style="color:#FFC42B;">pancakedig.com</a></p>
  </div>`
}

const BTN = 'display:inline-block;background:#FFC42B;color:#10263B;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;padding:12px 22px;text-decoration:none;margin-top:8px;'
export function emailButton(label: string, href = 'https://pancakedig.com'): string {
  return `<a href="${href}" style="${BTN}">${label}</a>`
}
