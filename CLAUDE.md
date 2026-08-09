# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Hard rules (do not violate)

Ported from FloorBalance's blueprint — these caused real bugs there; don't rediscover them.

1. **Never fabricate listing data.** If a real value is unknown, leave it blank/NULL — never guess emails, logo URLs, divisions, websites, or any field. A blank field is always correct over an invented one. Verify every value against the org's *own* website.
2. **`venue` must never end in a state abbreviation.** Display code appends `state` separately, so storing `"Plano, TX"` renders as `"Plano, TX, TX"`. Store the town only (`"Plano"`).
3. **`division` = comma-separated `NU` tokens, never a hyphen range or free text** (search is substring-based; a range silently breaks filtering). Full detail in the conventions section below.
4. **`featured` stays `false` unless explicitly asked** — the featured set is a small curated cap, not a default.
5. **`claimed`:** set it explicitly on every seed INSERT. (PD's schema defaults it to `false`, which is safer than FloorBalance — whose column defaulted to `true` and silently marked seeds as claimed — but be explicit anyway.)
6. **No gender symbols (♂/♀) in listing meta** — use the text from `formatGender()`.
7. **There is ONE `ListingCard` + ONE `ListingModal`.** If a second detail/search view ever needs a modal (e.g. inside the search UI), reuse the shared component — do NOT copy it. FloorBalance ended up with two independent modals that silently drifted; every fix had to be applied twice.

## Programmatic SEO — the egress lesson (read before building landing pages)

FloorBalance's biggest operational failure: it generated ~250k thin combinatorial landing pages (city × county × zip × type). Crawlers hit them and blew the Supabase egress quota **15× (74GB vs the 5GB free cap)**, because each thin page re-queried the database uncached. The fix was serving `410 Gone` from `middleware.ts` *before* any page component ran.

When PD builds its SEO surface (Phase 4), do NOT repeat this:
- Generate landing pages only where there is real content — not a giant combinatorial grid of near-empty pages.
- Every bot-crawlable page's DB read must be cached (ISR via `export const revalidate`, or a shared `unstable_cache`'d `getListings()` helper). Never let crawlable pages each hit Supabase uncached.
- Never add `force-dynamic` / `cache: 'no-store'` to the homepage or any read path.

## Commands

```bash
npm install
npm run dev     # dev server at http://localhost:3000
npm run build   # production build
npm run start   # serve production build
npm run lint    # next lint
```

There is no test suite. Two routes to check work manually:
- `/` — full homepage
- `/preview` — renders `ListingCard` + `ListingModal` against `DEMO_LISTINGS` (hardcoded demo data in `app/preview/page.tsx`), the fastest way to eyeball listing-component changes.

Note: the actual project lives in this `pancakedig/` directory (the git repo root), not its parent `PD/`.

## What this is

Pancake Dig is a national directory for grassroots **indoor club** volleyball — search real programs, directors claim free listings. It is a deliberate sibling of another product, "FloorBalance": same job, intentionally separate brand/domain/visual identity. Much logic and many conventions are ported from FloorBalance rather than reinvented; comments throughout say so.

The backend engine (Supabase read path) is now ported from FloorBalance. Still presentational/not-yet-built: the homepage **search panel** (no live filtering), the **posting** write path, **auth**, **claim**, the **admin approval queue**, and **Stripe**. See `README.md` for the ordered plan.

## Backend / data layer

