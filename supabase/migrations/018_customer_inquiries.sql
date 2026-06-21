-- Customer inquiries sent to admin via "Find Pros" shortlist
create table if not exists customer_inquiries (
  id                uuid primary key default gen_random_uuid(),

  -- Customer
  customer_id       uuid references users(id) on delete set null,
  customer_name     text,
  customer_email    text,
  customer_company  text,
  customer_phone    text,

  -- Inquiry details
  message           text not null,
  location          text,
  start_date        date,
  budget            text,

  -- Selected technicians (stored as JSON array)
  selected_technicians jsonb default '[]',

  -- Status
  status            text default 'new',  -- 'new' | 'in_progress' | 'matched' | 'closed'
  admin_notes       text,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists ci_customer_idx  on customer_inquiries(customer_id);
create index if not exists ci_status_idx    on customer_inquiries(status);
create index if not exists ci_created_idx   on customer_inquiries(created_at desc);

alter table customer_inquiries enable row level security;

-- Customers can see their own inquiries
create policy "customers_own" on customer_inquiries
  for select using (customer_id = auth.uid());

-- Admins can do everything
create policy "admins_all" on customer_inquiries
  for all using (
    exists (select 1 from users where users.id = auth.uid() and users.is_admin = true)
  );
