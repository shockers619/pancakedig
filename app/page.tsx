import { VolleyballIcon } from '@/components/VolleyballIcon'
import PricingSection from '@/components/PricingSection'
import PostListingButton from '@/components/PostListingButton'
import { Suspense } from 'react'
import LiveTicker from '@/components/LiveTicker'
import Results from '@/components/Results'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SEED_LISTINGS } from '@/lib/seed-listings'
import { Listing } from '@/lib/constants'

// ISR: render is cached and Supabase is re-queried at most every 30 min instead
// of on every request. Expired-event filtering is done against today's date at
// render time, so a cached payload stays correct. Keeps egress low.
export const revalidate = 1800

// Reads every approved listing (paging past PostgREST's 1000-row cap), drops
// expired events, and falls back to SAMPLE listings when the DB is empty or
// unreachable — so the site is never blank, even before Supabase is set up.
async function getListings(): Promise<{ listings: Listing[]; isSample: boolean }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { listings: SEED_LISTINGS, isSample: true }
  }
  try {
    const supabase = createServerSupabaseClient()
    const today = new Date().toISOString().split('T')[0]
    const PAGE = 1000
    const raw: Listing[] = []
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1)
      if (error) { console.error('Homepage listings query error:', error); break }
      if (!data || data.length === 0) break
      raw.push(...(data as Listing[]))
      if (data.length < PAGE) break
    }
    const live = raw.filter(l => !(l.expires_at && l.expires_at < today))
    if (live.length > 0) return { listings: live, isSample: false }
    return { listings: SEED_LISTINGS, isSample: true }
  } catch {
    return { listings: SEED_LISTINGS, isSample: true }
  }
}

export default async function Home() {
  const { listings, isSample } = await getListings()
  const clubCount = listings.filter(l => l.type === 'club').length
  const venueCount = listings.filter(l => l.type === 'venue').length
  const trainingCount = listings.filter(l => l.type === 'training').length
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <div className="logo">
            <VolleyballIcon size={44} />
            <span>
              <span className="pancake">PANCAKE</span> <span className="dig">DIG</span>
              <span className="logo-tag">GRASSROOTS VOLLEYBALL DIRECTORY</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a className="btn btn-outline">Sign In</a>
            <PostListingButton />
          </div>
        </div>
      </header>
      <div className="net-line"><div className="net-line-ties">
        {Array.from({ length: 24 }).map((_, i) => <span key={i} />)}
      </div></div>

      <section className="hero">
        <div className="hero-ball" aria-hidden="true"><VolleyballIcon size={540} /></div>
        <div className="wrap">
          <div className="hero-eyebrow">JVA · USAV · AAU — ONE DIRECTORY</div>
          <h1>Every club.<br/>Every level.<br/>One good <em>dig</em>.</h1>
          <p className="hero-sub">
            Three governing bodies, three sets of rules, three overlapping seasons —
            and no single place that shows all of it. Search real grassroots
            volleyball programs — boys and girls, indoor and beach — by area, division,
            level, and organization.
          </p>

          {!isSample && (clubCount > 0 || venueCount > 0) && (
            <div className="hero-stats">
              <div><div className="hero-stat-num">{clubCount}</div><div className="hero-stat-label">Clubs</div></div>
              <div><div className="hero-stat-num">{venueCount}</div><div className="hero-stat-label">Venues</div></div>
              <div><div className="hero-stat-num">{trainingCount}</div><div className="hero-stat-label">Training</div></div>
              <div><div className="hero-stat-num"><em>JVA·USAV·AAU</em></div><div className="hero-stat-label">All in one place</div></div>
            </div>
          )}
        </div>
      </section>

      <LiveTicker listings={listings} />

      <Suspense fallback={null}>
        <Results listings={listings} isSample={isSample} />
      </Suspense>

      <PricingSection />

      <footer>
        <div className="wrap footer-inner">
          <div className="footer-left">
            <div className="logo" style={{ fontSize: '20px' }}>
              <VolleyballIcon size={22} />
              <span className="pancake">PANCAKE</span> <span className="dig">DIG</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--chalk)', fontWeight: 700 }}>/</span>
            <div className="footer-links">
              <a href="mailto:info@pancakedig.com" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--chalk)', fontWeight: 500 }}>
                info@pancakedig.com
              </a>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--chalk)', fontWeight: 700 }}>/</span>
              <a href="https://x.com/PancakeDig" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--chalk)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', fill: 'currentColor', flexShrink: 0 }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                @PancakeDig
              </a>
            </div>
          </div>
          <div className="foot-note">© 2026 Pancake Dig · Not affiliated with JVA, USA Volleyball, or the AAU.</div>
        </div>
      </footer>
    </>
  )
}