The whole site reads from one Supabase table, `listings` (schema in `schema.sql`; run it once in the Supabase SQL editor). Setup: copy `.env.local.example` to `.env.local` and fill `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Settings → API). `.env.local` is gitignored — never commit it or the service_role key.

- `lib/supabase.ts` — browser client (client components). `lib/supabase-server.ts` — server client. **Do not simplify the fetch wrapper in the server client**: it caches GET reads (30 min) so ISR works and egress stays low; this fix was learned the hard way on FloorBalance.
- `app/page.tsx` is an async server component with `export const revalidate = 1800`. `getListings()` pages past PostgREST's 1000-row cap with `.range()`, filters expired events client-side against today's date, and **falls back to `SEED_LISTINGS`** (`lib/seed-listings.ts`) when the DB is empty or `NEXT_PUBLIC_SUPABASE_URL` is unset — so the site is never blank and builds without env vars.
- `SEED_LISTINGS` are clearly-marked SAMPLE rows shown only until real approved rows exist; `LiveBoard` shows a "Sample listings" banner in that state. Real seeding = insert `status='approved'` rows (see `schema.sql` footer), verified against each org's own site.
- RLS: public can SELECT approved rows and INSERT pending ones; no public UPDATE/DELETE. Approve/manage rows via the Supabase dashboard (service role) until the admin queue is built.

This is a port of `~/Desktop/FB/floorbalance-next` (the "FloorBalance engine"). When building the next pieces (search, posting, auth, claim, notifications, SEO landing pages), read the FloorBalance equivalent first and adapt it rather than writing from scratch.

## Architecture

Next.js 14 App Router, TypeScript (`strict: false`), no CSS framework — all styling is hand-written in one global stylesheet. Import alias `@/*` maps to the repo root.

- `app/` — routes (`layout.tsx`, `page.tsx`, `preview/page.tsx`) and `globals.css`.
- `components/` — React components. Server components by default; the ones needing interactivity are marked `'use client'` (`SearchPanel`, `Dropdown`, `PostListingButton`, `PostListingModal`). `ListingCard`/`ListingModal` are server components taking a `Listing` prop.
- `lib/constants.ts` — the `Listing` type (the core data shape), US-state→region map, type labels, and the display formatters `formatDivisionRange` / `formatGender`.
- `lib/filterOptions.ts` — the option lists that drive the search UI (regions, types, divisions, levels, orgs, etc.) plus the `toggle` helper for multi-select state.

`globals.css` is the single source of truth for the visual system. Its top-of-file comment block defines the design tokens (CSS custom properties like `--court-navy`, `--volley-yellow`, `--ace-teal`) and the "net line" motif. **Read that comment block before touching any listing, logo, or modal UI** — it encodes hard-won layout rules (see below). Use the CSS variables; do not introduce raw hex colors or a second styling approach.

## Non-obvious conventions (from globals.css house style — do not rediscover these)

These are documented at length in the `globals.css` header and enforced across components. The important ones:

- **`division` is a comma-separated list of individual `NU` tokens** (e.g. `"14U, 15U, 16U"`), never a hyphen range and never free text like "All Ages". Filtering is substring-based, so a range silently breaks matching for every value but the endpoints. Displays are collapsed to a range only at render time via `formatDivisionRange`. Valid divisions run 10U–18U; 10U is the intentional floor.
- **Indoor only.** Beach volleyball uses a graduation-class age system, not age-based divisions — do not add beach listings under the same `division` field without a separate design decision first.
- **Listing detail views use only the 📍 location-pin emoji** — no other emoji icons in a detail box. Never let an icon split from its text across a line break; wrap the value (not the whole line) in `white-space: nowrap`.
- **Logo placement is breakpoint-driven**, rendered twice and toggled with `.logo-mobile-only` / `.logo-desktop-only` CSS classes rather than one flex row — a flex row's height matches its tallest child and silently creates dead space. Modal/detail logos use `float: right` (`.modal-logo`), not flex, for the same reason.
- Every listing logo `<img>` uses the shared `.logo-frame` class (off-white card) so inconsistent source backgrounds don't clash with the dark theme.
- Claim + Share controls render in the same row, never stacked.
- **`Dropdown` (from `components/Dropdown.tsx`) must stay defined at module scope** — never re-declare or inline a dropdown component inside a parent like `SearchPanel`. An inline definition is a new component identity on every render, so React unmounts and remounts every dropdown on each state change (losing focus/open state and thrashing the DOM).
