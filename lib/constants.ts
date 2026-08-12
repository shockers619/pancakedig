export const REGION_NAMES: Record<string, string> = {
  northeast: 'Northeast',
  midatlantic: 'Mid-Atlantic',
  southeast: 'Southeast',
  south: 'South',
  midwest: 'Midwest',
  mountain: 'Mountain',
  pacific: 'Pacific',
}

// Same state-to-region mapping as FloorBalance — both products use the
// identical 7-region taxonomy, so this is reused directly rather than
// redefined and risking the two falling out of sync.
export const US_STATES: Record<string, { name: string; region: string }> = {
  al: { name: 'Alabama', region: 'southeast' },
  ak: { name: 'Alaska', region: 'pacific' },
  az: { name: 'Arizona', region: 'mountain' },
  ar: { name: 'Arkansas', region: 'south' },
  ca: { name: 'California', region: 'pacific' },
  co: { name: 'Colorado', region: 'mountain' },
  ct: { name: 'Connecticut', region: 'northeast' },
  de: { name: 'Delaware', region: 'midatlantic' },
  fl: { name: 'Florida', region: 'southeast' },
  ga: { name: 'Georgia', region: 'southeast' },
  hi: { name: 'Hawaii', region: 'pacific' },
  id: { name: 'Idaho', region: 'mountain' },
  il: { name: 'Illinois', region: 'midwest' },
  in: { name: 'Indiana', region: 'midwest' },
  ia: { name: 'Iowa', region: 'midwest' },
  ks: { name: 'Kansas', region: 'midwest' },
  ky: { name: 'Kentucky', region: 'southeast' },
  la: { name: 'Louisiana', region: 'south' },
  me: { name: 'Maine', region: 'northeast' },
  md: { name: 'Maryland', region: 'midatlantic' },
  ma: { name: 'Massachusetts', region: 'northeast' },
  mi: { name: 'Michigan', region: 'midwest' },
  mn: { name: 'Minnesota', region: 'midwest' },
  ms: { name: 'Mississippi', region: 'southeast' },
  mo: { name: 'Missouri', region: 'midwest' },
  mt: { name: 'Montana', region: 'mountain' },
  ne: { name: 'Nebraska', region: 'midwest' },
  nv: { name: 'Nevada', region: 'mountain' },
  nh: { name: 'New Hampshire', region: 'northeast' },
  nj: { name: 'New Jersey', region: 'northeast' },
  nm: { name: 'New Mexico', region: 'mountain' },
  ny: { name: 'New York', region: 'northeast' },
  nc: { name: 'North Carolina', region: 'southeast' },
  nd: { name: 'North Dakota', region: 'midwest' },
  oh: { name: 'Ohio', region: 'midwest' },
  ok: { name: 'Oklahoma', region: 'south' },
  or: { name: 'Oregon', region: 'pacific' },
  pa: { name: 'Pennsylvania', region: 'midatlantic' },
  ri: { name: 'Rhode Island', region: 'northeast' },
  sc: { name: 'South Carolina', region: 'southeast' },
  sd: { name: 'South Dakota', region: 'midwest' },
  tn: { name: 'Tennessee', region: 'southeast' },
  tx: { name: 'Texas', region: 'south' },
  ut: { name: 'Utah', region: 'mountain' },
  vt: { name: 'Vermont', region: 'northeast' },
  va: { name: 'Virginia', region: 'midatlantic' },
  wa: { name: 'Washington', region: 'pacific' },
  wv: { name: 'West Virginia', region: 'midatlantic' },
  wi: { name: 'Wisconsin', region: 'midwest' },
  wy: { name: 'Wyoming', region: 'mountain' },
  dc: { name: 'Washington DC', region: 'midatlantic' },
}

// The single admin account (matches FloorBalance's model): this email sees the
// approval queue and can approve/reject/verify any listing and resolve claims.
// Gating is by email on the session; RLS enforces the same email server-side.
export const ADMIN_EMAIL = 'kirbyrectify@gmail.com'

export const TYPE_LABELS: Record<string, string> = {
  club: 'Club Profile',
  tryout: 'Tryout',
  training: 'Training',
  officiating: 'Officiating',
  venue: 'Venue',
  opening: 'Roster Opening',
  showcase: 'Event',
}

export type Listing = {
  id: number
  type: 'club' | 'tryout' | 'training' | 'officiating' | 'venue' | 'opening' | 'showcase'
  club: string
  title: string
  region: string
  state: string
  city?: string
  venue?: string
  division?: string   // comma-separated tokens, e.g. "14U, 15U, 16U" — see house style #5
  gender?: 'boys' | 'girls' | 'coed'
  tiers?: string[]    // competitive level(s) the club fields, e.g. ["Open / National", "Regional / Select"]. A club can span several.
  governing_body?: string  // one OR MORE sanctioning bodies, comma-separated: "USAV", "USAV, JVA", "USAV, JVA, AAU" — clubs commonly multi-affiliate
  surface?: string    // indoor-only directory, so "Indoor" for every listing (kept explicit for the detail view + future-proofing)
  details?: string
  email?: string
  phone?: string
  contact_name?: string
  website?: string
  facebook_url?: string
  instagram_url?: string
  x_url?: string
  tiktok_url?: string
  logo_url?: string
  logo_dark?: boolean   // logo is white/reverse — render on a dark frame
  verified?: boolean
  claimed?: boolean
  featured?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  user_id?: string
  // event-only fields (type === 'showcase'); evergreen listings leave these unset
  event_subtype?: string
  event_date?: string
  event_date_end?: string
  expires_at?: string      // events drop off the site the day after this date
  created_at: string
}

