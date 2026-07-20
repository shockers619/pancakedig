import { VolleyballIcon } from '@/components/VolleyballIcon'
import SearchPanel from '@/components/SearchPanel'
import PricingSection from '@/components/PricingSection'
import PostListingButton from '@/components/PostListingButton'

export default function Home() {
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
        <div className="wrap">
          <div className="hero-eyebrow">JVA · USAV · AAU — ONE DIRECTORY</div>
          <h1>Every club.<br/>Every level.<br/>One good <em>dig</em>.</h1>
          <p className="hero-sub">
            Three governing bodies, three sets of rules, three overlapping seasons —
            and no single place that shows all of it. Search real grassroots
            volleyball programs — boys and girls, indoor and beach — by area, division,
            level, and organization.
          </p>

          <SearchPanel />
        </div>
      </section>

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
