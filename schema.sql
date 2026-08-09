-- ============================================================================
-- Pancake Dig — database schema
-- Run this ONCE in your new Supabase project: Dashboard → SQL Editor → paste →
-- Run. It creates the single `listings` table the whole site reads from, plus
-- the row-level-security rules that let the public site read approved listings
-- and let the posting form submit new (pending) ones.
--
-- Columns map 1:1 to the `Listing` type in lib/constants.ts. Volleyball uses
-- `division` (comma-separated "NU" tokens, e.g. "14U, 15U, 16U"), `tiers`, and
-- `governing_body` (JVA/USAV/AAU/Independent) where FloorBalance used `age`.
-- ============================================================================

create table if not exists listings (
  id             bigint generated always as identity primary key,
  type           text not null,          -- club | tryout | training | officiating | venue | opening | showcase
  club           text not null,
  title          text not null,
  region         text not null,          -- northeast | midatlantic | southeast | south | midwest | mountain | pacific
  state          text,                   -- two-letter, lowercase (e.g. 'il')
  city           text,
  venue          text,
  division       text,                   -- comma-separated tokens: "14U, 15U, 16U" — never a hyphen range
  gender         text,                   -- boys | girls | coed
  tiers          text[],                 -- e.g. {National, American}
  governing_body text,                   -- JVA | USAV | AAU | Independent
  details        text,
  email          text,
  phone          text,
  website        text,
  logo_url       text,
  verified       boolean not null default false,
  claimed        boolean not null default false,
  featured       boolean not null default false,
  status         text    not null default 'pending',   -- pending | approved | rejected
  user_id        uuid,                   -- set once auth/claim flow lands
  -- event-only fields (type = 'showcase'); evergreen listings leave these null
  event_subtype  text,                   -- Tournament | Camp | Showcase | League | Open Gym
  event_date     date,
  event_date_end date,
  expires_at     date,                   -- events auto-drop off the site after this date
  created_at     timestamptz not null default now()
);

-- Indexes for the filters the site queries on most.
create index if not exists listings_status_idx     on listings (status);
create index if not exists listings_region_idx     on listings (region);
create index if not exists listings_state_idx      on listings (state);
create index if not exists listings_type_idx       on listings (type);
create index if not exists listings_created_at_idx on listings (created_at desc);

-- ----------------------------------------------------------------------------
-- Row-Level Security
--   * Anyone (anon key) can READ approved listings — that's the public site.
--   * Anyone can INSERT a listing, but only as status='pending' — the posting
--     form. They can't publish themselves; you approve from the Supabase
--     dashboard (or the admin queue once it's built).
--   * No public UPDATE/DELETE. You manage rows with the service role in the
--     dashboard. Seeding real listings (below) also runs as service role, so it
--     bypasses these rules.
-- ----------------------------------------------------------------------------
alter table listings enable row level security;

create policy "public reads approved"
  on listings for select
  using (status = 'approved');

create policy "public inserts pending only"
  on listings for insert
  with check (status = 'pending');

-- ============================================================================
-- SEEDING REAL LISTINGS (Phase 3 — do this after the table exists)
-- Insert real, verified programs as approved rows, e.g.:
--
--   insert into listings
--     (type, club, title, region, state, city, division, gender, tiers,
--      governing_body, website, status, verified, claimed, featured)
--   values
--     ('club','Real Club Name','Real Club Name','midwest','il','Chicago',
--      '14U, 15U, 16U','girls','{National,American}','JVA',
--      'https://theirsite.com','approved',false,false,false);
--
-- Discipline (same as FloorBalance): every field verified against the org's
-- OWN website; leave a field NULL rather than guessing. Sources for volleyball:
-- JVA club directory, USAV club finder, AAU volleyball registries.
-- ============================================================================
