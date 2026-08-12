import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendEmail, emailShell, emailButton } from '@/lib/email'
import { TYPE_LABELS } from '@/lib/constants'

// The real "Notify Me" alert sender: given a newly-approved listing, emails every
// notify_subscribers row whose saved preferences match it. Fired from the admin
// approve action. Matching mirrors the on-site filter semantics (any-match on
// multi-value fields; coed satisfies any gender pref; division is substring).
export async function POST(req: Request) {
  try {
    const { listing } = await req.json()
    if (!listing) return NextResponse.json({ error: 'No listing' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data: subs } = await supabase.from('notify_subscribers').select('*')
    if (!subs?.length) return NextResponse.json({ sent: 0 })

    const bodies = (listing.governing_body || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    const matching = subs.filter((s: any) => {
      if (s.regions?.length && !s.regions.includes(listing.region)) return false
      if (s.states?.length && listing.state && !s.states.includes(listing.state)) return false
      if (s.types?.length && !s.types.includes(listing.type)) return false
      if (s.divisions?.length && listing.division && !s.divisions.some((d: string) => listing.division.includes(d))) return false
      if (s.genders?.length && listing.gender && !s.genders.includes(listing.gender) && listing.gender !== 'coed') return false
      if (s.orgs?.length && bodies.length && !s.orgs.some((o: string) => bodies.includes(o))) return false
      return true
    })
    if (!matching.length) return NextResponse.json({ sent: 0 })

    const typeLabel = TYPE_LABELS[listing.type] || listing.type
    let sent = 0
    for (const s of matching) {
      const ok = await sendEmail({
        to: s.email,
        subject: `New ${typeLabel} — ${listing.title || listing.club}`,
        html: emailShell(`
          <div style="font-size:11px;color:#FFC42B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">New ${typeLabel} matches your alert</div>
          <h1 style="font-size:20px;font-weight:800;margin:0 0 8px;color:#F4F6F2;">${listing.title || listing.club}</h1>
          <p style="font-size:13px;color:rgba(244,246,242,0.6);margin-bottom:20px;">${[listing.club !== listing.title ? listing.club : null, listing.division, listing.gender, listing.region].filter(Boolean).join(' · ')}</p>
          ${listing.details ? `<p style="font-size:13px;color:rgba(244,246,242,0.7);line-height:1.6;margin-bottom:20px;">${String(listing.details).substring(0, 200)}${String(listing.details).length > 200 ? '…' : ''}</p>` : ''}
          ${emailButton('View on Pancake Dig')}`),
      })
      if (ok) sent++
    }
    return NextResponse.json({ sent })
  } catch (e) {
    console.error('notify-listing error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
