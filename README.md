# DistributeOS — Sales Manager Panel

A full-stack **Sales Manager panel** for a multi-tenant FMCG distribution SaaS platform, built for the Pakistani market. Sales Managers use this to supervise their team of Order Bookers — managing territory visibility, monthly targets, weekly routes, credit holds, promotional schemes, new outlet approvals, and team broadcasts, all from one desktop dashboard.

**Live demo:** [sales-manager-portal-ly4d.vercel.app](https://sales-manager-portal-ly4d.vercel.app/sales)

## What it does

| Screen | What it's for |
|---|---|
| Territory Dashboard | Live map + KPIs of today's booker activity — who's on route, who hasn't checked in, orders placed so far |
| Booker Targets | Set monthly PKR targets per booker, track achievement % with a run-rate-aware status (exceeding/on-track/watch/behind) |
| PJP Route Builder | Assign each booker's weekly visiting schedule per shop, per day |
| Credit Hold Management | Place/release credit holds on shops, with automatic WhatsApp notification to the shop and the booker |
| Scheme Management | Create promotional schemes (Buy-X-Get-Y, volume slabs, fixed price, combos, happy hours) with a **stack-detection engine** that resolves which scheme(s) apply when multiple match the same order |
| New Outlet Approval | Review and approve/reject shops submitted by field bookers, setting their initial credit limit |
| Broadcast Messaging | Send announcements to all or specific bookers, tracked per-recipient via WhatsApp |

## Tech stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Route Handlers, Prisma 6 ORM, PostgreSQL (Supabase)
- **Auth:** Supabase Auth (JWT-based, custom claims for multi-tenant role scoping)
- **Async jobs:** BullMQ + Redis — WhatsApp delivery, daily beat-list generation, scheme auto-expiry, broadcast fan-out all run as background workers, never inline in a request
- **Messaging:** Twilio WhatsApp Business API (approved templates only)
- **Deployment:** Vercel

## Architecture notes

- **Multi-tenant by design** — every query is scoped by `tenantId`, enforced server-side from the JWT, never trusted from client input
- **Soft-delete everywhere** — no hard deletes on business records (targets, schemes, credit holds); history is preserved for reporting
- **Money as integers** — all PKR amounts stored as paisa (`Int`), never floats, to avoid rounding bugs
- **Slow work goes through queues** — WhatsApp sends and report generation are enqueued via BullMQ and processed by separate worker processes, keeping API responses fast

## Getting started

```bash
git clone https://github.com/<your-username>/sales-manager-portal.git
cd sales-manager-portal
npm install
cp .env.example .env   # fill in Supabase + database credentials
npx prisma generate
npx prisma db push
npm run dev
```

Built as part of an internship project. Not affiliated with any real FMCG distributor — all data is fictional/demo.
