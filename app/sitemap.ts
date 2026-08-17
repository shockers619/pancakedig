import type { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { clubPath, SITE_URL } from '@/lib/constants'

// Regenerated daily (ISR). Lists the homepage + every real club detail page, so
// Google/AI crawlers discover the SEO surface even before internal links exist.
// Only pages we actually render are emitted — no thin combinatorial URLs.
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
  ]
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return base
  try {
    const sb = createServerSupabaseClient()
    const rows: any[] = []
    for (let from = 0; ; from += 1000) {
      const { data } = await sb.from('listings')
        .select('id, club, title, state, created_at')
        .eq('status', 'approved').eq('type', 'club').not('state', 'is', null)
        .range(from, from + 999)
      if (!data || data.length === 0) break
      rows.push(...data)
      if (data.length < 1000) break
    }
    const clubs: MetadataRoute.Sitemap = rows
      .filter(r => r.state && (r.club || r.title))
      .map(r => ({
        url: SITE_URL + clubPath(r),
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: r.created_at ? new Date(r.created_at) : undefined,
      }))
    return [...base, ...clubs]
  } catch {
    return base
  }
}
