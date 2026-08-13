'use client'
import { useState } from 'react'
import { REGIONS, TYPES, DIVISIONS, GENDERS, ORG_FILTER_OPTIONS, REGION_KEY, toggle } from '@/lib/filterOptions'

// "🔔 Notify me when something new matches" — captures an email + preferences
// and POSTs to /api/notify (stored in notify_subscribers). Ported/adapted from
// FloorBalance's notify modal, volleyball fields.
export default function NotifyModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [divisions, setDivisions] = useState<string[]>([])
  const [genders, setGenders] = useState<string[]>([])
  const [orgs, setOrgs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.03em', padding: '6px 11px', borderRadius: '3px', cursor: 'pointer',
    border: active ? '2px solid var(--volley-yellow)' : '2px solid rgba(244,246,242,0.16)',
    background: active ? 'rgba(255,196,43,0.12)' : 'transparent',
    color: active ? 'var(--volley-yellow)' : 'var(--chalk-dim)',
  })

  const submit = async () => {
    if (!email.includes('@') || regions.length === 0) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/notify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          regions: regions.map(r => REGION_KEY[r]).filter(Boolean),
          types, divisions, orgs,
          genders: genders.map(g => g.toLowerCase()),
        }),
      })
      if (res.ok) setSent(true)
      else setError('Something went wrong. Please try again.')
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const Group = ({ label, opts, sel, set }: { label: string; opts: string[]; sel: string[]; set: (v: string[]) => void }) => (
    <div style={{ marginBottom: '16px' }}>
      <label className="field-label" style={{ marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {opts.map(o => (
          <button key={o} type="button" style={chip(sel.includes(o))} onClick={() => set(toggle(sel, o))}>{o}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Get Notified</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>You&apos;re on the list.</div>
            <div style={{ fontSize: '13.5px', color: 'var(--chalk-dim)' }}>We&apos;ll email you when new listings match your alert.</div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--chalk-dim)', marginBottom: '18px', lineHeight: 1.5 }}>
              Tell us what you&apos;re looking for and we&apos;ll email you when a matching listing goes up. Region is required.
            </p>
            <Group label="Region *" opts={REGIONS.map(r => r[0])} sel={regions} set={setRegions} />
            <Group label="Type" opts={TYPES.map(t => t[1])} sel={types} set={setTypes} />
            <Group label="Division" opts={DIVISIONS} sel={divisions} set={setDivisions} />
            <Group label="Gender" opts={GENDERS} sel={genders} set={setGenders} />
            <Group label="Organization" opts={ORG_FILTER_OPTIONS} sel={orgs} set={setOrgs} />

            <div style={{ borderTop: '1px solid rgba(244,246,242,0.1)', paddingTop: '16px' }}>
              <label className="field-label" style={{ marginBottom: '6px' }}>Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="text-input" style={{ width: '100%', marginBottom: '14px', fontSize: '15px', padding: '12px 13px' }} />
              {error && <div style={{ color: 'var(--antenna-red)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: (!email.includes('@') || !regions.length) ? 0.5 : 1 }}
                disabled={loading || !email.includes('@') || !regions.length} onClick={submit}>
                {loading ? 'Saving…' : 'Notify Me'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
