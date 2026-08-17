import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    // Allow everything crawlable; keep API + account-only surfaces out of the index.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/preview'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
