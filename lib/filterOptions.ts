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

export const LEVELS = ['Open / National', 'Premier / USA / Freedom', 'Club / Regional / Select', 'Rec / Instructional']

// USAV/JVA/AAU = the big indoor circuits; LOVB = the growing junior club network;
// AVP America = grassroots beach; NFHS = high school; USYVL = rec youth; Independent = confirmed none.
// (Note: ?org=Unverified is still a valid URL filter for the internal data-gap worklist —
// it's just kept out of the public dropdown so the storefront doesn't advertise gaps.)
export const ORGANIZATIONS = ['USAV', 'JVA', 'AAU', 'LOVB', 'AVP America', 'NFHS / High School', 'USYVL', 'Independent']

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
