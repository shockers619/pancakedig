import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  Listing, REGION_NAMES, TYPE_LABELS, US_STATES, SITE_URL,
  formatDivisionRange, formatGender, orgChips, clubPath, listingSlug, idFromSlug,
} from '@/lib/constants'
import { statePath } from '@/lib/clubs'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { FacebookIcon, InstagramIcon, XIcon, TikTokIcon } from '@/components/SocialIcons'
import { ClaimListingButton } from '@/components/ClaimListingButton'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

// SEO detail page — one crawlable, indexable page per real club. This is the
// discovery surface an app (VolleyballHub) structurally can't own.
//
// Egress safety (the FloorBalance lesson): generateStaticParams pre-renders the
// KNOWN clubs at build; `dynamicParams = false` makes every other URL a static
// 404 at the edge with ZERO DB reads, so crawlers probing random slugs can't
// blow the Supabase quota. Rendered pages are ISR-cached (revalidate).
export const revalidate = 86400
export const dynamicParams = false

async function fetchClub(id: number): Promise<Listing | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  const sb = createServerSupabaseClient()
  const { data } = await sb.from('listings').select('*').eq('id', id).eq('status', 'approved').maybeSingle()
  return (data as Listing) || null
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const sb = createServerSupabaseClient()
  const rows: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from('listings')
      .select('id, club, title, state')
      .eq('status', 'approved').eq('type', 'club').not('state', 'is', null)
      .range(from, from + 999)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < 1000) break
  }
  return rows
    .filter(r => r.state && (r.club || r.title))
    .map(r => ({ state: String(r.state).toLowerCase(), slug: listingSlug(r) }))
}

export async function generateMetadata({ params }: { params: { state: string; slug: string } }): Promise<Metadata> {
  const id = idFromSlug(params.slug)
  const l = id ? await fetchClub(id) : null
  if (!l) return { title: 'Club not found — Pancake Dig' }
  const stateName = US_STATES[(l.state || '').toLowerCase()]?.name || (l.state || '').toUpperCase()
  const loc = [l.city, l.state?.toUpperCase()].filter(Boolean).join(', ')
  const title = `${l.club}${loc ? ` — ${loc}` : ''} | Pancake Dig`
  const desc = (l.details && l.details.length > 20)
    ? l.details.slice(0, 155)
    : `${l.club} is a grassroots volleyball club${loc ? ` in ${loc}` : stateName ? ` in ${stateName}` : ''}. See divisions, level, and contact info — or claim this listing on Pancake Dig.`
  const canonical = SITE_URL + clubPath(l)
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, type: 'website', images: l.logo_url ? [{ url: l.logo_url }] : undefined },
  }
}

