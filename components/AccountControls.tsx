'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase'
import { ADMIN_EMAIL } from '@/lib/constants'
import AuthSystem from './AuthSystem'
import Dashboard from './Dashboard'
import AdminQueue from './AdminQueue'
import PostListingModal from './PostListingModal'

// Header account control: session-aware. Logged out → "Sign In" (opens the auth
// modal). Logged in → account menu (My Listings, Admin queue for admin, Sign out).
// The menu is PORTALED to document.body and positioned from the trigger button —
// otherwise it's trapped in the sticky header's stacking context (z-100) and the
// net-line divider (z-101) paints over it. Same fix as the modals.
export default function AccountControls() {
  const [user, setUser] = useState<any>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [dashOpen, setDashOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [editListing, setEditListing] = useState<any>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const sb = createClient()
  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setAuthOpen(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close the menu on any click outside the trigger or the popover.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (document.getElementById('account-menu-pop')?.contains(t)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  const toggleMenu = () => {
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
    setMenuOpen(o => !o)
  }

  const signOut = async () => { await sb.auth.signOut(); setUser(null); setMenuOpen(false) }

  return (
    <>
      {!user ? (
        <button className="btn btn-outline" onClick={() => setAuthOpen(true)}>Sign In</button>
      ) : (
        <button ref={btnRef} className="btn btn-outline" onClick={toggleMenu}>
          {/* Prefer a real first name (Google gives us one); never show the raw
              email handle. Fall back to "Account" for email/password sign-ups. */}
          {(() => {
            const m = user.user_metadata || {}
            const full = m.full_name || m.name || m.given_name || ''
            const first = full.trim().split(/\s+/)[0]
            return first || 'Account'
          })()} ▾
        </button>
      )}

      {user && menuOpen && menuPos && typeof document !== 'undefined' && createPortal(
        <div id="account-menu-pop" className="account-menu" style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 700 }}>
          <div className="account-menu-email">{user.email}</div>
          <button className="account-menu-item" onClick={() => { setDashOpen(true); setMenuOpen(false) }}>My Listings</button>
          {isAdmin && <button className="account-menu-item" onClick={() => { setAdminOpen(true); setMenuOpen(false) }} style={{ color: 'var(--volley-yellow)' }}>Admin queue</button>}
          <button className="account-menu-item" onClick={signOut}>Sign out</button>
        </div>,
        document.body
      )}

      <AuthSystem open={authOpen} mode="signin" onClose={() => setAuthOpen(false)} />
      <Dashboard open={dashOpen} onClose={() => setDashOpen(false)} onEdit={(l) => { setDashOpen(false); setEditListing(l) }} />
      <PostListingModal open={!!editListing} editing={editListing} onClose={() => setEditListing(null)} />
      {isAdmin && <AdminQueue open={adminOpen} onClose={() => setAdminOpen(false)} />}
    </>
  )
}
