'use client'
import { useState, useEffect, useRef } from 'react'
import { US_STATES } from '@/lib/constants'
import { REGIONS, TYPES, EVENT_TYPES, SURFACES, LEVELS, ORGANIZATIONS, GENDERS, DIVISIONS, REGION_KEY, toggle } from '@/lib/filterOptions'
import { Dropdown } from './Dropdown'

export default function SearchPanel() {
  const [openMenu, setOpenMenu] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [divisions, setDivisions] = useState<string[]>([])
  const [surfaces, setSurfaces] = useState<string[]>([])
  const [levels, setLevels] = useState<string[]>([])
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
    const handler = (e: MouseEvent) => {
      if (activeMenuRef.current && !activeMenuRef.current.contains(e.target as Node)) {
        setOpenMenu('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedRegionKeys = regions.map(r => REGION_KEY[r])
  const availableStates = Object.entries(US_STATES)
    .filter(([, s]) => selectedRegionKeys.length === 0 || selectedRegionKeys.includes(s.region))
    .sort((a, b) => a[1].name.localeCompare(b[1].name))

  const showEventType = types.includes('showcase')

  return (
    <div className="search-panel">
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

        <Dropdown id="level" label="Level" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={levels.length ? `${levels.length} selected` : 'All Levels'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={levels.length === 0} onChange={() => setLevels([])} />
            <span>All Levels</span>
          </label>
          <div className="msel-divider" />
          {LEVELS.map(l => (
            <label key={l} className="msel-option">
              <input type="checkbox" checked={levels.includes(l)} onChange={() => setLevels(toggle(levels, l))} />
              <span>{l}</span>
            </label>
          ))}
        </Dropdown>

        <Dropdown id="org" label="Organization" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={orgs.length ? `${orgs.length} selected` : 'All Organizations'}>
          <label className="msel-option all-option">
            <input type="checkbox" checked={orgs.length === 0} onChange={() => setOrgs([])} />
            <span>All Organizations</span>
          </label>
          <div className="msel-divider" />
          {ORGANIZATIONS.map(o => (
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
      </div>

      <button className="btn btn-primary search-submit">Search</button>
    </div>
  )
}
