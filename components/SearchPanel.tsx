'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { US_STATES } from '@/lib/constants'
import { REGIONS, TYPES, EVENT_TYPES, SURFACES, ORG_FILTER_OPTIONS, GENDERS, DIVISIONS, REGION_KEY, toggle } from '@/lib/filterOptions'
import { Dropdown } from './Dropdown'

export default function SearchPanel() {
  const router = useRouter()
  const sp = useSearchParams()
  const [openMenu, setOpenMenu] = useState('')
  // Search-by-name box. Filters live as the user types (the top request from our
  // first user: type a club/event name instead of clicking through menus). It
  // writes the `q` URL param directly so Results re-filters immediately.
  const [q, setQ] = useState(sp.get('q') || '')
  const lastWroteQ = useRef(q)
  const [types, setTypes] = useState<string[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [divisions, setDivisions] = useState<string[]>([])
  const [surfaces, setSurfaces] = useState<string[]>([])
  const [orgs, setOrgs] = useState<string[]>([])
  const [genders, setGenders] = useState<string[]>([])
  const activeMenuRef = useRef<HTMLDivElement>(null)

  // Closes the open dropdown when the user clicks anywhere that isn't the
  // dropdown's own menu — including elsewhere inside the search panel
  // (labels, gaps between fields, the Search button), not just outside the
  // panel entirely. activeMenuRef only ever points at whichever menu is
  // currently open, since React attaches/detaches it automatically as
  // openMenu changes which Dropdown instance renders its menu.
  useEffect(() => {
    const handler = (e: Event) => {
      const el = e.target instanceof Element ? e.target : null
      // Ignore taps on any dropdown box — those toggle themselves; closing here
      // too would flicker/reopen. Close only on a tap truly outside the open menu.
      if (activeMenuRef.current && !activeMenuRef.current.contains(e.target as Node) && !el?.closest('.msel-box')) {
        setOpenMenu('')
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler) }
  }, [])

  // Write the name query straight to the URL so results filter as you type.
  const onQ = (val: string) => {
    setQ(val); lastWroteQ.current = val
    const p = new URLSearchParams(Array.from(sp.entries()))
    if (val.trim()) p.set('q', val.trim()); else p.delete('q')
    const qs = p.toString()
    router.replace(qs ? `/?${qs}` : '/', { scroll: false })
  }

  // Reflect external URL changes to `q` (e.g. Results' "Clear filters"), but never
  // clobber what the user is mid-typing — only sync when the URL differs from our
  // own last write.
  useEffect(() => {
    const urlQ = sp.get('q') || ''
    if (urlQ !== lastWroteQ.current) { setQ(urlQ); lastWroteQ.current = urlQ }
  }, [sp])

  const selectedRegionKeys = regions.map(r => REGION_KEY[r])
  const availableStates = Object.entries(US_STATES)
    .filter(([, s]) => selectedRegionKeys.length === 0 || selectedRegionKeys.includes(s.region))
    .sort((a, b) => a[1].name.localeCompare(b[1].name))

  const showEventType = types.includes('showcase')

  // Apply filters by writing them to the URL; the Results section reads them
  // and filters client-side. (Level is intentionally NOT a filter — a club spans
  // every level, so filtering by one can't separate clubs; Surface IS wired.)
  const applySearch = () => {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (types.length) p.set('type', types.join(','))
    const regionKeys = regions.map(r => REGION_KEY[r]).filter(Boolean)
    if (regionKeys.length) p.set('region', regionKeys.join(','))
    if (states.length) p.set('state', states.join(','))
    if (divisions.length) p.set('division', divisions.join(','))
    if (genders.length) p.set('gender', genders.map(g => g.toLowerCase()).join(','))
    if (orgs.length) p.set('org', orgs.join(','))
    if (surfaces.length) p.set('surface', surfaces.join(','))
    const qs = p.toString()
    router.replace(qs ? `/?${qs}` : '/', { scroll: false })
    setOpenMenu('')
    requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <div className="search-panel">
      {/* Name search — the fast path: type a club or event name directly. */}
      <div className="name-search">
        <span className="name-search-icon" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </span>
        <input
          type="text"
          className="name-search-input"
          placeholder="Search by club or event name…"
          value={q}
          onChange={e => onQ(e.target.value)}
          aria-label="Search by club or event name"
        />
        {q && <button className="name-search-clear" onClick={() => onQ('')} aria-label="Clear search">×</button>}
      </div>
      <div className="search-or">or filter below · <span className="search-or-hint">searching is free — run a club? sign in to claim your listing free</span></div>

      <div className="search-grid">
        {/* ROW 1 */}
        <Dropdown id="type" label="Type" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={types.length ? `${types.length} selected` : 'All Types'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={types.length === 0} onChange={() => { setTypes([]); setEventTypes([]) }} />
            <span>All Types</span>
          </label>
          <div className="msel-divider" />
          {TYPES.map(([v, l]) => (
            <div key={v}>
              <label className="msel-option">
                <input type="checkbox" checked={types.includes(v)} onChange={() => { const next = toggle(types, v); setTypes(next); if (v === 'showcase' && !next.includes('showcase')) setEventTypes([]) }} />
                <span>{l}</span>
              </label>
              {v === 'showcase' && showEventType && (
                <div style={{ marginLeft: '26px', borderLeft: '2px solid rgba(255,196,43,0.25)', paddingLeft: '10px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--chalk-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 0 2px' }}>Event Type</div>
                  <label className="msel-option all-option" style={{ padding: '7px 8px' }}>
                    <input type="checkbox" checked={eventTypes.length === 0} onChange={() => setEventTypes([])} />
                    <span>All Events</span>
                  </label>
                  {EVENT_TYPES.map(e => (
                    <label key={e} className="msel-option" style={{ padding: '7px 8px' }}>
                      <input type="checkbox" checked={eventTypes.includes(e)} onChange={() => setEventTypes(toggle(eventTypes, e))} />
                      <span>{e}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Dropdown>

        <Dropdown id="region" label="Region" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={regions.length ? `${regions.length} selected` : 'All Regions'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={regions.length === 0} onChange={() => { setRegions([]); setStates([]) }} />
            <span>All Regions</span>
          </label>
          <div className="msel-divider" />
          {REGIONS.map(([name, states_]) => (
            <label key={name} className="msel-option">
              <input type="checkbox" checked={regions.includes(name)} onChange={() => setRegions(toggle(regions, name))} />
              <div>
                <span style={{ display: 'block' }}>{name}</span>
                <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--chalk-faint)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>{states_}</span>
              </div>
            </label>
          ))}
        </Dropdown>

        <Dropdown
          id="state"
          label="State"
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          activeMenuRef={activeMenuRef}
          disabled={regions.length === 0}
          summary={regions.length === 0 ? 'Select Region First' : states.length ? `${states.length} state${states.length > 1 ? 's' : ''}` : 'All States'}
        >
          <label className="msel-option all-option">
            <input type="checkbox" checked={states.length === 0} onChange={() => setStates([])} />
            <span>All States</span>
          </label>
          <div className="msel-divider" />
          {availableStates.map(([abbr, s]) => (
            <label key={abbr} className="msel-option">
              <input type="checkbox" checked={states.includes(abbr)} onChange={() => setStates(toggle(states, abbr))} />
              <span>{s.name}</span>
            </label>
          ))}
        </Dropdown>

        <Dropdown id="division" label="Division" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={divisions.length ? `${divisions.length} selected` : 'All Divisions'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={divisions.length === 0} onChange={() => setDivisions([])} />
            <span>All Divisions</span>
          </label>
          <div className="msel-divider" />
          {DIVISIONS.map(d => (
            <label key={d} className="msel-option">
              <input type="checkbox" checked={divisions.includes(d)} onChange={() => setDivisions(toggle(divisions, d))} />
              <span>{d}</span>
            </label>
          ))}
        </Dropdown>

        {/* ROW 2 */}
        <Dropdown id="surface" label="Surface" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={surfaces.length ? `${surfaces.length} selected` : 'All Surfaces'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={surfaces.length === 0} onChange={() => setSurfaces([])} />
            <span>All Surfaces</span>
          </label>
          <div className="msel-divider" />
          {SURFACES.map(s => (
            <label key={s} className="msel-option">
              <input type="checkbox" checked={surfaces.includes(s)} onChange={() => setSurfaces(toggle(surfaces, s))} />
              <span>{s}</span>
            </label>
          ))}
        </Dropdown>

        <Dropdown id="org" label="Organization" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={orgs.length ? `${orgs.length} selected` : 'All Organizations'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={orgs.length === 0} onChange={() => setOrgs([])} />
            <span>All Organizations</span>
          </label>
          <div className="msel-divider" />
          {ORG_FILTER_OPTIONS.map(o => (
            <label key={o} className="msel-option">
              <input type="checkbox" checked={orgs.includes(o)} onChange={() => setOrgs(toggle(orgs, o))} />
              <span>{o}</span>
            </label>
          ))}
        </Dropdown>

        <Dropdown id="gender" label="Gender" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={genders.length ? `${genders.length} selected` : 'All Genders'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={genders.length === 0} onChange={() => setGenders([])} />
            <span>All Genders</span>
          </label>
          <div className="msel-divider" />
          {GENDERS.map(g => (
            <label key={g} className="msel-option">
              <input type="checkbox" checked={genders.includes(g)} onChange={() => setGenders(toggle(genders, g))} />
              <span>{g}</span>
            </label>
          ))}
        </Dropdown>

        {/* Search sits in the empty 4th cell of row 2, bottom-aligned (align-items:end) with Gender. */}
        <button className="btn btn-primary search-submit" onClick={applySearch}>Search</button>
      </div>
    </div>
  )
}
