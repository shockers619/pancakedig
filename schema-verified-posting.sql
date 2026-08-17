-- ============================================================================
-- Pancake Dig — VERIFIED SELF-SERVE POSTING (2026-08-17)
-- A "verified" user = someone who owns >=1 listing with verified=true (i.e. has
-- had a claim approved, like Patrick @ Wisconsin Elite). Such a user may
-- self-PUBLISH new listings (status='approved') with NO admin review, capped at
-- 5 owned listings total. Everyone else still posts 'pending' for the queue.
--
-- Enforced in the DB, not just the browser, so the cap/auto-approve can't be
-- bypassed by a hand-crafted insert. Two SECURITY DEFINER helpers do the
-- count/verified checks bypassing RLS, which avoids "infinite recursion in
-- policy" (a policy on `listings` can't freely re-query `listings`).
-- ADDITIVE / idempotent — safe to re-run.
-- ============================================================================

create or replace function pd_owned_count(uid uuid)
  returns int language sql security definer stable set search_path = public as $$
    select count(*)::int from listings
     where user_id = uid and status in ('pending', 'approved')
$$;

create or replace function pd_is_verified(uid uuid)
  returns boolean language sql security definer stable set search_path = public as $$
    select exists (select 1 from listings where user_id = uid and verified = true)
$$;

-- Replace the old insert policy (which only ever allowed status='pending') with
-- the verified-aware version.
drop policy if exists "auth inserts own listing" on listings;
create policy "auth inserts own listing" on listings for insert to authenticated
  with check (
    auth.jwt()->>'email' = 'kirbyrectify@gmail.com'                 -- admin: unchanged
    or (
      user_id = auth.uid()                                          -- you may only insert rows you own
      and pd_owned_count(auth.uid()) < 5                            -- cap: 5 live/pending listings per user
      and (
        (status = 'pending'  and coalesce(verified, false) = false) -- unverified: pending, never self-badged
        or (status = 'approved' and pd_is_verified(auth.uid()))     -- verified: publish immediately
      )
    )
  );
