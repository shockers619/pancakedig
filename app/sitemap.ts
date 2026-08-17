import type { MetadataRoute } from 'next'
import { getApprovedClubs, statePath, cityPath, MIN_CLUBS_FOR_CITY_PAGE } from '@/lib/clubs'
import { clubPath, SITE_URL, slugify, US_STATES } from '@/lib/constants'

// Regenerated daily (ISR). Lists the homepage, the discovery hub, every state +
// gated-city index page, and every real club detail page — so crawlers find the
// whole SEO surface. Only pages we actually render are emitted (no thin URLs).
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/volleyball-clubs`, changeFrequency: 'weekly', priority: 0.8 },
  ]
  const clubs = await getApprovedClubs()
  if (!clubs.length) return out

  // Club detail pages
  for (const c of clubs) {
    if (c.state && (c.club || c.title)) out.push({ url: SITE_URL + clubPath(c), changeFrequency: 'weekly', priority: 0.6 })
  }
  // State index pages
  const states = new Set(clubs.map(c => (c.state || '').toLowerCase()).filter(s => US_STATES[s]))
  for (const s of Array.from(states)) out.push({ url: SITE_URL + statePath(s), changeFrequency: 'weekly', priority: 0.7 })
  // City index pages (only those clearing the depth bar)
  const cities = new Map<string, { state: string; city: string; n: number }>()
  for (const c of clubs) {
    if (!c.city || !c.state) continue
    const key = `${c.state.toLowerCase()}|${slugify(c.city)}`
    const cur = cities.get(key) || { state: c.state.toLowerCase(), city: c.city, n: 0 }
    cur.n++
    cities.set(key, cur)
  }
  for (const { state, city, n } of Array.from(cities.values())) {
    if (n >= MIN_CLUBS_FOR_CITY_PAGE) out.push({ url: SITE_URL + cityPath(state, city), changeFrequency: 'weekly', priority: 0.7 })
  }
  return out
}
