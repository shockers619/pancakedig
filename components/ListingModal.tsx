import { Listing, REGION_NAMES, TYPE_LABELS, formatDivisionRange, formatGender, formatEventDate, eventLead, orgChips } from '@/lib/constants'
import { VerifiedBadge } from './VerifiedBadge'
import { FacebookIcon, InstagramIcon, XIcon, TikTokIcon, LinkIcon } from './SocialIcons'
import { ClaimListingButton } from './ClaimListingButton'

const ORG_CHIP_CLASS = { body: 'chip-org', independent: 'chip-org-independent', unverified: 'chip-org-unverified' } as const

export default function ListingModal({ listing: l, onClose }: { listing: Listing; onClose: () => void }) {
  const hasSocial = l.facebook_url || l.instagram_url || l.x_url || l.tiktok_url
  const orgs = orgChips(l)
  const lead = eventLead(l)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{lead && <span className="type-lead">{lead} — </span>}{l.title || l.club}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Float, not flex — see house style #3. */}
        {l.logo_url && (
          <img src={l.logo_url} alt={`${l.club} logo`} className={`modal-logo logo-frame${l.logo_dark ? ' logo-frame-dark' : ''}`} />
        )}
        <div className="listing-badges" style={{ marginBottom: '16px' }}>
          <span className={`listing-type-tag badge-${l.type}`}>{TYPE_LABELS[l.type] || l.type}</span>
          {l.verified && <VerifiedBadge />}
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
          {l.event_date && (
            <div style={{ fontSize: '13px', color: 'var(--ace-teal)', fontWeight: 600 }}>{formatEventDate(l.event_date, l.event_date_end)}</div>
          )}
          {/* Metadata as chips — same order as the result cards: org → division → gender → surface → level */}
          {(l.division || l.gender || l.surface || orgs.length > 0 || (l.tiers && l.tiers.length > 0)) && (
            <div className="listing-chips" style={{ marginTop: '2px' }}>
              {orgs.map(o => <span key={o.label} className={`listing-chip ${ORG_CHIP_CLASS[o.kind]}`}>{o.label}</span>)}
              {l.division && <span className="listing-chip">{formatDivisionRange(l.division)}</span>}
              {l.gender && <span className="listing-chip">{formatGender(l.gender)}</span>}
              {l.surface && <span className="listing-chip">{l.surface}</span>}
              {(l.tiers || []).map(t => <span key={t} className="listing-chip chip-level">{t}</span>)}
            </div>
          )}
        </div>

        {l.details && (
          <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--chalk-dim)', marginBottom: '20px' }}>{l.details}</p>
        )}

        {/* Contact / links block */}
        <div style={{ borderTop: '1px solid rgba(244,246,242,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(l.contact_name || l.phone || l.email) && (
            <div style={{ fontSize: '13px', color: 'var(--chalk-dim)' }}>
              {l.contact_name && <span style={{ fontWeight: 600, color: 'var(--chalk)' }}>{l.contact_name}</span>}
              {l.contact_name && (l.phone || l.email) && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
              {l.phone && <span>{l.phone}</span>}
              {l.phone && l.email && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
              {l.email && <span>{l.email}</span>}
            </div>
          )}
          {l.website && (
            <a href={l.website.startsWith('http') ? l.website : `https://${l.website}`} target="_blank" rel="noreferrer" style={{ fontSize: '13.5px', color: 'var(--ace-teal)' }}>
              {l.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
          {hasSocial && (
            <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
              {l.facebook_url && <a href={l.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" style={{ color: 'var(--ace-teal)', display: 'flex' }}><FacebookIcon /></a>}
              {l.instagram_url && <a href={l.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" style={{ color: 'var(--ace-teal)', display: 'flex' }}><InstagramIcon /></a>}
              {l.x_url && <a href={l.x_url} target="_blank" rel="noreferrer" aria-label="X" style={{ color: 'var(--ace-teal)', display: 'flex' }}><XIcon /></a>}
              {l.tiktok_url && <a href={l.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok" style={{ color: 'var(--ace-teal)', display: 'flex' }}><TikTokIcon /></a>}
            </div>
          )}

          {/* Claim + Share on the same row from day one — house style #6 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
            {!l.claimed && <ClaimListingButton listingId={l.id} listingTitle={l.title || l.club} />}
            <button
              className="share-listing-btn"
              onClick={() => {
                navigator.clipboard?.writeText('https://pancakedig.com')
                const span = document.getElementById(`share-txt-${l.id}`)
                if (span) { span.textContent = 'Link copied!'; setTimeout(() => { span.textContent = 'Share this listing' }, 2000) }
              }}
            >
              <LinkIcon />
              <span id={`share-txt-${l.id}`}>Share this listing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
