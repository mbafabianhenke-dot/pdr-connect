-- Hail Lead Finder: stores auto dealerships & body shops found after hail events
create table if not exists hail_leads (
  id           uuid primary key default gen_random_uuid(),

  -- Hail event info
  hail_date    date not null,
  region       text not null,       -- e.g. "Landkreis München"
  city         text,                -- e.g. "München"
  state        text,                -- e.g. "Bayern"
  lat          numeric(9,6),
  lng          numeric(9,6),

  -- Business info
  business_name  text not null,
  business_type  text,             -- 'autohaus' | 'kl_betrieb' | 'werkstatt'
  address        text,
  zip            text,
  phone          text,
  email          text,
  website        text,
  osm_id         text,             -- OpenStreetMap ID for deduplication

  -- Outreach status
  status         text default 'new',  -- 'new' | 'contacted' | 'replied' | 'not_interested' | 'converted'
  contacted_at   timestamptz,
  notes          text,

  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Indexes for common queries
create index hail_leads_hail_date_idx on hail_leads(hail_date desc);
create index hail_leads_status_idx    on hail_leads(status);
create index hail_leads_region_idx    on hail_leads(region);
create unique index hail_leads_osm_dedup on hail_leads(osm_id, hail_date) where osm_id is not null;

-- RLS: only admins can access
alter table hail_leads enable row level security;

create policy "admins_only" on hail_leads
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );
