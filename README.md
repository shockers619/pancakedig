# Pancake Dig — National Grassroots Volleyball Directory

Same job as FloorBalance (find and verify real grassroots programs, let
directors claim free listings), deliberately separate brand, domain, and
visual identity. See `app/globals.css` top-of-file comments for the full
house-style rationale and design tokens.

## Status (as of this session)

**Built:**
- Homepage (`app/page.tsx`) — hero, search panel, "how it rotates" section
  (6 real rotation positions, not a decorative step sequence), region grid
- Core listing components, built to FloorBalance's *final* polished state,
  not its starting state: `ListingCard.tsx`, `ListingModal.tsx`,
  `VerifiedBadge.tsx`
- Full design token system + house-style conventions documented in
  `app/globals.css`, ported forward from every bug fixed on FloorBalance
  (logo breakpoint placement, float-vs-flex, icon-free detail format,
  division field format, claim+share row)
- `/preview` route with demo data to sanity-check the components render

**Not built yet — next real steps, in likely order:**
1. Domain registration + hosting (Vercel, same pattern as FloorBalance)
2. Supabase project — new instance or shared infra decision (unresolved
   from the original planning doc, still needs a deliberate call)
3. Auth, posting flow, claim flow, admin approval queue
4. Search/filter functionality (the homepage search panel is currently
   presentational only — no live filtering wired up)
5. Real seeding — using the same verify-against-the-org's-own-site
   discipline as FloorBalance, sourcing from JVA club directories, USAV's
   club finder, and AAU volleyball registries

## Local Development
```
npm install
npm run dev
```
Visit http://localhost:3000 for the homepage, http://localhost:3000/preview
for the listing component demo.

## Scope decision worth knowing
This targets **indoor club volleyball only**. Beach volleyball uses a
fundamentally different age-eligibility system (graduation-class based,
not age-based) via a different, overlapping set of governing bodies (AVP
America, BVCA, P1440). Folding it into this schema wasn't a deliberate
choice — it's just out of scope until someone decides how to reconcile
the two systems.
