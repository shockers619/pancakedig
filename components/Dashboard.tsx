'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase'
import { TYPE_LABELS } from '@/lib/constants'

// A signed-in user's own listings (posted or claimed), with status + delete.
// RLS ("owner reads/deletes own listing") scopes everything to auth.uid().
const STATUS: Record<string, { label: string; color: string }> = {
  approved: { label: 'Live', color: 'var(--good)' },
  pending: { label: 'Pending review', color: 'var(--volley-yellow)' },
  rejected: { label: 'Not approved', color: 'var(--antenna-red)' },
}

export default function Dashboard({ open, onClose, onEdit }: { open: boolean; onClose: () => void; onEdit?: (l: any) => void }) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const sb = createClient()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    sb.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id
      if (!uid) { setRows([]); setLoading(false); return }
      const { data: mine } = await sb.from('listings').select('*').eq('user_id', uid).order('created_at', { ascending: false })
      setRows(mine || [])
      setLoading(false)
    })
  }, [open])

  const del = async (id: number) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    const { error } = await sb.from('listings').delete().eq('id', id)
    if (!error) setRows(rs => rs.filter(r => r.id !== id))
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 600 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-head">
          <h2 style={{ fontSize: '19px' }}>My Listings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--chalk-dim)', fontSize: '13px' }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: 'var(--chalk-dim)', fontSize: '13.5px', lineHeight: 1.6 }}>
            You haven’t posted or claimed any listings yet. Use <strong style={{ color: 'var(--chalk)' }}>“+ Post a Listing”</strong> to add one, or open your club’s listing and click <strong style={{ color: 'var(--chalk)' }}>Claim This Listing</strong>.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rows.map(l => {
              const st = STATUS[l.status] || STATUS.pending
              return (
                <div key={l.id} style={{ border: '1px solid rgba(244,246,242,0.12)', borderRadius: '6px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--chalk)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title || l.club}</div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--chalk-dim)', marginTop: '3px' }}>
                      {TYPE_LABELS[l.type] || l.type} · <span style={{ color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                  {onEdit && <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => onEdit(l)}>Edit</button>}
                  <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '11px', color: 'var(--antenna-red)', borderColor: 'rgba(225,75,60,0.4)' }} onClick={() => del(l.id)}>Delete</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
