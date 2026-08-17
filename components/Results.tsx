'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Listing, isOrgUnverified, US_STATES } from '@/lib/constants'
import { ORG_OTHER, isOrgOther } from '@/lib/filterOptions'
import SearchPanel from './SearchPanel'
import ListingCard from './ListingCard'
import ListingModal from './ListingModal'
import NotifyModal from './NotifyModal'

const PAGE_SIZE = 10

type Sort = 'recent' | 'state' | 'type'
const SORT_LABELS: Record<Sort, string> = {
  recent: 'Recently Posted', state: 'State (A–Z)', type: 'Listing Type',
}

export default function Results({ listings, isSample }: { listings: Listing[]; isSample?: boolean }) {
  const sp = useSearchParams()
  const router = useRouter()
  const [sort, setSort] = useState<Sort>('recent')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Listing | null>(null)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close the Sort menu when clicking anywhere outside it (matches FloorBalance).
  useEffect(() => {
    if (!sortOpen) return
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sortOpen])

  // Track mobile so the pagination shows fewer page numbers (Next drops to its own line).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const csv = (k: string) => { const v = sp.get(k); return v ? v.split(',').map(s => s.trim()).filter(Boolean) : [] }
  const types = csv('type'), regions = csv('region'), states = csv('state'),
        divisions = csv('division'), genders = csv('gender'), orgs = csv('org'), surfaces = csv('surface')
  const hasFilter = [types, regions, states, divisions, genders, orgs, surfaces].some(a => a.length > 0)

  const filtered = useMemo(() => {
    const out = listings.filter(l => {
      if (types.length && !types.includes(l.type)) return false
      if (regions.length && !regions.includes(l.region)) return false
      if (states.length && !states.includes((l.state || '').toLowerCase())) return false
      if (divisions.length && !divisions.some(d => (l.division || '').includes(d))) return false
      if (genders.length) {
        const g = (l.gender || '').toLowerCase()
        const match = genders.includes(g) || (g === 'coed' && (genders.includes('boys') || genders.includes('girls')))
        if (!match) return false
      }
      if (orgs.length) {
        const bodies = (l.governing_body || '').split(',').map(s => s.trim()).filter(Boolean)
        // "Unverified" = synthetic (org unknown on a sanctioned type). "Unaffiliated / Other" =
        // affiliated with none of the recognized five (sweeps in blank + niche "Other" orgs).
        const match = orgs.some(o =>
          o === 'Unverified' ? isOrgUnverified(l)
          : o === ORG_OTHER ? isOrgOther(l.governing_body)
          : bodies.includes(o))
        if (!match) return false
      }
      if (surfaces.length && !surfaces.includes(l.surface || '')) return false
      return true
    })
    const cityOf = (l: Listing) => l.venue || l.city || ''
    const name = (l: Listing) => l.title || l.club || ''
    // Sort states by full name (Alabama before Alaska), never by 2-letter code (AK before AL).
    const stateName = (l: Listing) => US_STATES[(l.state || '').toLowerCase()]?.name || l.state || ''
    const stateFiltered = states.length > 0
    out.sort((a, b) => {
      // Filtering by state auto-arranges results A–Z by city (within state), regardless of the Sort dropdown.
      if (stateFiltered) return stateName(a).localeCompare(stateName(b)) || cityOf(a).localeCompare(cityOf(b)) || name(a).localeCompare(name(b))
      if (sort === 'state') return stateName(a).localeCompare(stateName(b)) || cityOf(a).localeCompare(cityOf(b))
      if (sort === 'type') return a.type.localeCompare(b.type) || name(a).localeCompare(name(b))
      return 0 // recent = query order (already newest-first)
    })
    // featured always pins to top within any sort
    return [...out.filter(l => l.featured), ...out.filter(l => !l.featured)]
  }, [listings, sp.toString(), sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const goToPage = (p: number) => {
    setPage(p)
    // scroll to the first listing of the new page, not the search panel above it
    document.getElementById('results-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pageWindow = () => {
    const max = isMobile ? 6 : 7
    let start = Math.max(1, safePage - Math.floor(max / 2))
    const end = Math.min(totalPages, start + max - 1)
    start = Math.max(1, end - max + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <section className="section results-section" id="results">
      <div className="wrap">
        <div style={{ marginBottom: '30px' }}><SearchPanel /></div>
        <div className="results-toprow">
          <div className="result-count">
            <strong>{filtered.length.toLocaleString()}</strong>{' '}
            {hasFilter ? `listing${filtered.length !== 1 ? 's' : ''} found` : `${isSample ? 'sample listing' : 'total listing'}${filtered.length !== 1 ? 's' : ''} — and growing`}
            {hasFilter && (
              <button className="clear-filters-btn" style={{ marginLeft: '12px' }}
                onClick={() => { router.replace('/', { scroll: false }); setPage(1) }}>
                Clear filters
              </button>
            )}
          </div>

          <div className="results-right">
            <div className="verified-legend">
              <svg viewBox="0 0 24 24" width={18} height={18} style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" fill="var(--volley-yellow)" />
                <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="var(--net-graphite)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              Verified by Pancake Dig
            </div>

            <div className="sort-select" ref={sortRef} onClick={e => e.stopPropagation()}>
              <span>Sort by</span>
              <div style={{ position: 'relative' }}>
                <div className="sort-box" onClick={() => setSortOpen(o => !o)}>
                  <span>{SORT_LABELS[sort]}</span>
                  <span className="msel-chevron">▾</span>
                </div>
                {sortOpen && (
                  <div className="sort-menu">
                    {(Object.keys(SORT_LABELS) as Sort[]).map(s => (
                      <div key={s} className="sort-opt" style={{ color: s === sort ? 'var(--volley-yellow)' : undefined }}
                        onClick={() => { setSort(s); setPage(1); setSortOpen(false) }}>
                        {SORT_LABELS[s]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="notify-btn" onClick={() => setNotifyOpen(true)}>
              🔔 Notify me when something new matches
            </button>
          </div>
        </div>

        <div id="results-top" style={{ scrollMarginTop: '96px' }} />
        {paged.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏐</div>
            <div>No listings match your search.</div>
            <a href="/" className="empty-cta">Clear Filters</a>
          </div>
        ) : paged.map(l => (
          <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} />
        ))}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)}>← Prev</button>
            {pageWindow().map(p => (
              <button key={p} className={`page-btn${p === safePage ? ' page-active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)}>Next →</button>
          </div>
        )}
      </div>

      {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} />}
      {notifyOpen && <NotifyModal onClose={() => setNotifyOpen(false)} />}
    </section>
  )
}
