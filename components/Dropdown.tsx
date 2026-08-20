'use client'

export function Dropdown({ id, label, summary, disabled, required, openMenu, setOpenMenu, activeMenuRef, children }: {
  id: string; label: string; summary: string; disabled?: boolean; required?: boolean
  openMenu: string; setOpenMenu: (v: string) => void; activeMenuRef: React.RefObject<HTMLDivElement>; children: React.ReactNode
}) {
  const isOpen = openMenu === id
  return (
    <div className="search-field msel">
      <label className="field-label">{label}{required && <span style={{ color: 'var(--antenna-red)' }}> *</span>}</label>
      <div
        className={`msel-box${disabled ? ' disabled' : ''}${isOpen ? ' open' : ''}`}
        onClick={e => { e.stopPropagation(); if (!disabled) setOpenMenu(isOpen ? '' : id) }}
      >
        <span>{summary}</span>
        <span className={`msel-chevron${isOpen ? ' open' : ''}`}>▾</span>
      </div>
      {isOpen && (
        <div className="msel-menu open" ref={activeMenuRef} onClick={e => e.stopPropagation()}>
          {/* Header pinned at the top of the menu — always visible right where the
              menu opens, so there's an obvious close control even when the list is
              long enough to push the bottom Done button below the screen fold. */}
          <div className="msel-head">
            <span>{label}</span>
            <button className="msel-x" onClick={() => setOpenMenu('')} aria-label={`Close ${label}`}>×</button>
          </div>
          <div className="msel-scroll">{children}</div>
          {/* Sticky footer so the close control is always visible, even on a long
              list (e.g. State's 50 options) where it would otherwise sit below the
              scroll fold — the exact confusion a first user reported on mobile. */}
          <div className="msel-foot">
            <button className="msel-done" onClick={() => setOpenMenu('')}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}
