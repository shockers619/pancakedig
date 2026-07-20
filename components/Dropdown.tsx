'use client'

export function Dropdown({ id, label, summary, disabled, required, openMenu, setOpenMenu, activeMenuRef, children }: {
  id: string; label: string; summary: string; disabled?: boolean; required?: boolean
  openMenu: string; setOpenMenu: (v: string) => void; activeMenuRef: React.RefObject<HTMLDivElement>; children: React.ReactNode
}) {
  return (
    <div className="search-field msel">
      <label className="field-label">{label}{required && <span style={{ color: 'var(--antenna-red)' }}> *</span>}</label>
      <div
        className={`msel-box${disabled ? ' disabled' : ''}`}
        onClick={e => { e.stopPropagation(); if (!disabled) setOpenMenu(openMenu === id ? '' : id) }}
      >
        <span>{summary}</span>
        <span className="msel-chevron">▾</span>
      </div>
      {openMenu === id && (
        <div className="msel-menu open" ref={activeMenuRef} onClick={e => e.stopPropagation()}>
          {children}
          <div style={{ padding: '8px 12px' }}>
            <button className="msel-done" onClick={() => setOpenMenu('')}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}
