# PDR Connect — Setup Guide

## Prerequisites
- Node.js 20+
- Supabase account
- Stripe account
- Resend account
- Vercel account

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Supabase Setup

1. Create a new Supabase project at supabase.com
2. Go to **SQL Editor** and run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
3. Create Storage buckets (run in SQL Editor):
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
   INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
   INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);
   INSERT INTO storage.buckets (id, name, public) VALUES ('company-docs', 'company-docs', false);
   ```
4. In **Authentication → URL Configuration**:
   - Site URL: `https://pdrconnect.com`
   - Redirect URLs: `https://pdrconnect.com/api/auth/callback`
5. Copy your project URL and anon key from **Settings → API**

---

## 3. Stripe Setup

1. Create a product: **PDR Connect Premium** — €9.99/month recurring
2. Copy the **Price ID** (starts with `price_`)
3. Create a webhook endpoint pointing to: `https://pdrconnect.com/api/stripe/webhook`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. Copy the **Webhook Secret** (starts with `whsec_`)
5. Enable the **Customer Portal** in Stripe Dashboard → Billing

---

## 4. Resend Setup

1. Create account at resend.com
2. Add and verify your domain
3. Create an API key

---

## 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

---

## 6. First Admin User

After registration, manually set your user as admin in Supabase:
```sql
UPDATE public.users SET is_admin = true WHERE email = 'your@email.com';
```

---

## 7. Deploy to Vercel

```bash
npx vercel --prod
```

Add all environment variables in Vercel Dashboard → Project Settings → Environment Variables.

---

## Security Checklist

- [ ] Email/phone never exposed in any UI response (enforced by RLS)
- [ ] Chat filter active: phone regex + email regex + platform names
- [ ] Auto-block at bypass_count >= 5 (DB function)
- [ ] Admin-only routes protected in middleware + layout
- [ ] Stripe webhook signature verified
- [ ] Documents stored in private bucket (no public access)
- [ ] GDPR consent recorded with timestamp at registration

---

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (dashboard)/     # Dashboard, Profile, Search, Messages, Documents, Premium
│   ├── (admin)/         # Admin panel
│   ├── api/             # Stripe webhooks/checkout, Auth callback, Contract generation
│   ├── privacy/         # Privacy Policy
│   ├── terms/           # Terms of Service
│   └── legal/           # Legal Notice
├── components/
│   └── dashboard/       # Sidebar
├── lib/
│   ├── supabase/        # Server + client Supabase helpers
│   ├── stripe/          # Stripe client
│   ├── resend/          # Email templates
│   ├── pdf/             # Contract PDF generator (jsPDF)
│   └── chatFilter.ts    # Anti-bypass filter (security-critical)
├── types/               # TypeScript types + enums
└── i18n/                # Translations: EN, DE, PT, EL, ES
supabase/
└── migrations/          # Full DB schema + RPC functions
```
