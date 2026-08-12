'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ADMIN_EMAIL } from '@/lib/constants'
import AuthSystem from './AuthSystem'
import Dashboard from './Dashboard'
import AdminQueue from './AdminQueue'
import PostListingModal from './PostListingModal'

// Header account control: session-aware. Logged out → "Sign In" (opens the auth
// modal). Logged in → account menu with the dashboard + sign out. Session is
// tracked here via onAuthStateChange so the header reacts the moment auth changes.
// (Dashboard + admin queue mount here next; this is the accounts foundation.)
export default function AccountControls() {
  const [user, setUser] = useState<any>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dashOpen, setDashOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [editListing, setEditListing] = useState<any>(null)
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

  const signOut = async () => { await sb.auth.signOut(); setUser(null); setMenuOpen(false) }

  return (
    <>
      {!user ? (
        <button className="btn btn-outline" onClick={() => setAuthOpen(true)}>Sign In</button>
      ) : (
        <div style={{ position: 'relative' }}>
          <button className="btn btn-outline" onClick={() => setMenuOpen(o => !o)}>
            {user.email?.split('@')[0] || 'Account'} ▾
          </button>
          {menuOpen && (
            <div className="account-menu" onMouseLeave={() => setMenuOpen(false)}>
              <div className="account-menu-email">{user.email}</div>
              <button className="account-menu-item" onClick={() => { setDashOpen(true); setMenuOpen(false) }}>My Listings</button>
              {isAdmin && <button className="account-menu-item" onClick={() => { setAdminOpen(true); setMenuOpen(false) }} style={{ color: 'var(--volley-yellow)' }}>Admin queue</button>}
              <button className="account-menu-item" onClick={signOut}>Sign out</button>
            </div>
          )}
        </div>
      )}
      <AuthSystem open={authOpen} mode="signin" onClose={() => setAuthOpen(false)} />
      <Dashboard open={dashOpen} onClose={() => setDashOpen(false)} onEdit={(l) => { setDashOpen(false); setEditListing(l) }} />
      <PostListingModal open={!!editListing} editing={editListing} onClose={() => setEditListing(null)} />
      {isAdmin && <AdminQueue open={adminOpen} onClose={() => setAdminOpen(false)} />}
    </>
  )
}
