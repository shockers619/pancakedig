import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { US_STATES, SITE_URL, slugify, orgChips } from '@/lib/constants'
import { getApprovedClubs, statePath, cityPath, ageSpan, MIN_CLUBS_FOR_CITY_PAGE, ClubRow } from '@/lib/clubs'
import { ClubIndexList } from '@/components/ClubIndexList'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

// State index — top of the discovery hierarchy. Lists the cities that have their
// own pages, then every club in the state (crawlable links down to detail pages).
export const revalidate = 86400
export const dynamicParams = false

function stateClubs(all: ClubRow[], stateAbbr: string): ClubRow[] {
  return all.filter(c => (c.state || '').toLowerCase() === stateAbbr)
    .sort((a, b) => (a.club || '').localeCompare(b.club || ''))
}

// Cities in a state that clear the depth bar, with display name + count.
function pagedCities(clubs: ClubRow[]): { slug: string; name: string; count: number }[] {
  const map = new Map<string, { name: string; count: number }>()
  for (const c of clubs) {
    if (!c.city) continue
    const slug = slugify(c.city)
    const cur = map.get(slug) || { name: c.city, count: 0 }
    cur.count++
    map.set(slug, cur)
  }
  return Array.from(map.entries())
    .filter(([, v]) => v.count >= MIN_CLUBS_FOR_CITY_PAGE)
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export async function generateStaticParams() {
  const all = await getApprovedClubs()
  return Array.from(new Set(all.map(c => (c.state || '').toLowerCase()).filter(Boolean))).map(state => ({ state }))
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateAbbr = params.state.toLowerCase()
  const stateName = US_STATES[stateAbbr]?.name
  if (!stateName) return { title: 'Volleyball clubs — Pancake Dig' }
  const all = await getApprovedClubs()
  const clubs = stateClubs(all, stateAbbr)
  if (!clubs.length) return { title: `${stateName} volleyball clubs — Pancake Dig` }
  const cityCount = new Set(clubs.map(c => c.city).filter(Boolean)).size
  const title = `Volleyball Clubs in ${stateName} | ${clubs.length} Junior Programs — Pancake Dig`
  const desc = `Directory of ${clubs.length} grassroots volleyball clubs across ${cityCount} ${stateName} cities${ageSpan(clubs) ? `, ages ${ageSpan(clubs)}` : ''}. Compare programs and contact info on Pancake Dig.`
  const canonical = SITE_URL + statePath(stateAbbr)
  return { title, description: desc, alternates: { canonical }, openGraph: { title, description: desc, url: canonical, type: 'website' } }
}

export default async function StatePage({ params }: { params: { state: string } }) {
  const stateAbbr = params.state.toLowerCase()
  const stateName = US_STATES[stateAbbr]?.name
  if (!stateName) notFound()
  const all = await getApprovedClubs()
  const clubs = stateClubs(all, stateAbbr)
  if (!clubs.length) notFound()

  const cities = pagedCities(clubs)
  const ages = ageSpan(clubs)
  const orgs = Array.from(new Set(clubs.flatMap(c => orgChips(c as any))))
  const totalCities = new Set(clubs.map(c => c.city).filter(Boolean)).size

  const faqs = [
    { q: `How many volleyball clubs are in ${stateName}?`, a: `Pancake Dig lists ${clubs.length} grassroots volleyball clubs across ${totalCities} ${stateName} cities${ages ? `, serving ages ${ages}` : ''}.` },
    ...(orgs.length ? [{ q: `What sanctioning bodies do ${stateName} clubs play under?`, a: `${stateName} clubs listed here are affiliated with ${orgs.join(', ')}.` }] : []),
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: `${stateName} volleyball clubs`, item: SITE_URL + statePath(stateAbbr) },
      ],
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ]

  return (
    <>
      <SiteHeader />
      <main className="wrap listing-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <nav className="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span aria-hidden>›</span>
          <a href="/volleyball-clubs">Volleyball clubs by state</a><span aria-hidden>›</span>
          <span className="crumb-current">{stateName}</span>
        </nav>

        <h1 className="index-h1">Volleyball Clubs in {stateName}</h1>
        <p className="index-lead">
          {clubs.length} grassroots volleyball club{clubs.length === 1 ? '' : 's'} across {totalCities} {stateName} {totalCities === 1 ? 'city' : 'cities'}
          {ages ? `, ages ${ages}` : ''}{orgs.length ? ` — ${orgs.join(', ')}` : ''}.
        </p>

        {cities.length > 0 && (
          <section className="index-cities">
            <h2>Browse by city</h2>
            <div className="city-chips">
              {cities.map(ci => (
                <a key={ci.slug} href={cityPath(stateAbbr, ci.name)} className="city-chip">{ci.name} <span>{ci.count}</span></a>
              ))}
            </div>
          </section>
        )}

        <h2 className="index-h2">All {stateName} clubs</h2>
        <ClubIndexList clubs={clubs} />

        <section className="index-faq">
          <h2>Frequently asked questions</h2>
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <div style={{ marginTop: '22px' }}>
          <a href="/volleyball-clubs" className="index-back">← Volleyball clubs by state</a>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
