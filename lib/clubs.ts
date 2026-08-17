import { createServerSupabaseClient } from './supabase-server'
import { Listing, slugify } from './constants'

// Minimal club shape the index pages (hub / state / city) need. Kept lean so the
// cached read stays small.
export type ClubRow = Pick<Listing,
  'id' | 'club' | 'title' | 'state' | 'city' | 'region' | 'division' | 'gender' |
  'governing_body' | 'logo_url' | 'logo_dark' | 'verified' | 'claimed' | 'tiers'>

// One cached read of every approved club (paged past PostgREST's 1000 cap).
// The server client caches GET reads 30 min, so all the index pages sharing this
// don't each re-hit Supabase — keeps egress low.
export async function getApprovedClubs(): Promise<ClubRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const sb = createServerSupabaseClient()
  const rows: ClubRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from('listings')
      .select('id, club, title, state, city, region, division, gender, governing_body, logo_url, logo_dark, verified, claimed, tiers')
      .eq('status', 'approved').eq('type', 'club').not('state', 'is', null)
      .range(from, from + 999)
    if (!data || data.length === 0) break
    rows.push(...(data as ClubRow[]))
    if (data.length < 1000) break
  }
  return rows
}

// A city earns its own SEO page only with real depth — avoids thin pages.
export const MIN_CLUBS_FOR_CITY_PAGE = 3

export function statePath(state?: string): string {
  return `/volleyball-clubs/${(state || '').toLowerCase()}`
}
export function cityPath(state?: string, city?: string): string {
  return `/volleyball-clubs/${(state || '').toLowerCase()}/${slugify(city || '')}`
}

// Compact age span across a set of clubs, e.g. "10U–18U" (for intros + FAQ).
export function ageSpan(clubs: ClubRow[]): string | null {
  const nums = clubs.flatMap(c => (c.division || '').split(',')).map(s => parseInt(s, 10)).filter(n => !isNaN(n))
  if (!nums.length) return null
  const mn = Math.min(...nums), mx = Math.max(...nums)
  return mn === mx ? `${mn}U` : `${mn}U–${mx}U`
}
