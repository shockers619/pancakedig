import { VolleyballIcon } from '@/components/VolleyballIcon'
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
      <div className="net-line" />

      <section className="hero">
        <div className="wrap">
          <div className="hero-strap">National Grassroots Volleyball Directory <span>·</span> Boys &amp; Girls <span>·</span> JVA · USAV · AAU <span>·</span> All Surfaces</div>
          <h1>One good <em>dig</em>.</h1>
          <p className="hero-sub">
            Three governing bodies, three sets of rules, three overlapping seasons —
            and no single place that shows all of it. Search real grassroots
            volleyball programs — boys and girls, indoor, beach, and grass — by area,
            division, level, and organization.
          </p>

          {!isSample && (clubCount > 0 || venueCount > 0) && (
            <div className="hero-stats">
              <div><div className="hero-stat-num">{clubCount}</div><div className="hero-stat-label">Clubs</div></div>
              <div><div className="hero-stat-num">{venueCount}</div><div className="hero-stat-label">Venues</div></div>
              <div><div className="hero-stat-num">{trainingCount}</div><div className="hero-stat-label">Training</div></div>
              <div><div className="hero-stat-num" style={{ fontSize: '22px', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}><em>JVA · USAV · AAU</em></div><div className="hero-stat-label">All in one place</div></div>
            </div>
          )}
        </div>
      </section>

      <LiveTicker listings={listings} />

      <Suspense fallback={null}>
        <Results listings={listings} isSample={isSample} />
      </Suspense>

      {/* PricingSection parked until we monetize (real traffic first) — component kept
          in components/PricingSection.tsx for a future launch. Re-import + render to bring back. */}

      {/* Volleyball-net divider above the footer, matching the header */}
      <div className="net-line" />

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
            </div>
          </div>
          <a href="https://sitesbyed.com" target="_blank" rel="noopener noreferrer" className="footer-credit">
            <span className="footer-credit-label">Site created by</span>
            <img className="footer-credit-logo" src="/sitesbyed-white.png" alt="Sites by Ed" />
          </a>
          <div className="foot-note">© 2026 Pancake Dig · Not affiliated with JVA, USAV, or AAU.</div>
        </div>
      </footer>
    </>
  )
}
