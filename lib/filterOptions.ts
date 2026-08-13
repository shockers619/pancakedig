export const REGIONS: [string, string][] = [
  ['Northeast', 'CT, MA, ME, NH, NJ, NY, PA, RI, VT'],
  ['Mid-Atlantic', 'DC, DE, MD, VA, WV'],
  ['Southeast', 'AL, FL, GA, KY, MS, NC, SC, TN'],
  ['South', 'AR, LA, OK, TX'],
  ['Midwest', 'IA, IL, IN, KS, MI, MN, MO, ND, NE, OH, SD, WI'],
  ['Mountain', 'AZ, CO, ID, MT, NM, NV, UT, WY'],
  ['Pacific', 'AK, CA, HI, OR, WA'],
]

export const TYPES: [string, string][] = [
  ['club', 'Club Profiles'],
  ['tryout', 'Tryouts'],
  ['training', 'Training'],
  ['officiating', 'Referees'],
  ['venue', 'Venues'],
  ['opening', 'Roster Openings'],
  ['showcase', 'Events'],
]

export const EVENT_TYPES = ['Tournaments', 'Camps & Clinics', 'Recruiting Showcases', 'Leagues', 'Open Gyms']

// Snow volleyball is a real FIVB discipline but has no US junior/grassroots scene,
// so it's intentionally omitted — an empty filter would just mislead. Grass stays
// (an established warm-weather junior format).
export const SURFACES = ['Indoor', 'Beach', 'Grass']

// LEVELS: kept for the post form + listing display only. NOT a search filter —
// a single club spans every level (its National, Regional, and local teams all
// at once), so filtering by one can't separate clubs and would just mislead.
export const LEVELS = ['Open / National', 'Premier / USA / Freedom', 'Club / Regional / Select', 'Rec / Instructional']

// The recognized sanctioning bodies — the ONLY orgs that earn their own filter
// checkbox and a gold chip. USAV/JVA/AAU = the big indoor circuits; LOVB = the
// growing junior club network; AVP America = grassroots beach. (NFHS/High School
// and USYVL were dropped: NFHS is a school-team model that can't populate a club
// directory, and USYVL is one CA-only rec org — too narrow to be a category.)
export const RECOGNIZED_ORGS = ['USAV', 'JVA', 'AAU', 'LOVB', 'AVP America']

// The catch-all: everything OUTSIDE the recognized five collapses into one honest
// bucket — literal "Unaffiliated" (no body), unknown, AND any niche org a poster
// self-identifies via "Other" (e.g. USYVL, a regional league). It's a coherent set
// (the complement of the recognized bodies), unlike a "miscellaneous" grab-bag.
export const ORG_OTHER = 'Unaffiliated / Other'

// Search + Notify dropdowns: the five recognized bodies + the single catch-all.
export const ORG_FILTER_OPTIONS = [...RECOGNIZED_ORGS, ORG_OTHER]

// Post form: recognized bodies + literal "Unaffiliated" (genuinely no sanctioning
// body). A niche affiliation is entered through the separate free-text "Other"
// field in PostListingModal, not a checkbox here.
export const ORG_POST_OPTIONS = [...RECOGNIZED_ORGS, 'Unaffiliated']

// True when a listing is affiliated with NONE of the recognized bodies — what the
// "Unaffiliated / Other" filter selects (covers blank, "Unaffiliated", and niche
// orgs like "USYVL" alike).
export function isOrgOther(governingBody?: string | null): boolean {
  const bodies = (governingBody || '').split(',').map(s => s.trim()).filter(Boolean)
  return !bodies.some(b => RECOGNIZED_ORGS.includes(b))
}

export const GENDERS = ['Boys', 'Girls', 'Coed']

// 10U is the real floor for organized club/travel divisions — regional
// volleyball associations (e.g. Ohio Valley Region) explicitly document
// 10-and-Under as a standard division; nothing younger is standard at the
// competitive club level the way it sometimes is in other youth sports.
export const DIVISIONS = ['18U', '17U', '16U', '15U', '14U', '13U', '12U', '11U', '10U']

export const REGION_KEY: Record<string, string> = {
  'Northeast': 'northeast', 'Mid-Atlantic': 'midatlantic', 'Southeast': 'southeast',
  'South': 'south', 'Midwest': 'midwest', 'Mountain': 'mountain', 'Pacific': 'pacific',
}

export function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}
