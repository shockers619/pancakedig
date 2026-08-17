import type { Metadata } from 'next'
import { US_STATES, SITE_URL } from '@/lib/constants'
import { getApprovedClubs, statePath } from '@/lib/clubs'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

// Discovery hub — links to every state that has clubs. One footer link points
// here, which flows crawl authority down: hub → state → city → club.
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Volleyball Clubs by State — Pancake Dig',
  description: 'Browse grassroots junior volleyball clubs by state — verified programs across every U.S. region, with divisions, level, and contact info.',
  alternates: { canonical: `${SITE_URL}/volleyball-clubs` },
}

export default async function ClubsHub() {
  const all = await getApprovedClubs()
  const counts = new Map<string, number>()
  for (const c of all) {
    const s = (c.state || '').toLowerCase()
    if (s) counts.set(s, (counts.get(s) || 0) + 1)
  }
  const states = Array.from(counts.entries())
    .filter(([abbr]) => US_STATES[abbr])
    .map(([abbr, count]) => ({ abbr, name: US_STATES[abbr].name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <SiteHeader />
      <main className="wrap listing-page">
        <nav className="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span aria-hidden>›</span>
          <span className="crumb-current">Volleyball clubs by state</span>
        </nav>

        <h1 className="index-h1">Volleyball Clubs by State</h1>
        <p className="index-lead">
          {all.length} grassroots volleyball clubs across {states.length} states. Pick a state to browse clubs by city.
        </p>

        <div className="state-grid">
          {states.map(s => (
            <a key={s.abbr} href={statePath(s.abbr)} className="state-cell">
              <span className="state-cell-name">{s.name}</span>
              <span className="state-cell-count">{s.count}</span>
            </a>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
