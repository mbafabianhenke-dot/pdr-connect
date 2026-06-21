-- German car businesses directory (Autohäuser + K+L Betriebe)
-- Used for nationwide cold outreach
create table if not exists de_businesses (
  id            uuid primary key default gen_random_uuid(),

  -- Identity
  business_name  text not null,
  business_type  text not null default 'autohaus',  -- 'autohaus' | 'kl_betrieb' | 'werkstatt'

  -- Address
  address        text,
  zip            text,
  city           text,
  bundesland     text,

  -- Contact
  phone          text,
  email          text,
  website        text,

  -- Source
  osm_id         text unique,   -- deduplication key

  -- Geo
  lat            numeric(9,6),
  lng            numeric(9,6),

  -- Outreach
  status         text default 'new',  -- 'new' | 'contacted' | 'replied' | 'converted' | 'not_interested'
  contacted_at   timestamptz,
  notes          text,

  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Indexes
create index if not exists de_businesses_zip_idx        on de_businesses(zip);
create index if not exists de_businesses_bundesland_idx on de_businesses(bundesland);
create index if not exists de_businesses_type_idx       on de_businesses(business_type);
create index if not exists de_businesses_status_idx     on de_businesses(status);

-- RLS: admin only
alter table de_businesses enable row level security;
drop policy if exists "admins_only" on de_businesses;
create policy "admins_only" on de_businesses
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );
