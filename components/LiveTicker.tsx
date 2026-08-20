'use client'
import { useState } from 'react'
import { Listing, REGION_NAMES, TYPE_LABELS, formatDivisionRange, formatGender, eventLead, displayTown } from '@/lib/constants'
import ListingModal from './ListingModal'

// "⚡ Live Board — Just Posted" — the 5 most recent listings as a compact ticker,
// ported from FloorBalance's LiveBoard (PD palette). Listings arrive already
// sorted newest-first from the homepage query, so slice the top 5.
export default function LiveTicker({ listings }: { listings: Listing[] }) {
  const recent = listings.slice(0, 5)
  const [selected, setSelected] = useState<Listing | null>(null)
  if (recent.length === 0) return null

  return (
    <div className="board-zone">
      <div className="board-inner">
        <div className="board">
          <div className="board-head">
            <div className="board-head-inner">
              <span className="board-head-title">⚡ Live Board — Just Posted</span>
              <span className="board-live"><span className="board-live-dot" />LIVE</span>
            </div>
          </div>
          <div className="board-rows">
            {recent.map(l => (
              <div
                className="board-row"
                key={l.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(l)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(l) } }}
              >
                <div className="board-row-head">
                  <span className={`board-tag badge-${l.type}`}>{TYPE_LABELS[l.type] || l.type}</span>
                </div>
                <div className="board-row-body">
                  <strong>{eventLead(l) && <span className="type-lead">{eventLead(l)} — </span>}{l.title || l.club}</strong>
                  <div className="board-row-meta">
                    📍 {REGION_NAMES[l.region] || l.region}
                    {(() => { const tail = [displayTown(l.city, l.venue), l.state?.toUpperCase()].filter(Boolean).join(', '); return tail ? ` · ${tail}` : '' })()}
                    {l.division ? ` · ${formatDivisionRange(l.division)}` : ''}
                    {l.gender ? <span className="board-gender"> · {formatGender(l.gender)}</span> : ''}
                  </div>
                </div>
                {/* No logo on the Live Board: at ticker scale it's too small to read,
                    and events have none, so rows looked uneven. Logos live on the cards. */}
                <button className="board-view" onClick={e => { e.stopPropagation(); setSelected(l) }}>View Details</button>
                <span className="board-chevron" aria-hidden="true">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
