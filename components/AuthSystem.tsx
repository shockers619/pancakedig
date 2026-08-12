'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase'

// Auth modal: sign up / log in, adapted from FloorBalance's AuthSystem to PD's
// palette. Email confirmation is ON (Supabase setting), so a fresh sign-up shows
// a "check your email" state rather than logging in immediately. Session state
// itself lives in AccountControls (which listens to onAuthStateChange).
export default function AuthSystem({ open, mode, onClose }: { open: boolean; mode: 'signin' | 'signup'; onClose: () => void }) {
  const [tab, setTab] = useState<'signin' | 'signup'>(mode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const sb = createClient()

  useEffect(() => { setTab(mode) }, [mode])
  useEffect(() => { if (open) { setErr(''); setConfirmSent(false); setPassword('') } }, [open])

  if (!open || typeof document === 'undefined') return null

  const signIn = async () => {
    setBusy(true); setErr('')
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) { setErr(error.message === 'Email not confirmed' ? 'Please confirm your email first — check your inbox for the link.' : error.message); return }
    onClose()
  }

  const signUp = async () => {
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    setBusy(true); setErr('')
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    })
    setBusy(false)
    if (error) { setErr(error.message); return }
    // With confirmation ON, there's no active session yet — prompt them to confirm.
    if (!data.session) { setConfirmSent(true); return }
    onClose()
  }

  const googleSignIn = async () => {
    setErr('')
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    })
    if (error) setErr(error.message)
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 600 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-head">
          <h2 style={{ fontSize: '19px' }}>{confirmSent ? 'Check your email' : tab === 'signin' ? 'Sign in' : 'Create your account'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {confirmSent ? (
          <div style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--chalk-dim)' }}>
            <p>We sent a confirmation link to <strong style={{ color: 'var(--chalk)' }}>{email.trim()}</strong>. Click it to activate your account, then come back and sign in.</p>
            <button className="listing-cta" style={{ marginTop: '14px' }} onClick={onClose}>Got it</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--chalk-dim)', margin: 0, lineHeight: 1.5 }}>
              {tab === 'signin'
                ? 'Sign in to post listings, claim your club, and manage what you own.'
                : 'Create a free account to post and claim listings. Directors: this is how you take over your club’s page.'}
            </p>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={googleSignIn}>
              Continue with Google
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--chalk-faint)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ flex: 1, height: '1px', background: 'rgba(244,246,242,0.14)' }} />or<span style={{ flex: 1, height: '1px', background: 'rgba(244,246,242,0.14)' }} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="text-input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@club.com" />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input className="text-input" type="password" autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={tab === 'signin' ? 'Your password' : 'At least 8 characters'}
                onKeyDown={e => { if (e.key === 'Enter') (tab === 'signin' ? signIn() : signUp()) }} />
            </div>
            {err && <div style={{ color: 'var(--antenna-red)', fontSize: '12.5px', lineHeight: 1.4 }}>{err}</div>}
            <button className="listing-cta" disabled={busy || !email || !password} style={{ opacity: busy || !email || !password ? 0.6 : 1 }}
              onClick={tab === 'signin' ? signIn : signUp}>
              {busy ? 'Working…' : tab === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <div style={{ fontSize: '12.5px', color: 'var(--chalk-dim)', textAlign: 'center' }}>
              {tab === 'signin' ? (
                <>New here? <button className="linklike" onClick={() => { setTab('signup'); setErr('') }}>Create an account</button></>
              ) : (
                <>Already have one? <button className="linklike" onClick={() => { setTab('signin'); setErr('') }}>Sign in</button></>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
