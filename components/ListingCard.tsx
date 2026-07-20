import { Listing, REGION_NAMES, TYPE_LABELS, formatDivisionRange, formatGender } from '@/lib/constants'
import { VerifiedBadge } from './VerifiedBadge'

export default function ListingCard({ listing: l, onClick }: { listing: Listing; onClick: () => void }) {
  return (
    <div className="listing-card">
      <div>
        <div className="listing-badges">
          <span className={`listing-type-tag badge-${l.type}`}>{TYPE_LABELS[l.type] || l.type}</span>
          {l.featured && <span className="listing-featured">★ FEATURED</span>}
          <span className="listing-posted">Posted {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <div className="listing-title">
          <span>{l.title || l.club}</span>
          {/* Mobile: logo sits next to title, checkmark AFTER the logo (house style #2) */}
          {l.logo_url && (
            <img className="listing-card-logo logo-mobile-only logo-frame" src={l.logo_url} alt={`${l.club} logo`} style={{ width: '24px', height: '24px', flexShrink: 0 }} />
          )}
          {l.verified && <VerifiedBadge />}
        </div>

        <div className="listing-meta">
          📍 {REGION_NAMES[l.region] || l.region}
          {(l.venue || l.city || l.state) ? ` · ${[l.venue, l.city, l.state?.toUpperCase()].filter(Boolean).join(', ')}` : ''}
          {l.division ? ` · ${formatDivisionRange(l.division)}` : ''}
          {l.gender ? ` ${formatGender(l.gender)}` : ''}
        </div>
      </div>

      <div className="listing-card-actions">
        {/* Desktop: logo lives in the actions row instead (house style #2) */}
        {l.logo_url && (
          <img className="listing-card-logo logo-desktop-only logo-frame" src={l.logo_url} alt={`${l.club} logo`} style={{ width: '48px', height: '48px', flexShrink: 0 }} />
        )}
        {l.claimed === false && (
          <button className="claim-btn-compact">Claim This Listing</button>
        )}
        <button className="listing-cta" onClick={onClick}>View Details</button>
      </div>
    </div>
  )
}
