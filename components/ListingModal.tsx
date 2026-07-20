import { Listing, REGION_NAMES, TYPE_LABELS, formatDivisionRange, formatGender } from '@/lib/constants'
import { VerifiedBadge } from './VerifiedBadge'

export default function ListingModal({ listing: l, onClose }: { listing: Listing; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{l.title || l.club}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Float, not flex — see house style #3. Avoids the flex-row height-matching
            bug that silently creates dead space when badge content is shorter than
            the logo. */}
        {l.logo_url && (
          <img src={l.logo_url} alt={`${l.club} logo`} className="modal-logo logo-frame" />
        )}
        <div className="listing-badges" style={{ marginBottom: '16px' }}>
          <span className={`listing-type-tag badge-${l.type}`}>{TYPE_LABELS[l.type] || l.type}</span>
          {l.featured && <span className="listing-featured">★ FEATURED</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {l.club && l.club !== l.title && (
            <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{l.club}</div>
          )}
          {/* Line 1: pin icon only — house style #1 */}
          {(l.region || l.venue || l.city || l.state) && (
            <div style={{ fontSize: '13px', color: 'var(--chalk-dim)' }}>
              📍 {l.region ? (REGION_NAMES[l.region] || l.region) : ''}
              {l.region && (l.venue || l.city || l.state) ? ' · ' : ''}
              <span style={{ whiteSpace: 'nowrap' }}>
                {[l.venue, l.city, l.state?.toUpperCase()].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {/* Line 2: no icon at all */}
          {(l.division || l.gender || (l.tiers && l.tiers.length > 0)) && (
            <div style={{ fontSize: '13px', color: 'var(--chalk-dim)' }}>
              {[
                [l.division ? formatDivisionRange(l.division) : null, l.gender ? formatGender(l.gender) : null].filter(Boolean).join(', ') || null,
                l.tiers && l.tiers.length > 0 ? l.tiers.join(', ') : null,
              ].filter(Boolean).join(' · ')}
            </div>
          )}
          {l.governing_body && (
            <div style={{ fontSize: '13px', color: 'var(--chalk-dim)' }}>Plays under: {l.governing_body}</div>
          )}
        </div>

        {l.details && (
          <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--chalk-dim)', marginBottom: '20px' }}>{l.details}</p>
        )}

        {(l.phone || l.email) && (
          <div style={{ fontSize: '13.5px', color: 'var(--chalk-dim)', marginBottom: '8px' }}>
            {[l.phone, l.email].filter(Boolean).join(' · ')}
          </div>
        )}
        {l.website && (
          <a href={l.website} target="_blank" rel="noreferrer" style={{ fontSize: '13.5px', color: 'var(--ace-teal)', display: 'block', marginBottom: '20px' }}>
            {l.website}
          </a>
        )}

        {/* Claim + Share on the same row from day one — house style #6 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
          {l.claimed === false && (
            <button className="claim-btn-compact">Claim This Listing</button>
          )}
          <button className="share-listing-btn">
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Share this listing
          </button>
        </div>
      </div>
    </div>
  )
}
