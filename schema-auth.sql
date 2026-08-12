-- ============================================================================
-- Pancake Dig — AUTH / DASHBOARD / ADMIN / CLAIM layer
-- Adds row-level-security policies for logged-in users (Supabase Auth,
-- email/password) plus the claim_requests table. ADDITIVE ONLY — it never drops
-- the existing "public reads approved" / "public inserts pending" policies, so
-- the live read-only site keeps working throughout.
--
-- Admin = kirbyrectify@gmail.com (matches ADMIN_EMAIL in the app). That account
-- gets full read/write; everyone else can only touch rows they own (user_id).
-- ============================================================================

-- ---- claim_requests -------------------------------------------------------
create table if not exists claim_requests (
  id                 bigint generated always as identity primary key,
  listing_id         bigint not null references listings(id) on delete cascade,
  requester_user_id  uuid not null,
  requester_email    text,
  requester_name     text,
  requester_message  text,
  status             text not null default 'pending',  -- pending | approved | rejected
  created_at         timestamptz not null default now()
);
create index if not exists claim_requests_listing_idx on claim_requests (listing_id);
create index if not exists claim_requests_status_idx  on claim_requests (status);

alter table claim_requests enable row level security;

do $$ begin
  -- a signed-in user can file a claim as themselves, and read their own claims
  if not exists (select 1 from pg_policies where tablename='claim_requests' and policyname='user inserts own claim') then
    create policy "user inserts own claim" on claim_requests for insert to authenticated
      with check (auth.uid() = requester_user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='claim_requests' and policyname='user reads own claims') then
    create policy "user reads own claims" on claim_requests for select to authenticated
      using (auth.uid() = requester_user_id);
  end if;
  -- admin reads + resolves every claim
  if not exists (select 1 from pg_policies where tablename='claim_requests' and policyname='admin reads all claims') then
    create policy "admin reads all claims" on claim_requests for select to authenticated
      using (auth.jwt()->>'email' = 'kirbyrectify@gmail.com');
  end if;
  if not exists (select 1 from pg_policies where tablename='claim_requests' and policyname='admin updates claims') then
    create policy "admin updates claims" on claim_requests for update to authenticated
      using (auth.jwt()->>'email' = 'kirbyrectify@gmail.com');
  end if;
end $$;

-- ---- listings: owner + admin policies (additive) --------------------------
do $$ begin
  -- owner can see their own rows even before approval
  if not exists (select 1 from pg_policies where tablename='listings' and policyname='owner reads own listings') then
    create policy "owner reads own listings" on listings for select to authenticated
      using (auth.uid() = user_id);
  end if;
  -- admin sees everything (pending queue, rejected, etc.)
  if not exists (select 1 from pg_policies where tablename='listings' and policyname='admin reads all listings') then
    create policy "admin reads all listings" on listings for select to authenticated
      using (auth.jwt()->>'email' = 'kirbyrectify@gmail.com');
  end if;
  -- a signed-in user can post a listing they own; admin may post already-approved
  if not exists (select 1 from pg_policies where tablename='listings' and policyname='auth inserts own listing') then
    create policy "auth inserts own listing" on listings for insert to authenticated
      with check (
        (user_id = auth.uid() and status = 'pending')
        or auth.jwt()->>'email' = 'kirbyrectify@gmail.com'
      );
  end if;
  -- owner edits / removes their own listing
  if not exists (select 1 from pg_policies where tablename='listings' and policyname='owner updates own listing') then
    create policy "owner updates own listing" on listings for update to authenticated
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='listings' and policyname='owner deletes own listing') then
    create policy "owner deletes own listing" on listings for delete to authenticated
      using (auth.uid() = user_id);
  end if;
  -- admin edits / removes / approves anything
  if not exists (select 1 from pg_policies where tablename='listings' and policyname='admin updates any listing') then
    create policy "admin updates any listing" on listings for update to authenticated
      using (auth.jwt()->>'email' = 'kirbyrectify@gmail.com') with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='listings' and policyname='admin deletes any listing') then
    create policy "admin deletes any listing" on listings for delete to authenticated
      using (auth.jwt()->>'email' = 'kirbyrectify@gmail.com');
  end if;
end $$;
