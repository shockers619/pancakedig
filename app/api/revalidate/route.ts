import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

// On-demand cache bust for the listing reads. Called after an admin approves/
// rejects/deletes/claims a listing, or an owner edits/deletes theirs — so the
// public site reflects the change immediately instead of waiting out the 30-min
// ISR window. Only busts the cache tag; the next request re-queries once.
export async function POST() {
  revalidateTag('listings')
  return NextResponse.json({ revalidated: true })
}
