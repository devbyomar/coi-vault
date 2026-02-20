# COI Vault

**Track vendor certificates of insurance, expirations, and compliance in one place — with reminders and audit logs.**

Built for property managers, condo boards, and small general contractors.

> ⚠️ **Disclaimer**: COI Vault is a document tracking and workflow tool. It does not provide insurance, legal, or compliance advice.

---

## Features

- **Vendor Management** — Create, view, and soft-delete vendors
- **Document Tracking** — Store COIs, WSIB certs, and other documents with expiry dates
- **Expiry Alerts** — Visual indicators for documents expiring in 7/14/30 days
- **Automated Reminders** — Daily email reminders for documents expiring within 7 days
- **Audit Logs** — Full trail of vendor, document, and subscription changes
- **Multi-Tenant** — Organization-based with OWNER/ADMIN/MEMBER roles
- **Stripe Billing** — Free, Pro ($29/mo), and Team ($79/mo) plans
- **Plan Enforcement** — Hard limits on vendors, documents, and seats per plan

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **NextAuth** (credentials-based)
- **Prisma** + PostgreSQL
- **Stripe** (Checkout + Billing Portal + Webhooks)
- **Resend** (transactional email)
- **Vercel** (hosting + cron)
- **Vitest** (testing)

## Quick Start

```bash
# Clone
git clone https://github.com/devbyomar/coi-vault.git
cd coi-vault

# Install
npm install

# Environment
cp .env.example .env
# Edit .env with your values

# Database (local)
docker compose up -d
npx prisma generate
npx prisma db push
npx prisma db seed

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo login**: `demo@coivault.com` / `demo1234`

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
npm test          # Run tests
```

## Documentation

- [Product Definition](docs/product.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Runbook](docs/runbook.md)
- [Security](docs/security.md)

## Pricing

| | Free | Pro | Team |
|---|---|---|---|
| Price | $0/mo | $29/mo | $79/mo |
| Vendors | 5 | Unlimited | Unlimited |
| Documents | 10 | Unlimited | Unlimited |
| Seats | 1 | 1 | 10 |
| Reminders | ✓ | ✓ | ✓ |
| Audit Logs | ✓ | ✓ | ✓ |

## License

Private — All rights reserved.
