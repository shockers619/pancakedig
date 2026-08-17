import { clubPath, formatDivisionRange, formatGender, orgChips } from '@/lib/constants'
import type { ClubRow } from '@/lib/clubs'
import { VerifiedBadge } from './VerifiedBadge'

// Crawlable list of clubs (real <a> links to each club's detail page). Used on
// the state + city index pages to build the internal link graph and give users
// a plain, fast list.
export function ClubIndexList({ clubs }: { clubs: ClubRow[] }) {
  return (
    <ul className="club-index">
      {clubs.map(c => {
        const orgs = orgChips(c as any)
        const meta = [
          [c.city, c.state?.toUpperCase()].filter(Boolean).join(', '),
          orgs.join(', '),
          c.division ? formatDivisionRange(c.division) : '',
          c.gender ? formatGender(c.gender) : '',
        ].filter(Boolean).join(' · ')
        return (
          <li key={c.id}>
            <a href={clubPath(c)} className="club-index-row">
              {c.logo_url && (
                <img src={c.logo_url} alt="" className={`club-index-logo logo-frame${c.logo_dark ? ' logo-frame-dark' : ''}`} />
              )}
              <span className="club-index-main">
                <span className="club-index-name">{c.club}{c.verified && <VerifiedBadge size={13} />}</span>
                <span className="club-index-meta">{meta}</span>
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
