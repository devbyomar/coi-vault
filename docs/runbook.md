# COI Vault — Runbook

## Local Development Setup

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)
- Stripe CLI (for webhook testing)

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/devbyomar/coi-vault.git
cd coi-vault

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start local PostgreSQL
docker compose up -d

# 5. Update DATABASE_URL in .env
# DATABASE_URL="postgresql://coivault:coivault@localhost:5432/coivault"

# 6. Generate Prisma client
npx prisma generate

# 7. Push schema to database
npx prisma db push

# 8. Seed the database
npx prisma db seed

# 9. Start development server
npm run dev

# 10. Open http://localhost:3000
# Login: demo@coivault.com / demo1234
```

### Stripe Webhook Testing (Local)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret to .env as STRIPE_WEBHOOK_SECRET
```

### Stripe Product Setup

1. Go to Stripe Dashboard → Products
2. Create "Pro" product with $29/month recurring price
3. Create "Team" product with $79/month recurring price
4. Copy price IDs to `.env`:
   - `STRIPE_PRO_PRICE_ID=price_...`
   - `STRIPE_TEAM_PRICE_ID=price_...`

---

## Production Deployment (Vercel)

### First Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Set all environment variables from `.env.example`
4. Deploy

### Environment Variables (Production)

```
DATABASE_URL          → Neon/Supabase connection string
NEXTAUTH_SECRET       → openssl rand -base64 32
NEXTAUTH_URL          → https://your-domain.com
STRIPE_SECRET_KEY     → sk_live_...
STRIPE_PUBLISHABLE_KEY → pk_live_...
STRIPE_WEBHOOK_SECRET → whsec_... (from Stripe dashboard)
STRIPE_PRO_PRICE_ID   → price_...
STRIPE_TEAM_PRICE_ID  → price_...
RESEND_API_KEY        → re_...
EMAIL_FROM            → COI Vault <noreply@yourdomain.com>
CRON_SECRET           → openssl rand -base64 32
NEXT_PUBLIC_APP_URL   → https://your-domain.com
```

### Stripe Webhook Setup (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Database Setup

```bash
# Option A: Neon
# 1. Create project at neon.tech
# 2. Copy connection string to DATABASE_URL

# Option B: Supabase
# 1. Create project at supabase.com
# 2. Go to Settings → Database → Connection String
# 3. Copy to DATABASE_URL

# Run migrations in production
npx prisma db push
```

---

## Production Checklist

- [ ] All environment variables set
- [ ] `NEXTAUTH_SECRET` is a unique random value
- [ ] `DATABASE_URL` points to production database
- [ ] Stripe webhook endpoint configured
- [ ] Stripe products and prices created
- [ ] Domain configured with SSL
- [ ] Resend domain verified and API key set
- [ ] `CRON_SECRET` set for cron endpoint
- [ ] Vercel cron schedule confirmed in `vercel.json`
- [ ] Test signup/login flow
- [ ] Test Stripe checkout flow
- [ ] Test webhook handling
- [ ] Test email delivery
- [ ] Test cron reminder endpoint
- [ ] Review audit logs
- [ ] Monitor error rates

---

## Common Operations

### Reset database

```bash
npx prisma db push --force-reset
npx prisma db seed
```

### View database

```bash
npx prisma studio
```

### Run tests

```bash
npm test
```

### Check types

```bash
npx tsc --noEmit
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| "Module not found: @prisma/client" | Run `npx prisma generate` |
| Webhook returns 400 | Check `STRIPE_WEBHOOK_SECRET` matches |
| Auth redirect loop | Verify `NEXTAUTH_URL` matches your domain |
| Cron returns 401 | Verify `CRON_SECRET` in Vercel env vars |
| Email not sending | Check `RESEND_API_KEY` and domain verification |
