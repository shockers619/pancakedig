import { VolleyballIcon } from '@/components/VolleyballIcon'
import PostListingButton from '@/components/PostListingButton'
import AccountControls from '@/components/AccountControls'
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
    const live = raw.filter(l => {
      if (l.expires_at && l.expires_at < today) return false          // explicit expiry passed
      const eventEnd = l.event_date_end || l.event_date
      if (eventEnd && eventEnd < today) return false                   // event date passed -> auto-archive
      return true
    })
    if (live.length > 0) return { listings: live, isSample: false }
    return { listings: SEED_LISTINGS, isSample: true }
  } catch {
    return { listings: SEED_LISTINGS, isSample: true }
  }
}

export default async function Home() {
  const { listings, isSample } = await getListings()
  // Scale-forward hero stats: lead with total reach, not a per-type inventory.
  const totalCount = listings.length
  const stateCount = new Set(listings.map(l => (l.state || '').toLowerCase()).filter(Boolean)).size
  const eventCount = listings.filter(l => l.type === 'showcase' || l.type === 'tryout').length
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <div className="logo">
            <VolleyballIcon size={52} />
            <span>
              <span className="pancake">PANCAKE</span> <span className="dig">DIG</span>
              <span className="logo-tag">GRASSROOTS VOLLEYBALL DIRECTORY</span>
            </span>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AccountControls />
            <PostListingButton />
          </div>
        </div>
      </header>
      <div className="net-line net-line--header" />

      <section className="hero">
        <div className="wrap">
          <div className="hero-strap">
            <span className="strap-seg s-dir">National Grassroots Volleyball Directory</span>
            <span className="strap-sep sep-1">·</span>
            <span className="strap-seg s-bg">Boys &amp; Girls</span>
            <span className="strap-sep sep-2">·</span>
            <span className="strap-seg s-org">USAV · JVA · AAU · AVP · LOVB</span>
            <span className="strap-sep sep-3">·</span>
            <span className="strap-seg s-surf">All Surfaces</span>
          </div>
          <h1>One good <em>dig</em>.</h1>
          <p className="hero-sub">
            Multiple governing bodies, different rules, overlapping seasons —
            and no single place that shows all of it. Search real grassroots
            volleyball programs — boys and girls, indoor, beach, and grass — by area,
            division, level, and organization.
          </p>

          {!isSample && totalCount > 0 && (
            <div className="hero-stats">
              <div><div className="hero-stat-num">{totalCount}</div><div className="hero-stat-label">Listings</div></div>
              <div><div className="hero-stat-num">{stateCount}</div><div className="hero-stat-label">States</div></div>
              <div><div className="hero-stat-num">{eventCount}</div><div className="hero-stat-label">Events</div></div>
              <div><div className="hero-stat-num" style={{ fontSize: '19px', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}><em>USAV · JVA · AAU · AVP · LOVB</em></div><div className="hero-stat-label">All in one place</div></div>
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
          <div className="foot-note">© 2026 Pancake Dig<span className="foot-sep"> · </span><span className="foot-disclaimer">Not affiliated with any organization.</span></div>
        </div>
      </footer>
    </>
  )
}
