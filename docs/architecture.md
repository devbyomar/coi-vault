# COI Vault — Architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v4 (credentials-based, JWT sessions) |
| ORM | Prisma |
| Database | PostgreSQL (Neon/Supabase in production, Docker locally) |
| Payments | Stripe (Checkout + Billing Portal + Webhooks) |
| Email | Resend (transactional) |
| Hosting | Vercel |
| Cron | Vercel Cron Jobs |
| Testing | Vitest |
| CI/CD | GitHub Actions |

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│                  Vercel CDN                    │
│               (Static + Edge)                  │
├──────────────────────────────────────────────┤
│                                                │
│   Next.js App Router                           │
│   ├── Landing Page (SSG)                       │
│   ├── Auth Pages (Client)                      │
│   ├── Dashboard (Server Components)            │
│   ├── API Routes                               │
│   │   ├── /api/auth/* (NextAuth)               │
│   │   ├── /api/webhooks/stripe (Stripe)        │
│   │   └── /api/cron/reminders (Vercel Cron)    │
│   └── Server Actions                           │
│       ├── auth.ts                              │
│       ├── vendors.ts                           │
│       ├── documents.ts                         │
│       └── billing.ts                           │
│                                                │
├──────────────────────────────────────────────┤
│                                                │
│   Prisma ORM ←→ PostgreSQL (Neon)              │
│                                                │
├──────────────────────────────────────────────┤
│                                                │
│   External Services                            │
│   ├── Stripe (subscriptions)                   │
│   └── Resend (email)                           │
│                                                │
└──────────────────────────────────────────────┘
```

## Multi-Tenancy Model

- All data is scoped by `orgId` (Organization ID)
- Users belong to Organizations via Membership
- Membership has roles: OWNER, ADMIN, MEMBER
- Every database query filters by `orgId`
- Server actions validate org membership before any operation

## Data Model

```
User ─── Membership ─── Organization
                              │
                              ├── Subscription
                              ├── Vendor ─── VendorDocument
                              └── AuditLog
```

## Key Design Decisions

1. **Server Components for data fetching** — Dashboard pages are server components that fetch data directly, no client-side fetching needed
2. **Server Actions for mutations** — All writes go through server actions with validation and auth checks
3. **Soft deletes** — Users, organizations, vendors, and documents use `deletedAt` for soft deletion
4. **JWT sessions** — No session table needed, keeps DB queries minimal
5. **Plan enforcement at action level** — Every create action checks plan limits before proceeding

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (auth, webhooks, cron)
│   ├── auth/               # Auth pages (signin, signup)
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── vendors/        # Vendor list + detail pages
│   │   └── settings/       # Settings + billing
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── dashboard-nav.tsx   # Dashboard navigation
│   ├── expiry-badge.tsx    # Expiry status indicator
│   └── providers.tsx       # Session provider wrapper
├── lib/                    # Shared utilities
│   ├── prisma.ts           # Prisma client singleton
│   ├── stripe.ts           # Stripe client
│   ├── auth-utils.ts       # Auth helper functions
│   ├── plans.ts            # Plan limits + display info
│   ├── validations.ts      # Zod schemas
│   ├── email.ts            # Email sending
│   ├── audit.ts            # Audit log helper
│   └── rate-limit.ts       # In-memory rate limiter
├── server/
│   └── actions/            # Server actions
│       ├── auth.ts         # Signup
│       ├── vendors.ts      # Vendor CRUD
│       ├── documents.ts    # Document CRUD
│       └── billing.ts      # Stripe checkout + billing
├── styles/
│   └── globals.css         # Global styles
└── types/
    └── next-auth.d.ts      # NextAuth type augmentation
```
