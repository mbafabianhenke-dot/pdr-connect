-- 008: Offer / Request / Match system (admin-mediated matching)

-- Technician availability offers
CREATE TABLE IF NOT EXISTS public.offers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  available_from  DATE        NOT NULL,
  available_until DATE        NOT NULL,
  services        TEXT[]      DEFAULT '{}',
  countries       TEXT[]      DEFAULT '{}',
  daily_rate      TEXT,
  notes           TEXT,
  status          TEXT        NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','matched','contract','completed','withdrawn')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Workshop / customer job requests
CREATE TABLE IF NOT EXISTS public.job_requests (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_needed      TEXT        NOT NULL,
  location_city    TEXT        NOT NULL,
  location_country TEXT        NOT NULL,
  start_date       DATE,
  end_date         DATE,
  volume           TEXT,
  budget           TEXT,
  description      TEXT,
  urgency          TEXT        DEFAULT 'standard',
  status           TEXT        NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','reviewing','matched','contract','completed','cancelled')),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Admin-created matches
CREATE TABLE IF NOT EXISTS public.matches (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id       UUID        REFERENCES public.offers(id),
  job_request_id UUID        REFERENCES public.job_requests(id),
  tech_user_id   UUID        REFERENCES public.users(id),
  client_user_id UUID        REFERENCES public.users(id),
  admin_id       UUID        REFERENCES public.users(id),
  tech_rate      TEXT,
  client_fee     TEXT,
  location       TEXT,
  assignment     TEXT,
  notes          TEXT,
  status         TEXT        NOT NULL DEFAULT 'proposed'
                    CHECK (status IN ('proposed','tech_signed','client_signed','both_signed','in_progress','completed','cancelled')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS offers_user_idx       ON public.offers(user_id);
CREATE INDEX IF NOT EXISTS offers_status_idx     ON public.offers(status);
CREATE INDEX IF NOT EXISTS requests_user_idx     ON public.job_requests(user_id);
CREATE INDEX IF NOT EXISTS requests_status_idx   ON public.job_requests(status);
CREATE INDEX IF NOT EXISTS matches_status_idx    ON public.matches(status);
