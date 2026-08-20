'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase'

// "Claim This Listing" — a director files a claim request (claim_requests), which
// the admin reviews in the Admin queue; approving transfers ownership. Adapted
// from FloorBalance's ClaimListingButton to PD's palette. Requires sign-in.
export function ClaimListingButton({ listingId, listingTitle, compact = false }: { listingId: number; listingTitle: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const sb = createClient()

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: listener } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])

  const submitClaim = async () => {
    const { data: fresh } = await sb.auth.getSession()
    const currentUser = fresh.session?.user ?? user
    if (!currentUser) { setError('Please sign in first (top-right), then try claiming again.'); return }
    if (!name.trim()) { setError('Please enter your name.'); return }
    setSubmitting(true); setError('')
    const { error: insertError } = await sb.from('claim_requests').insert({
      listing_id: listingId,
      requester_user_id: currentUser.id,
      requester_email: currentUser.email,
      requester_name: name.trim(),
      requester_message: message.trim() || null,
      status: 'pending',
    })
    setSubmitting(false)
    if (insertError) { setError('Something went wrong submitting your claim. Please try again.'); return }
    setUser(currentUser)
    setSubmitted(true)
    // Notify the admin by email — fire-and-forget; the claim is already saved,
    // so a missing/failing route must not surface an error to the requester.
    fetch('/api/claim-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, listingTitle, requesterName: name.trim(), requesterEmail: currentUser.email, requesterMessage: message.trim() || null }),
    }).catch(() => {})
  }

  return (
    <>
      <button className={compact ? 'claim-btn-compact' : 'claim-btn-compact'} onClick={e => { e.stopPropagation(); setOpen(true) }}>
        Claim This Listing
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setOpen(false)} style={{ zIndex: 650 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-head">
              <h2 style={{ fontSize: '18px' }}>Claim “{listingTitle}”</h2>
              <button className="modal-close" onClick={() => setOpen(false)}>×</button>
            </div>

            {submitted ? (
              <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--chalk-dim)' }}>
                <p>Thanks — your claim was submitted for review. We’ll reach out at <strong style={{ color: 'var(--chalk)' }}>{user?.email}</strong> once it’s approved, and then you’ll be able to edit this listing from your account.</p>
                <button className="listing-cta" style={{ marginTop: '12px' }} onClick={() => setOpen(false)}>Close</button>
              </div>
            ) : !user ? (
              // Logged out: FloorBalance-style wording; "Sign In" is a live link
              // that opens the auth modal (where you can sign in OR create one).
              <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--chalk-dim)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0 }}>
                  Claiming a listing needs a free Pancake Dig account — that’s how we know who to follow up with and confirm you’re affiliated.
                </p>
                <p style={{ margin: 0 }}>
                  Use the <button className="linklike" onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('pd:open-auth', { detail: { mode: 'signin' } })) }}>Sign In</button> link to sign in or create one (takes a minute), then reopen this listing and click <strong style={{ color: 'var(--chalk)' }}>Claim This Listing</strong> again.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="field-label">Your Name</label>
                  <input className="text-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jamie Rivera" />
                </div>
                <div>
                  <label className="field-label">Your Role / How You’re Connected (optional)</label>
                  <textarea className="text-input" value={message} onChange={e => setMessage(e.target.value)} placeholder="e.g. I’m the director of this club" rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                {error && <div style={{ color: 'var(--antenna-red)', fontSize: '12.5px' }}>{error}</div>}
                <button className="listing-cta" disabled={submitting} onClick={submitClaim} style={{ opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Submitting…' : 'Submit Claim Request'}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
