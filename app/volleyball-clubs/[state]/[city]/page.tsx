import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { US_STATES, SITE_URL, slugify, orgChips } from '@/lib/constants'
import { getApprovedClubs, statePath, cityPath, ageSpan, MIN_CLUBS_FOR_CITY_PAGE, ClubRow } from '@/lib/clubs'
import { ClubIndexList } from '@/components/ClubIndexList'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

// City discovery page — the "[city] volleyball clubs" search + AI-answer intent.
// Gated to cities with real depth (MIN_CLUBS_FOR_CITY_PAGE) so no thin pages.
// Same egress guard as the club pages: pre-rendered set + static 404 for the rest.
export const revalidate = 86400
export const dynamicParams = false

function cityClubsFrom(all: ClubRow[], stateAbbr: string, citySlug: string): ClubRow[] {
  return all.filter(c => c.city && (c.state || '').toLowerCase() === stateAbbr && slugify(c.city) === citySlug)
    .sort((a, b) => (a.club || '').localeCompare(b.club || ''))
}

export async function generateStaticParams() {
  const all = await getApprovedClubs()
  const counts = new Map<string, number>()
  for (const c of all) {
    if (!c.city || !c.state) continue
    const key = `${c.state.toLowerCase()}|${slugify(c.city)}`
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return Array.from(counts.entries())
    .filter(([, n]) => n >= MIN_CLUBS_FOR_CITY_PAGE)
    .map(([key]) => { const [state, city] = key.split('|'); return { state, city } })
}

// The display city name for a slug (first matching club's city, verbatim).
function cityName(clubs: ClubRow[]): string {
  return clubs[0]?.city || ''
}

export async function generateMetadata({ params }: { params: { state: string; city: string } }): Promise<Metadata> {
  const all = await getApprovedClubs()
  const clubs = cityClubsFrom(all, params.state.toLowerCase(), params.city)
  if (!clubs.length) return { title: 'Volleyball clubs — Pancake Dig' }
  const city = cityName(clubs)
  const st = params.state.toUpperCase()
  const title = `Volleyball Clubs in ${city}, ${st} | ${clubs.length} Junior Programs — Pancake Dig`
  const desc = `Find ${clubs.length} grassroots volleyball club${clubs.length === 1 ? '' : 's'} in ${city}, ${st}${ageSpan(clubs) ? ` serving ages ${ageSpan(clubs)}` : ''}. Compare programs, divisions, and contact info on Pancake Dig.`
  const canonical = SITE_URL + cityPath(params.state, city)
  return { title, description: desc, alternates: { canonical }, openGraph: { title, description: desc, url: canonical, type: 'website' } }
}

export default async function CityPage({ params }: { params: { state: string; city: string } }) {
  const stateAbbr = params.state.toLowerCase()
  const all = await getApprovedClubs()
  const clubs = cityClubsFrom(all, stateAbbr, params.city)
  if (clubs.length < MIN_CLUBS_FOR_CITY_PAGE) notFound()

  const city = cityName(clubs)
  const st = stateAbbr.toUpperCase()
  const stateName = US_STATES[stateAbbr]?.name || st
  const ages = ageSpan(clubs)
  const orgs = Array.from(new Set(clubs.flatMap(c => orgChips(c as any))))

  const faqs = [
    {
      q: `How many volleyball clubs are in ${city}, ${st}?`,
      a: `There ${clubs.length === 1 ? 'is' : 'are'} ${clubs.length} grassroots volleyball club${clubs.length === 1 ? '' : 's'} listed in ${city}, ${st} on Pancake Dig${ages ? `, serving ages ${ages}` : ''}.`,
    },
    ...(ages ? [{ q: `What ages do ${city} volleyball clubs serve?`, a: `Clubs in ${city} field junior teams across roughly ${ages} (age divisions vary by club).` }] : []),
    ...(orgs.length ? [{ q: `Which sanctioning bodies do ${city} clubs play under?`, a: `${city} clubs listed here are affiliated with ${orgs.join(', ')}.` }] : []),
    { q: `How do I find the right volleyball club in ${city}?`, a: `Browse the clubs below to compare divisions, level, and contact info, then reach out to the club directly. Each club can claim and update its own listing on Pancake Dig.` },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: `${stateName} volleyball clubs`, item: SITE_URL + statePath(stateAbbr) },
        { '@type': 'ListItem', position: 3, name: `${city}, ${st}`, item: SITE_URL + cityPath(stateAbbr, city) },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]

  return (
    <>
      <SiteHeader />
      <main className="wrap listing-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <nav className="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span aria-hidden>›</span>
          <a href={statePath(stateAbbr)}>{stateName} volleyball clubs</a><span aria-hidden>›</span>
          <span className="crumb-current">{city}</span>
        </nav>

        <h1 className="index-h1">Volleyball Clubs in {city}, {st}</h1>
        <p className="index-lead">
          {clubs.length} grassroots volleyball club{clubs.length === 1 ? '' : 's'} in {city}
          {ages ? `, serving ages ${ages}` : ''}{orgs.length ? ` — ${orgs.join(', ')}` : ''}. Each listing is verified against the club's own site; clubs can claim and keep their details current.
        </p>

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
          <a href={statePath(stateAbbr)} className="index-back">← All {stateName} volleyball clubs</a>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
