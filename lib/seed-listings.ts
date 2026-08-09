import { Listing } from './constants'

// Sample listings shown ONLY while the directory is empty (before real
// listings are seeded into Supabase, or if the DB is briefly unreachable).
// Every one is clearly marked "SAMPLE LISTING" so it can never be mistaken
// for a real, verified program. The homepage swaps these out automatically
// the moment real approved rows exist. Same pattern as FloorBalance.
export const SEED_LISTINGS: Listing[] = [
  {
    id: 1, type: 'club', club: 'Rally Point Volleyball Club', title: 'Rally Point Volleyball Club',
    region: 'midwest', state: 'il', city: 'Naperville',
    division: '13U, 14U, 15U, 16U, 17U, 18U', gender: 'girls',
    tiers: ['National', 'American'], governing_body: 'JVA',
    details: '⚠️ SAMPLE LISTING — This is an example of how a club profile appears on Pancake Dig. Post your own free listing at pancakedig.com.\n\nGirls club program with National and American teams competing in JVA tournaments.',
    verified: false, claimed: false, featured: true, created_at: '2026-07-28T14:00:00Z',
  },
  {
    id: 2, type: 'tryout', club: 'Coastal Surge VBC', title: '15U-17U Girls Tryouts — Winter Club Season',
    region: 'southeast', state: 'fl', city: 'Sarasota',
    division: '15U, 16U, 17U', gender: 'girls', governing_body: 'USAV',
    details: '⚠️ SAMPLE LISTING — This is an example of how a tryout listing appears on Pancake Dig. Post your own free listing at pancakedig.com.\n\nOpen tryouts for the winter club season. Bring knee pads and court shoes.',
    verified: false, claimed: false, featured: true, created_at: '2026-07-27T11:00:00Z',
  },
  {
    id: 3, type: 'venue', club: 'The Net Center', title: 'The Net Center',
    region: 'south', state: 'tx', city: 'Plano',
    division: '10U, 11U, 12U, 13U, 14U, 15U, 16U, 17U, 18U', gender: 'coed',
    details: '⚠️ SAMPLE LISTING — This is an example of how a venue listing appears on Pancake Dig. Post your own free listing at pancakedig.com.\n\n8-court indoor facility available for club practices, tournaments, and open play.',
    verified: false, claimed: false, featured: false, created_at: '2026-07-26T09:00:00Z',
  },
  {
    id: 4, type: 'training', club: 'Front Row Skills — Coach Mia Alvarez', title: 'Front Row Skills — Coach Mia Alvarez',
    region: 'pacific', state: 'ca', city: 'San Diego',
    division: '12U, 13U, 14U, 15U, 16U', gender: 'coed', governing_body: 'Independent',
    details: '⚠️ SAMPLE LISTING — This is an example of how a training listing appears on Pancake Dig. Post your own free listing at pancakedig.com.\n\nPrivate and small-group setting, passing, and serve training. Boys and girls, 12U-16U.',
    verified: false, claimed: false, featured: false, created_at: '2026-07-25T09:00:00Z',
  },
]
