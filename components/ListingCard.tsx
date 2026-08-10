import { Listing, REGION_NAMES, TYPE_LABELS, formatDivisionRange, formatGender, formatEventDate } from '@/lib/constants'
import { VerifiedBadge } from './VerifiedBadge'

export default function ListingCard({ listing: l, onClick }: { listing: Listing; onClick: () => void }) {
  const bodies = (l.governing_body || '').split(',').map(s => s.trim()).filter(Boolean)
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
            <img className={`listing-card-logo logo-mobile-only logo-frame${l.logo_dark ? ' logo-frame-dark' : ''}`} src={l.logo_url} alt={`${l.club} logo`} style={{ width: '24px', height: '24px', flexShrink: 0 }} />
          )}
          {l.verified && <VerifiedBadge />}
        </div>

        <div className="listing-meta">
          📍 {REGION_NAMES[l.region] || l.region}
          {(l.venue || l.city || l.state) ? ` · ${[l.venue, l.city, l.state?.toUpperCase()].filter(Boolean).join(', ')}` : ''}
        </div>

        {(l.event_date || l.event_subtype || l.division || l.gender || l.surface || bodies.length > 0) && (
          <div className="listing-chips">
            {l.event_date && <span className="listing-chip chip-event">{formatEventDate(l.event_date, l.event_date_end)}</span>}
            {l.event_subtype && <span className="listing-chip">{l.event_subtype}</span>}
            {l.division && <span className="listing-chip">{formatDivisionRange(l.division)}</span>}
            {l.gender && <span className="listing-chip">{formatGender(l.gender)}</span>}
            {l.surface && <span className="listing-chip">{l.surface}</span>}
            {bodies.map(b => <span key={b} className="listing-chip chip-org">{b}</span>)}
          </div>
        )}
      </div>

      <div className="listing-card-actions">
        {/* Desktop: logo lives in the actions row instead (house style #2) */}
        {l.logo_url && (
          <img className={`listing-card-logo logo-desktop-only logo-frame${l.logo_dark ? ' logo-frame-dark' : ''}`} src={l.logo_url} alt={`${l.club} logo`} style={{ width: '64px', height: '64px', flexShrink: 0 }} />
        )}
        {l.claimed === false && (
          <button className="claim-btn-compact">Claim This Listing</button>
        )}
        <button className="listing-cta" onClick={onClick}>View Details</button>
      </div>
    </div>
  )
}
