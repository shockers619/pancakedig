'use client'
import { useState } from 'react'
import { Listing } from '@/lib/constants'
import ListingCard from '@/components/ListingCard'
import ListingModal from '@/components/ListingModal'

// Placeholder/demo data only — not real seeded listings. Structure mirrors
// what real seeding would produce once this moves past the design stage.
const DEMO_LISTINGS: Listing[] = [
  {
    id: 1, type: 'club', club: 'Example Volleyball Club', title: 'Example Volleyball Club',
    region: 'midwest', state: 'il', city: 'Chicago',
    division: '14U, 15U, 16U, 17U, 18U', gender: 'girls',
    tiers: ['National', 'American'], governing_body: 'USAV',
    details: 'Placeholder listing to verify layout — not a real club.',
    website: 'https://example.com', verified: true, claimed: false, featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2, type: 'training', club: 'Example Training Academy', title: 'Example Training Academy',
    region: 'south', state: 'tx', city: 'Austin',
    division: '11U, 12U, 13U, 14U', gender: 'coed', tiers: ['Open'], governing_body: 'JVA',
    details: 'Placeholder listing to verify layout — not a real academy.',
    verified: false, claimed: true,
    created_at: new Date().toISOString(),
  },
]

export default function DemoListings() {
  const [selected, setSelected] = useState<Listing | null>(null)
  return (
    <div className="wrap" style={{ padding: '60px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '24px' }}>Component preview (demo data)</h1>
      {DEMO_LISTINGS.map(l => <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} />)}
      {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
