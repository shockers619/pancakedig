'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { US_STATES } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { REGIONS, TYPES, EVENT_TYPES, SURFACES, LEVELS, ORGANIZATIONS, GENDERS, DIVISIONS, REGION_KEY, toggle } from '@/lib/filterOptions'
import { Dropdown } from './Dropdown'

// Types where the listing needs a distinct title, separate from the
// club/org name — matching the same convention FloorBalance's real posting
// form uses (a tryout or event needs its own headline; a club profile's
// title is just its own name).
const NEEDS_TITLE = ['tryout', 'opening', 'showcase']

// `editing` (optional) turns this into an edit form: prefill from the listing and
// UPDATE it in place instead of inserting a new pending row. Opened this way from
// the dashboard; RLS ("owner updates own") scopes the update to the owner.
export default function PostListingModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: any }) {
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
  const [busy, setBusy] = useState(false)
  const [user, setUser] = useState<any>(null)
  const sb = createClient()
  const activeMenuRef = useRef<HTMLDivElement>(null)
  // Only arm "click backdrop to close the modal" when the mousedown lands
  // directly on the overlay AND no dropdown is open. React's onMouseDown fires
  // before the document mousedown listener below (which closes the open menu),
  // so `openMenu` here still reflects whether a dropdown was open — letting the
  // first outside-click dismiss just the dropdown, not the whole modal.
  const overlayShouldClose = useRef(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (activeMenuRef.current && !activeMenuRef.current.contains(e.target as Node)) {
        setOpenMenu('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Track auth so we can require sign-in to post (a listing is tied to its owner).
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  // Prefill the form when opened in edit mode (reverse-mapping the stored fields
  // back into the form's controls).
  useEffect(() => {
    if (!open || !editing) return
    const csv = (v?: string) => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : [])
    const gmap: Record<string, string> = { boys: 'Boys', girls: 'Girls', coed: 'Coed' }
    setType(editing.type || '')
    setEventTypes(csv(editing.event_subtype))
    setRegion(Object.keys(REGION_KEY).find(n => REGION_KEY[n] === editing.region) || '')
    setState(editing.state || '')
    setDivisions(csv(editing.division))
    setSurfaces(csv(editing.surface))
    setLevels(Array.isArray(editing.tiers) ? editing.tiers : [])
    setOrgs(csv(editing.governing_body))
    setGenders(editing.gender && gmap[editing.gender] ? [gmap[editing.gender]] : [])
    setClubName(editing.club || '')
    setTitle(NEEDS_TITLE.includes(editing.type) ? (editing.title || '') : '')
    setEmail(editing.email || '')
    setPhone(editing.phone || '')
    setWebsite(editing.website || '')
    setDetails(editing.details || '')
    setError(''); setSubmitted(false)
  }, [open, editing])

  // Only portal on the client (document exists there); server render returns null anyway.
  if (!open || typeof document === 'undefined') return null

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

  const submit = async () => {
    if (!type) { setError('Please select a listing type.'); return }
    if (!clubName.trim()) { setError('Club / organization name is required.'); return }
    if (needsTitle && !title.trim()) { setError('Please give this listing a title.'); return }
    if (!region) { setError('Please select a region.'); return }
    if (!email && !phone && !website) { setError('Please provide at least one way to contact you: email, phone, or website.'); return }
    setError('')
    // Must be signed in — the listing is tied to its owner (user_id) so they can
    // edit it later, and RLS only accepts an insert where user_id = auth.uid().
    const { data: { session } } = await sb.auth.getSession()
    const u = session?.user
    if (!u) { setError('Please sign in first (button top-right) so your listing is tied to your account — then submit again.'); return }
    setBusy(true)
    const site = website.trim() ? (/^https?:\/\//i.test(website.trim()) ? website.trim() : 'https://' + website.trim()) : null
    const g = genders.map(s => s.toLowerCase())
    const genderVal = (g.length > 1 || g.includes('coed')) ? 'coed' : g.includes('boys') ? 'boys' : g.includes('girls') ? 'girls' : null
    const fields = {
      type,
      club: clubName.trim(),
      title: needsTitle ? title.trim() : clubName.trim(),
      region: REGION_KEY[region],
      state: state ? state.toLowerCase() : null,
      division: divisions.length ? divisions.join(', ') : null,
      gender: genderVal,
      tiers: levels.length ? levels : null,
      governing_body: orgs.length ? orgs.join(', ') : null,
      surface: surfaces.length ? surfaces.join(', ') : null,
      event_subtype: (type === 'showcase' && eventTypes.length) ? eventTypes.join(', ') : null,
      details: details.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      website: site,
    }
    // Edit → update in place (owner keeps ownership + status). New → insert as pending.
    const { error: writeErr } = editing
      ? await sb.from('listings').update(fields).eq('id', editing.id)
      : await sb.from('listings').insert({ ...fields, status: 'pending', user_id: u.id, verified: false, claimed: false, featured: false })
    setBusy(false)
    if (writeErr) { setError('Could not save — ' + writeErr.message); return }
    setSubmitted(true)
    // Confirm to the poster — best-effort, never blocks.
    if (!editing && u.email) {
      fetch('/api/post-confirmation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: u.email, title: fields.title }),
      }).catch(() => {})
    }
  }

  return createPortal(
    <div
      onMouseDown={e => { overlayShouldClose.current = e.target === e.currentTarget && !openMenu }}
      onClick={e => { if (e.target === e.currentTarget && overlayShouldClose.current) close() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--court-navy-2)', border: '2px solid rgba(244,246,242,0.12)', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--chalk)' }}>{editing ? 'Edit Listing' : 'Post a Listing'}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--chalk-faint)', marginTop: '4px' }}>{editing ? 'Update your listing' : 'Free to list your program'}</div>
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--chalk-faint)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {submitted ? (
          <div style={{ padding: '20px 0', fontSize: '14px', lineHeight: 1.6, color: 'var(--chalk)' }}>
            <p>{editing
              ? <>Your changes were saved.</>
              : <>Thanks — your listing was submitted and is <strong>pending review</strong>. Once it’s approved it goes live on the directory. You can see and edit it anytime from your account menu.</>}</p>
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

            {!user && <div style={{ fontSize: '12.5px', color: 'var(--chalk-dim)' }}>You’ll need to <strong style={{ color: 'var(--volley-yellow)' }}>sign in</strong> (top-right) before posting — it ties the listing to your account so you can edit it later.</div>}
            {error && <div style={{ color: 'var(--antenna-red)', fontSize: '12.5px' }}>{error}</div>}
            <button className="btn btn-primary search-submit" disabled={busy} style={{ opacity: busy ? 0.6 : 1 }} onClick={submit}>{busy ? 'Saving…' : editing ? 'Save Changes' : 'Submit Listing'}</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
