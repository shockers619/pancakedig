'use client'
import { useState } from 'react'
import { Listing } from '@/lib/constants'
import ListingCard from './ListingCard'
import ListingModal from './ListingModal'

// The homepage listings board. Reuses the already-built ListingCard/ListingModal
// components. `isSample` is true when the directory has no real rows yet and we're
// showing the SEED_LISTINGS placeholders — in that case we show a clear banner.
export default function LiveBoard({ listings, isSample }: { listings: Listing[]; isSample: boolean }) {
  const [selected, setSelected] = useState<Listing | null>(null)

  return (
    <section className="section" id="listings">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">On the board</div>
            <h2>{isSample ? 'Sample listings' : 'Latest listings'}</h2>
          </div>
          <p>
            {isSample
              ? 'These are examples of how listings appear. Real, verified programs are being added region by region.'
              : `${listings.length} program${listings.length === 1 ? '' : 's'} and counting — search above to filter.`}
          </p>
        </div>

        {listings.map(l => (
          <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} />
        ))}
      </div>

      {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
