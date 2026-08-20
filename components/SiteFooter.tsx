import { VolleyballIcon } from '@/components/VolleyballIcon'

// Shared site footer (net-line divider + footer bar). Extracted from
// app/page.tsx so the homepage and the SEO listing pages share one footer.
export default function SiteFooter() {
  return (
    <>
      <div className="net-line" />
      <footer>
        <div className="wrap footer-inner">
          <div className="footer-left">
            <a href="/" className="logo" style={{ fontSize: '20px', textDecoration: 'none', color: 'inherit' }}>
              <VolleyballIcon size={22} />
              <span className="pancake">PANCAKE</span> <span className="dig">DIG</span>
            </a>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--chalk)', fontWeight: 700 }}>/</span>
            <div className="footer-links" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