// Formats a comma-separated division token list ("14U, 15U, 16U") into a
// compact display range ("14U-16U") — same collapsing logic FloorBalance
// uses, ported over rather than reinvented.
export function formatDivisionRange(division?: string): string {
  if (!division) return ''
  const parts = division.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length === 0) return ''
  const nums = parts
    .map(raw => ({ raw, num: parseInt(raw, 10) }))
    .filter(p => !isNaN(p.num))
    .sort((a, b) => a.num - b.num)
  if (nums.length === 0) return parts.join(', ')
  const groups: string[] = []
  let rangeStart = nums[0]
  let rangeEnd = nums[0]
  for (let i = 1; i <= nums.length; i++) {
    const current = nums[i]
    if (current && current.num === rangeEnd.num + 1) {
      rangeEnd = current
    } else {
      groups.push(rangeStart.num === rangeEnd.num ? rangeStart.raw : `${rangeStart.raw}-${rangeEnd.raw}`)
      if (current) { rangeStart = current; rangeEnd = current }
    }
  }
  return groups.join(', ')
}

// The lead label that prefixes an event/opening title with an em dash, e.g.
// "Tournament — Summer Slam" or "Open Spot — 16U Setter". Ported from
// FloorBalance's ListingCard rule (opening → "Open Spot", showcase → its
// event_subtype). Evergreen listings (club/venue/training) return null.
export function eventLead(l: { type: string; event_subtype?: string }): string | null {
  if (l.type === 'opening') return 'Open Spot'
  if (l.type === 'showcase' && l.event_subtype) return l.event_subtype
  return null
}

export function formatGender(gender?: string): string {
  if (gender === 'boys') return 'Boys'
  if (gender === 'girls') return 'Girls'
  if (gender === 'coed') return 'Boys & Girls'
  return ''
}

// Events / roster openings: org is an eligibility gate (you need USAV membership to
// enter a USAV event), so it ALWAYS renders — "Unverified" when unknown. Clubs and
// tryouts: org is background, so it shows only when known (no public "Unverified"
// chip — that word collides with the "Verified by Pancake Dig" trust mark). Facilities
// (venue/training): org doesn't apply.
const ORG_PLACEHOLDER_TYPES = new Set(['showcase', 'opening'])
// Types where a blank org is a fillable gap for the internal ?org=Unverified worklist
// (broader than the placeholder set — clubs are tracked here but don't show the chip).
const ORG_TRACKED_TYPES = new Set(['club', 'showcase', 'tryout', 'opening'])

export type OrgChip = { label: string; kind: 'body' | 'independent' | 'unverified' }

// Single source of truth for how a listing's organization renders as chip(s).
// - one or more bodies recorded → each as a gold body chip
// - the literal value "Independent" → a confirmed-none chip (distinct look)
// - blank on an event/opening → "Unverified" (unknown; eligibility matters)
// - blank on a club/tryout/facility → nothing (background or N/A)
export function orgChips(l: Listing): OrgChip[] {
  const bodies = (l.governing_body || '').split(',').map(s => s.trim()).filter(Boolean)
  if (bodies.length) {
    return bodies.map(b => ({
      label: b,
      kind: b.toLowerCase() === 'independent' ? 'independent' : 'body',
    }))
  }
  return ORG_PLACEHOLDER_TYPES.has(l.type) ? [{ label: 'Unverified', kind: 'unverified' }] : []
}

// True when a listing's org is an unfilled gap — the internal worklist state a
// director can filter to (?org=Unverified). Covers clubs even though they don't
// render the chip publicly.
export function isOrgUnverified(l: Listing): boolean {
  const has = (l.governing_body || '').trim().length > 0
  return !has && ORG_TRACKED_TYPES.has(l.type)
}

// Formats an event date (or range), collapsing redundant parts so ranges stay short:
//   single day        → "Jan 9, 2027"
//   same month + year → "Jan 9–11, 2027"
//   same year         → "Sep 12 – Oct 21, 2026"
//   crosses years     → "Dec 20, 2026 – Jan 5, 2027"
// Dates are stored as plain YYYY-MM-DD; parse at local noon so the day never shifts across time zones.
export function formatEventDate(start?: string, end?: string): string {
  if (!start) return ''
  const S = new Date(start + 'T12:00:00')
  const mon = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })
  const full = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (!end || end === start) return full(S)
  const E = new Date(end + 'T12:00:00')
  const sameYear = S.getFullYear() === E.getFullYear()
  if (sameYear && S.getMonth() === E.getMonth()) return `${mon(S)} ${S.getDate()}–${E.getDate()}, ${E.getFullYear()}`
  if (sameYear) return `${mon(S)} ${S.getDate()} – ${mon(E)} ${E.getDate()}, ${E.getFullYear()}`
  return `${full(S)} – ${full(E)}`
}
