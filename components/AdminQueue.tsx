'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase'
import { revalidateListings } from '@/lib/revalidate'
import { TYPE_LABELS, REGION_NAMES } from '@/lib/constants'

// Admin control panel (visible only to ADMIN_EMAIL — gated in AccountControls,
// and enforced again by RLS server-side). Two queues: pending listings awaiting
// approval, and claim requests awaiting review. Approving a claim transfers the
// listing's ownership to the requester and marks it verified + claimed.
export default function AdminQueue({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'listings' | 'claims' | 'published'>('listings')
  const [pending, setPending] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [published, setPublished] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const sb = createClient()

  const load = async () => {
    setLoading(true)
    const { data: p } = await sb.from('listings').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    const { data: c } = await sb.from('claim_requests').select('*, listings(title, club)').eq('status', 'pending').order('created_at', { ascending: false })
    // Everything a real user owns that's live — self-published (verified users, no queue)
    // AND claimed. Lets the admin see + pull anything that went public without review.
    const { data: pub } = await sb.from('listings').select('*').eq('status', 'approved').not('user_id', 'is', null).order('created_at', { ascending: false }).limit(200)
    setPending(p || []); setClaims(c || []); setPublished(pub || []); setLoading(false)
  }
  useEffect(() => { if (open) load() }, [open])

  const setListingStatus = async (l: any, status: string) => {
    await sb.from('listings').update({ status }).eq('id', l.id)
    setPending(ps => ps.filter(p => p.id !== l.id))
    // Approving/rejecting changes what's public — refresh the cached listing reads.
    revalidateListings()
    // On approval, fire the Notify-Me alert to matching subscribers (best-effort).
    if (status === 'approved') {
      fetch('/api/notify-listing', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing: { ...l, status: 'approved' } }),
      }).catch(() => {})
    }
  }
  const delListing = async (id: number) => {
    if (!confirm('Delete this listing permanently?')) return
    await sb.from('listings').delete().eq('id', id)
    setPending(ps => ps.filter(p => p.id !== id))
    revalidateListings()
  }
  // Pull a live user listing back down (reversible: sets status='rejected').
  const pullPublished = async (l: any) => {
    if (!confirm('Take this live listing down? (Reversible — sets it to rejected.)')) return
    await sb.from('listings').update({ status: 'rejected' }).eq('id', l.id)
    setPublished(ps => ps.filter(p => p.id !== l.id))
    revalidateListings()
  }
  const delPublished = async (id: number) => {
    if (!confirm('Delete this listing permanently?')) return
    await sb.from('listings').delete().eq('id', id)
    setPublished(ps => ps.filter(p => p.id !== id))
    revalidateListings()
  }
  const resolveClaim = async (claim: any, approve: boolean) => {
    if (approve) {
      // transfer ownership to the requester + mark verified/claimed
      await sb.from('listings').update({ user_id: claim.requester_user_id, verified: true, claimed: true }).eq('id', claim.listing_id)
    }
    await sb.from('claim_requests').update({ status: approve ? 'approved' : 'rejected' }).eq('id', claim.id)
    setClaims(cs => cs.filter(c => c.id !== claim.id))
    if (approve) revalidateListings()
  }

  if (!open || typeof document === 'undefined') return null

  const TabBtn = ({ id, label, n }: { id: 'listings' | 'claims' | 'published'; label: string; n: number }) => (
    <button onClick={() => setTab(id)} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px', fontFamily: 'var(--font-mono)',
      fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase',
      color: tab === id ? 'var(--volley-yellow)' : 'var(--chalk-dim)',
      borderBottom: tab === id ? '2px solid var(--volley-yellow)' : '2px solid transparent',
    }}>{label} {n > 0 && <span style={{ color: 'var(--volley-yellow)' }}>({n})</span>}</button>
  )

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 600 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-head">
          <h2 style={{ fontSize: '19px' }}>Admin</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ display: 'flex', gap: '18px', borderBottom: '1px solid rgba(244,246,242,0.12)', marginBottom: '16px' }}>
          <TabBtn id="listings" label="Pending" n={pending.length} />
          <TabBtn id="claims" label="Claims" n={claims.length} />
          <TabBtn id="published" label="Live (users)" n={published.length} />
        </div>

        {loading ? (
          <p style={{ color: 'var(--chalk-dim)', fontSize: '13px' }}>Loading…</p>
        ) : tab === 'listings' ? (
          pending.length === 0 ? <p style={{ color: 'var(--chalk-dim)', fontSize: '13.5px' }}>Nothing pending — the queue is clear. 🏐</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pending.map(l => (
                <div key={l.id} style={{ border: '1px solid rgba(244,246,242,0.12)', borderRadius: '6px', padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--chalk)' }}>{l.title || l.club}</div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--chalk-dim)', margin: '4px 0 10px' }}>
                    {TYPE_LABELS[l.type] || l.type} · {REGION_NAMES[l.region] || l.region}{l.state ? ` · ${[l.city, l.state.toUpperCase()].filter(Boolean).join(', ')}` : ''}
                    {(l.email || l.website) ? ` · ${l.email || l.website}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => setListingStatus(l, 'approved')}>Approve</button>
                    <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => setListingStatus(l, 'rejected')}>Reject</button>
                    <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '11px', color: 'var(--antenna-red)', borderColor: 'rgba(225,75,60,0.4)' }} onClick={() => delListing(l.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'published' ? (
          published.length === 0 ? <p style={{ color: 'var(--chalk-dim)', fontSize: '13.5px' }}>Nothing published by users yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {published.map(l => (
                <div key={l.id} style={{ border: '1px solid rgba(244,246,242,0.12)', borderRadius: '6px', padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--chalk)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {l.title || l.club}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--court-navy)', background: 'var(--volley-yellow)', borderRadius: '3px', padding: '1px 5px' }}>Live</span>
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--chalk-dim)', margin: '4px 0 10px' }}>
                    {TYPE_LABELS[l.type] || l.type} · {REGION_NAMES[l.region] || l.region}{l.state ? ` · ${[l.city, l.state.toUpperCase()].filter(Boolean).join(', ')}` : ''}
                    {(l.email || l.website) ? ` · ${l.email || l.website}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => pullPublished(l)}>Take down</button>
                    <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '11px', color: 'var(--antenna-red)', borderColor: 'rgba(225,75,60,0.4)' }} onClick={() => delPublished(l.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          claims.length === 0 ? <p style={{ color: 'var(--chalk-dim)', fontSize: '13.5px' }}>No claim requests to review.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {claims.map(c => (
                <div key={c.id} style={{ border: '1px solid rgba(244,246,242,0.12)', borderRadius: '6px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '13.5px', color: 'var(--chalk)' }}>
                    <strong>{c.requester_name || 'Someone'}</strong> wants to claim <strong>{c.listings?.title || c.listings?.club || `listing #${c.listing_id}`}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--chalk-dim)', margin: '4px 0' }}>{c.requester_email}</div>
                  {c.requester_message && <div style={{ fontSize: '12.5px', color: 'var(--chalk-dim)', fontStyle: 'italic', marginBottom: '8px' }}>“{c.requester_message}”</div>}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => resolveClaim(c, true)}>Approve &amp; transfer</button>
                    <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => resolveClaim(c, false)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>,
    document.body
  )
}
