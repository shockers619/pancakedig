'use client'
import { useState, useEffect, useRef } from 'react'
import { US_STATES } from '@/lib/constants'
import { REGIONS, TYPES, EVENT_TYPES, SURFACES, LEVELS, ORGANIZATIONS, GENDERS, DIVISIONS, REGION_KEY, toggle } from '@/lib/filterOptions'
import { Dropdown } from './Dropdown'

// Types where the listing needs a distinct title, separate from the
// club/org name — matching the same convention FloorBalance's real posting
// form uses (a tryout or event needs its own headline; a club profile's
// title is just its own name).
const NEEDS_TITLE = ['tryout', 'opening', 'showcase']

export default function PostListingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openMenu, setOpenMenu] = useState('')
  const [type, setType] = useState('')
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [region, setRegion] = useState('')
  const [state, setState] = useState('')
  const [divisions, setDivisions] = useState<string[]>([])
  const [surfaces, setSurfaces] = useState<string[]>([])
  const [levels, setLevels] = useState<string[]>([])
  const [orgs, setOrgs] = useState<string[]>([])
  const [genders, setGenders] = useState<string[]>([])
  const [clubName, setClubName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const activeMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (activeMenuRef.current && !activeMenuRef.current.contains(e.target as Node)) {
        setOpenMenu('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!open) return null

  const availableStates = Object.entries(US_STATES)
    .filter(([, s]) => !region || s.region === REGION_KEY[region])
    .sort((a, b) => a[1].name.localeCompare(b[1].name))

  const needsTitle = NEEDS_TITLE.includes(type)

  const reset = () => {
    setType(''); setEventTypes([]); setRegion(''); setState(''); setDivisions([]); setSurfaces([])
    setLevels([]); setOrgs([]); setGenders([]); setClubName(''); setTitle(''); setEmail('')
    setPhone(''); setWebsite(''); setDetails(''); setError(''); setSubmitted(false)
  }

  const close = () => { onClose(); setOpenMenu(''); reset() }

  const submit = () => {
    if (!type) { setError('Please select a listing type.'); return }
    if (!clubName.trim()) { setError('Club / organization name is required.'); return }
    if (needsTitle && !title.trim()) { setError('Please give this listing a title.'); return }
    if (!region) { setError('Please select a region.'); return }
    if (!email && !phone && !website) { setError('Please provide at least one way to contact you: email, phone, or website.'); return }
    setError('')
    // No backend is wired up yet for Pancake Dig — this is an honest first
    // pass on the posting UI, not a working submission pipeline. Logging
    // the collected data for now rather than pretending it was saved
    // somewhere real.
    console.log('Pancake Dig listing draft (not yet submitted to a backend):', {
      type, eventTypes, region, state, divisions, surfaces, levels, orgs, genders,
      clubName, title, email, phone, website, details,
    })
    setSubmitted(true)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--court-navy-2)', border: '2px solid rgba(244,246,242,0.12)', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--chalk)' }}>Post a Listing</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--chalk-faint)', marginTop: '4px' }}>Free during growth stage</div>
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--chalk-faint)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {submitted ? (
          <div style={{ padding: '20px 0', fontSize: '14px', lineHeight: 1.6, color: 'var(--chalk)' }}>
            <p>Thanks — this is a first pass on the posting form, so nothing's gone live yet. Your details are captured and ready for when the real submission flow is wired up.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={close}>Close</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="search-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <Dropdown id="p-type" label="Type" required openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={type ? TYPES.find(([v]) => v === type)?.[1] || '' : 'Select Type'}>
                {TYPES.map(([v, l]) => (
                  <div key={v}>
                    <label className="msel-option">
                      <input type="radio" checked={type === v} onChange={() => { setType(v); if (v !== 'showcase') setEventTypes([]) }} />
                      <span>{l}</span>
                    </label>
                    {v === 'showcase' && type === 'showcase' && (
                      <div style={{ marginLeft: '26px', borderLeft: '2px solid rgba(255,196,43,0.25)', paddingLeft: '10px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--chalk-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 0 2px' }}>Event Type</div>
                        <label className="msel-option all-option" style={{ padding: '7px 8px' }}>
                          <input type="checkbox" checked={eventTypes.length === EVENT_TYPES.length} onChange={() => setEventTypes(eventTypes.length === EVENT_TYPES.length ? [] : [...EVENT_TYPES])} />
                          <span>Select All</span>
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

              <Dropdown id="p-region" label="Region" required openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={region || 'Select Region'}>
                {REGIONS.map(([name, states_]) => (
                  <label key={name} className="msel-option">
                    <input type="radio" checked={region === name} onChange={() => { setRegion(name); setState('') }} />
                    <div>
                      <span style={{ display: 'block' }}>{name}</span>
                      <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--chalk-faint)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>{states_}</span>
                    </div>
                  </label>
                ))}
              </Dropdown>

              <Dropdown id="p-state" label="State" disabled={!region} openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={!region ? 'Select Region First' : state ? US_STATES[state]?.name : 'Select State'}>
                {availableStates.map(([abbr, s]) => (
                  <label key={abbr} className="msel-option">
                    <input type="radio" checked={state === abbr} onChange={() => setState(abbr)} />
                    <span>{s.name}</span>
                  </label>
                ))}
              </Dropdown>

              <Dropdown id="p-division" label="Division" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={divisions.length ? divisions.join(', ') : 'Select Divisions'}>
                <label className="msel-option all-option">
                  <input type="checkbox" checked={divisions.length === DIVISIONS.length} onChange={() => setDivisions(divisions.length === DIVISIONS.length ? [] : [...DIVISIONS])} />
                  <span>Select All</span>
                </label>
                <div className="msel-divider" />
                {DIVISIONS.map(d => (
                  <label key={d} className="msel-option">
                    <input type="checkbox" checked={divisions.includes(d)} onChange={() => setDivisions(toggle(divisions, d))} />
                    <span>{d}</span>
                  </label>
                ))}
              </Dropdown>

              <Dropdown id="p-surface" label="Surface" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={surfaces.length ? surfaces.join(', ') : 'Select Surfaces'}>
                <label className="msel-option all-option">
                  <input type="checkbox" checked={surfaces.length === SURFACES.length} onChange={() => setSurfaces(surfaces.length === SURFACES.length ? [] : [...SURFACES])} />
                  <span>Select All</span>
                </label>
                <div className="msel-divider" />
                {SURFACES.map(s => (
                  <label key={s} className="msel-option">
                    <input type="checkbox" checked={surfaces.includes(s)} onChange={() => setSurfaces(toggle(surfaces, s))} />
                    <span>{s}</span>
                  </label>
                ))}
              </Dropdown>

              <Dropdown id="p-level" label="Level" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={levels.length ? `${levels.length} selected` : 'Select Levels'}>
                <label className="msel-option all-option">
                  <input type="checkbox" checked={levels.length === LEVELS.length} onChange={() => setLevels(levels.length === LEVELS.length ? [] : [...LEVELS])} />
                  <span>Select All</span>
                </label>
                <div className="msel-divider" />
                {LEVELS.map(l => (
                  <label key={l} className="msel-option">
                    <input type="checkbox" checked={levels.includes(l)} onChange={() => setLevels(toggle(levels, l))} />
                    <span>{l}</span>
                  </label>
                ))}
              </Dropdown>

              <Dropdown id="p-org" label="Organization" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={orgs.length ? orgs.join(', ') : 'Select Organizations'}>
                <label className="msel-option all-option">
                  <input type="checkbox" checked={orgs.length === ORGANIZATIONS.length} onChange={() => setOrgs(orgs.length === ORGANIZATIONS.length ? [] : [...ORGANIZATIONS])} />
                  <span>Select All</span>
                </label>
                <div className="msel-divider" />
                {ORGANIZATIONS.map(o => (
                  <label key={o} className="msel-option">
                    <input type="checkbox" checked={orgs.includes(o)} onChange={() => setOrgs(toggle(orgs, o))} />
                    <span>{o}</span>
                  </label>
                ))}
              </Dropdown>

              <Dropdown id="p-gender" label="Gender" openMenu={openMenu} setOpenMenu={setOpenMenu} activeMenuRef={activeMenuRef} summary={genders.length ? genders.join(', ') : 'Select Genders'}>
                <label className="msel-option all-option">
                  <input type="checkbox" checked={genders.length === GENDERS.length} onChange={() => setGenders(genders.length === GENDERS.length ? [] : [...GENDERS])} />
                  <span>Select All</span>
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

            <div>
              <label className="field-label">Club / Organization Name <span style={{ color: 'var(--antenna-red)' }}>*</span></label>
              <input className="text-input" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. Chester County Volleyball Club" maxLength={60} />
            </div>

            {needsTitle && (
              <div>
                <label className="field-label">Listing Title <span style={{ color: 'var(--antenna-red)' }}>*</span></label>
                <input className="text-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 14U Girls Tryouts — Fall Season" maxLength={60} />
              </div>
            )}

            <div className="search-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <label className="field-label">Email</label>
                <input className="text-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@club.com" />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input className="text-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" />
              </div>
              <div>
                <label className="field-label">Website</label>
                <input className="text-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="yourclub.com" />
              </div>
            </div>

            <div>
              <label className="field-label">Details</label>
              <textarea className="text-input" value={details} onChange={e => setDetails(e.target.value)} rows={4} placeholder="Anything families should know." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            {error && <div style={{ color: 'var(--antenna-red)', fontSize: '12.5px' }}>{error}</div>}
            <button className="btn btn-primary search-submit" onClick={submit}>Submit Listing</button>
          </div>
        )}
      </div>
    </div>
  )
}
