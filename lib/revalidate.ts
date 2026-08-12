// Fire-and-forget helper: bust the cached listing reads so admin approvals and
// owner edits/deletes appear on the public site right away, without waiting for
// the 30-min ISR window. Safe to call anywhere client-side; errors are ignored.
export function revalidateListings() {
  try {
    fetch('/api/revalidate', { method: 'POST' })
  } catch {
    /* non-critical: the ISR window will refresh it anyway */
  }
}
