-- Contracts table: stores AGB & Datenschutz acceptances
create table if not exists public.contracts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  version     text not null,          -- 'agb' | 'privacy'
  signed      boolean not null default false,
  signed_at   timestamptz,
  language    text,
  pdf_url     text default '',
  created_at  timestamptz default now()
);

-- RLS
alter table public.contracts enable row level security;

-- Users can read their own contracts
create policy "users_own_contracts" on public.contracts
  for select using (auth.uid() = user_id);

-- Users can insert their own contracts
create policy "users_insert_contracts" on public.contracts
  for insert with check (auth.uid() = user_id);

-- Admins can read all contracts
create policy "admins_all_contracts" on public.contracts
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.is_admin = true
    )
  );
