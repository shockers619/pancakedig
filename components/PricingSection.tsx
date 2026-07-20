import PostListingButton from './PostListingButton'

export default function PricingSection() {
  return (
    <section className="clubs-section" id="pricing">
      <div className="section-eyebrow">For Clubs, Directors &amp; Coaches</div>
      <h2 className="section-title">Get found by players, coaches, and families.</h2>
      <p className="section-deck">Free to post and get found. Pay to stay at the top and be featured.</p>

      <div className="pricing-free-box" style={{ maxWidth: '800px', margin: '0 auto 28px', background: 'rgba(255,196,43,0.08)', border: '2px solid rgba(255,196,43,0.3)', padding: '18px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--volley-yellow)', fontWeight: 800, marginBottom: '6px' }}>Free During Growth Stage</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'var(--chalk-dim)', lineHeight: 1.65 }}>
          We're building the best grassroots volleyball directory in the country — and we want your club or event on it.<br/>Post tryouts, roster spots, events, venues, club profiles, and coach listings at no cost while we grow.<br/>Paid tiers launch once we exit the growth stage.
        </div>
      </div>

      <div className="clubs-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div className="price-card">
          <div className="price-tier">Club Profile</div>
          <div style={{ display: 'inline-block', border: '1px solid var(--volley-yellow)', color: 'var(--volley-yellow)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', textTransform: 'uppercase', marginBottom: '10px' }}>Free During Growth Stage</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--chalk-faint)' }}><span style={{ textDecoration: 'line-through' }}>$25</span><span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>/listing</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--volley-yellow)' }}>FREE</div>
          </div>
          <div className="price-desc">Get your club on the board.</div>
          <ul className="price-features">
            <li>Club Profile stays active for 1 year</li>
            <li>Listing is editable</li>
            <li>Searchable by area, division, and level</li>
            <li>Reaches people with matching alerts</li>
            <li>No recurring charge</li>
          </ul>
          <PostListingButton label="Post Club Profile" className="price-btn" />
        </div>

        <div className="price-card">
          <div className="price-tier">Regular Listing</div>
          <div style={{ display: 'inline-block', border: '1px solid var(--volley-yellow)', color: 'var(--volley-yellow)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', textTransform: 'uppercase', marginBottom: '10px' }}>Free During Growth Stage</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--chalk-faint)' }}><span style={{ textDecoration: 'line-through' }}>$19</span><span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>/listing</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--volley-yellow)' }}>FREE</div>
          </div>
          <div className="price-desc">For clubs &amp; organizers that post occasionally.</div>
          <ul className="price-features">
            <li>Any listing — tryouts, roster spots, events, venues</li>
            <li>Listing stays active until filled or removed</li>
            <li>Listing is editable</li>
            <li>Searchable by area, division, and level</li>
            <li>Reaches people with matching alerts</li>
            <li>No recurring charge</li>
          </ul>
          <PostListingButton label="Post a Listing" className="price-btn" />
        </div>

        <div className="price-card highlight">
          <div className="price-tier">Club Pass</div>
          <div style={{ display: 'inline-block', border: '1px solid var(--volley-yellow)', color: 'var(--volley-yellow)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', textTransform: 'uppercase', marginBottom: '10px' }}>Launching After Growth Stage</div>
          <div className="price-amount">$29<span>/mo</span></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--chalk-faint)', marginBottom: '8px' }}>or $199/year — save $149</div>
          <div className="price-desc">For clubs recruiting or hosting events year-round.</div>
          <ul className="price-features">
            <li>Unlimited listings — any type</li>
            <li>✓ Verified Club badge</li>
            <li>Priority placement in search</li>
            <li>Listings stay active until filled or removed</li>
            <li>All listings are editable</li>
            <li>Reaches people with matching alerts</li>
          </ul>
          <button className="price-btn" style={{ opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }}>Coming Soon</button>
        </div>

        <div className="price-card">
          <div className="price-tier">Featured Event Listing</div>
          <div style={{ display: 'inline-block', border: '1px solid var(--volley-yellow)', color: 'var(--volley-yellow)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', textTransform: 'uppercase', marginBottom: '10px' }}>Launching After Growth Stage</div>
          <div className="price-amount">$75<span>/event</span></div>
          <div className="price-desc">For tournament &amp; event organizers.</div>
          <ul className="price-features">
            <li>Top placement in event results</li>
            <li>Bold highlighted listing</li>
            <li>Homepage featured placement</li>
            <li>Pinned until event date</li>
            <li>Listing is editable</li>
            <li>Reaches people with matching alerts</li>
            <li>No recurring charge</li>
          </ul>
          <button className="price-btn" style={{ opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }}>Coming Soon</button>
        </div>

        <div className="price-card">
          <div className="price-tier">Coach Profile</div>
          <div style={{ display: 'inline-block', border: '1px solid var(--volley-yellow)', color: 'var(--volley-yellow)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', textTransform: 'uppercase', marginBottom: '10px' }}>Free During Growth Stage</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--chalk-faint)' }}><span style={{ textDecoration: 'line-through' }}>$25</span><span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>/6 months</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--volley-yellow)' }}>FREE</div>
          </div>
          <div className="price-desc">For personal trainers, skills coaches, and club instructors.</div>
          <ul className="price-features">
            <li>Coach Profile stays active for 6 months</li>
            <li>Listing is editable</li>
            <li>Searchable by area, division, and level</li>
            <li>Reaches people with matching alerts</li>
            <li>No recurring charge</li>
          </ul>
          <PostListingButton label="Post Coach Profile" className="price-btn" />
        </div>

        <div className="price-card">
          <div className="price-tier">Referee Profile</div>
          <div style={{ display: 'inline-block', border: '1px solid var(--volley-yellow)', color: 'var(--volley-yellow)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', textTransform: 'uppercase', marginBottom: '10px' }}>Free During Growth Stage</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--chalk-faint)' }}><span style={{ textDecoration: 'line-through' }}>$25</span><span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>/6 months</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--volley-yellow)' }}>FREE</div>
          </div>
          <div className="price-desc">For certified and aspiring referees available for match assignments.</div>
          <ul className="price-features">
            <li>Referee Profile stays active for 6 months</li>
            <li>Listing is editable</li>
            <li>Searchable by area, division, and certification</li>
            <li>Reaches people with matching alerts</li>
            <li>No recurring charge</li>
          </ul>
          <PostListingButton label="Post Referee Profile" className="price-btn" />
        </div>

      </div>

      <p className="payment-note">All listings are free during our growth stage. Pricing shown above will launch in a future phase and may be adjusted as the platform grows.</p>
    </section>
  )
}
