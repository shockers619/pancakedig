import { VolleyballIcon } from '@/components/VolleyballIcon'
import PostListingButton from '@/components/PostListingButton'
import AccountControls from '@/components/AccountControls'

// Shared site header (logo + account + post button) and the header net-line.
// Extracted from app/page.tsx so every route — homepage and the SEO listing
// pages — renders the identical header without duplicating the markup.
export default function SiteHeader() {
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <a href="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <VolleyballIcon size={52} />
            <span>
              <span className="pancake">PANCAKE</span> <span className="dig">DIG</span>
              <span className="logo-tag">GRASSROOTS VOLLEYBALL DIRECTORY</span>
            </span>
          </a>
          <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AccountControls />
            <PostListingButton />
          </div>
        </div>
      </header>
      <div className="net-line net-line--header" />
    </>
  )
}
