import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Stores a notify-me signup (email + preferences) in the notify_subscribers
// table. Email alerts themselves are a later feature; this captures interest.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from('notify_subscribers').insert({
      email,
      regions: body.regions || [],
      states: body.states || [],
      types: body.types || [],
      divisions: body.divisions || [],
      genders: body.genders || [],
      orgs: body.orgs || [],
    })
    if (error) {
      console.error('notify insert error:', error)
      return NextResponse.json({ error: 'Could not save' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('notify route error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
