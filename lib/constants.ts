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
  tiers?: string[]    // volleyball's real vocabulary — Open, National, American, Liberty, USA, JVA National, etc.
  governing_body?: 'JVA' | 'USAV' | 'AAU' | 'Independent'
  details?: string
  email?: string
  phone?: string
  website?: string
  logo_url?: string
  verified?: boolean
  claimed?: boolean
  featured?: boolean
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

export function formatGender(gender?: string): string {
  if (gender === 'boys') return 'Boys'
  if (gender === 'girls') return 'Girls'
  if (gender === 'coed') return 'Boys & Girls'
  return ''
}