export default async function ClubPage({ params }: { params: { state: string; slug: string } }) {
  const id = idFromSlug(params.slug)
  const l = id ? await fetchClub(id) : null
  // Only club-type, approved rows whose state matches the URL render here.
  if (!l || l.type !== 'club' || (l.state || '').toLowerCase() !== params.state.toLowerCase()) notFound()

  const stateName = US_STATES[(l.state || '').toLowerCase()]?.name || (l.state || '').toUpperCase()
  const regionName = l.region ? (REGION_NAMES[l.region] || l.region) : ''
  const orgs = orgChips(l)
  const hasSocial = l.facebook_url || l.instagram_url || l.x_url || l.tiktok_url
  const sameAs = [l.website, l.facebook_url, l.instagram_url, l.x_url, l.tiktok_url].filter(Boolean) as string[]
  const website = l.website ? (l.website.startsWith('http') ? l.website : `https://${l.website}`) : null

  // JSON-LD for Google rich results AND AI answer engines (AEO) — a machine-
  // readable statement of the club as an entity. Only real fields are emitted.
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: l.club,
    sport: 'Volleyball',
    url: SITE_URL + clubPath(l),
  }
  if (l.logo_url) jsonLd.logo = l.logo_url
  if (sameAs.length) jsonLd.sameAs = sameAs
  if (l.city || l.state) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(l.city ? { addressLocality: l.city } : {}),
      addressRegion: (l.state || '').toUpperCase(),
      addressCountry: 'US',
    }
  }
  if (stateName) jsonLd.areaServed = stateName

  return (
    <>
      <SiteHeader />
      <main className="wrap listing-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <nav className="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden>›</span>
          <a href={statePath(l.state)}>{stateName} volleyball clubs</a>
          <span aria-hidden>›</span>
          <span className="crumb-current">{l.club}</span>
        </nav>

        <article className="listing-detail">
          {l.logo_url && (
            <img src={l.logo_url} alt={`${l.club} logo`} className={`modal-logo logo-frame${l.logo_dark ? ' logo-frame-dark' : ''}`} />
          )}

          <h1>{l.club}</h1>

          <div className="listing-badges" style={{ marginBottom: '14px' }}>
            <span className={`listing-type-tag badge-${l.type}`}>{TYPE_LABELS[l.type] || l.type}</span>
            {l.verified && <VerifiedBadge />}
            {l.featured && <span className="listing-featured">★ FEATURED</span>}
          </div>

          {(l.region || l.city || l.state) && (
            <div style={{ fontSize: '14px', color: 'var(--chalk-dim)', marginBottom: '12px' }}>
              📍 {regionName}{regionName && (l.city || l.state) ? ' · ' : ''}
              <span style={{ whiteSpace: 'nowrap' }}>{[l.city, l.state?.toUpperCase()].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {(l.division || l.gender || l.surface || orgs.length > 0 || (l.tiers && l.tiers.length > 0)) && (
            <div className="listing-chips" style={{ marginBottom: '18px' }}>
              {orgs.map(b => <span key={b} className="listing-chip chip-org">{b}</span>)}
              {l.division && <span className="listing-chip">{formatDivisionRange(l.division)}</span>}
              {l.gender && <span className="listing-chip">{formatGender(l.gender)}</span>}
              {l.surface && <span className="listing-chip">{l.surface}</span>}
              {(l.tiers || []).map(t => <span key={t} className="listing-chip chip-level">{t}</span>)}
            </div>
          )}

          <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--chalk-dim)', marginBottom: '22px' }}>
            {l.details && l.details.length > 20
              ? l.details
              : `${l.club} is a grassroots volleyball club${l.city ? ` based in ${l.city}, ${(l.state || '').toUpperCase()}` : stateName ? ` in ${stateName}` : ''}${orgs.length ? `, affiliated with ${orgs.join(', ')}` : ''}. ${l.claimed ? 'This listing is maintained by the club.' : 'Run this club? Claim this listing to keep its details current.'}`}
          </p>

          <div className="listing-contact">
            {(l.contact_name || l.phone || l.email) && (
              <div style={{ fontSize: '13.5px', color: 'var(--chalk-dim)' }}>
                {l.contact_name && <span style={{ fontWeight: 600, color: 'var(--chalk)' }}>{l.contact_name}</span>}
                {l.contact_name && (l.phone || l.email) && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
                {l.phone && <span>{l.phone}</span>}
                {l.phone && l.email && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
                {l.email && <a href={`mailto:${l.email}`} style={{ color: 'var(--chalk-dim)' }}>{l.email}</a>}
              </div>
            )}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: '14px', color: 'var(--ace-teal)' }}>
                {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
            {hasSocial && (
              <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
                {l.facebook_url && <a href={l.facebook_url} target="_blank" rel="noopener noreferrer nofollow" aria-label="Facebook" style={{ color: 'var(--ace-teal)', display: 'flex' }}><FacebookIcon /></a>}
                {l.instagram_url && <a href={l.instagram_url} target="_blank" rel="noopener noreferrer nofollow" aria-label="Instagram" style={{ color: 'var(--ace-teal)', display: 'flex' }}><InstagramIcon /></a>}
                {l.x_url && <a href={l.x_url} target="_blank" rel="noopener noreferrer nofollow" aria-label="X" style={{ color: 'var(--ace-teal)', display: 'flex' }}><XIcon /></a>}
                {l.tiktok_url && <a href={l.tiktok_url} target="_blank" rel="noopener noreferrer nofollow" aria-label="TikTok" style={{ color: 'var(--ace-teal)', display: 'flex' }}><TikTokIcon /></a>}
              </div>
            )}
            {!l.claimed && (
              <div style={{ marginTop: '10px' }}>
                <ClaimListingButton listingId={l.id} listingTitle={l.club} />
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px' }}>
            <a href={statePath(l.state)} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--volley-yellow)', textDecoration: 'none' }}>
              ← More {stateName} volleyball clubs
            </a>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
