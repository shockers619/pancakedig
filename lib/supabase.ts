import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase client (used by client components, e.g. the posting
// form). Ported from FloorBalance unchanged.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
