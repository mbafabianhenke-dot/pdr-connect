# PDR Connect

A B2B marketplace connecting PDR technicians, preparers, car painters, dismantlers, and customers across Europe.

Built with **Next.js 14**, **Supabase**, **Stripe**, and **Resend**. Supports 5 languages (EN, DE, PT, EL, ES).

## Quick Start

See [SETUP.md](SETUP.md) for the full setup guide including Supabase, Stripe, and Resend configuration.

```bash
npm install
cp .env.local.example .env.local
# fill in your credentials in .env.local
npm run dev
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + RLS)
- **Payments**: Stripe (subscriptions + customer portal)
- **Email**: Resend
- **Deployment**: Vercel
- **i18n**: next-i18next (EN, DE, PT, EL, ES)
