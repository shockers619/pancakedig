import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client. Ported from FloorBalance, including the egress
// fix below — do not simplify it away.
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Cache READ (GET) requests so each page's ISR (`export const revalidate`)
        // takes effect — repeat crawler/user hits serve from cache instead of
        // re-querying Supabase every time (this is what was blowing the egress
        // quota on FloorBalance). Writes (POST/PATCH/DELETE) are never cached.
        fetch: (url, opts) => {
          const method = (opts?.method || 'GET').toUpperCase()
          // supabase-js sends an Authorization header, which Next 14 auto-opts
          // OUT of the Data Cache — so we must EXPLICITLY opt reads back in with
          // next.revalidate, or every page stays dynamic and re-queries the DB.
          return method === 'GET'
            ? fetch(url, { ...opts, next: { revalidate: 1800 } }) // cache reads 30 min
            : fetch(url, { ...opts, cache: 'no-store' })          // writes stay fresh
        },
      },
    }
  )
}
