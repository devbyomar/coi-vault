# COI Vault — Security

## Overview

COI Vault is a document tracking and workflow tool. It does **not** provide insurance, legal, or compliance advice. This document outlines the security practices implemented in the application.

## Authentication

- **Password hashing**: bcryptjs with 12 salt rounds
- **Session management**: JWT-based sessions via NextAuth
- **Session expiry**: 30-day max age
- **Protected routes**: Middleware redirects unauthenticated users
- **Credential validation**: Zod schema validation on all auth inputs

## Authorization

- **Multi-tenant isolation**: All data queries filter by `orgId`
- **Role-based access**: OWNER, ADMIN, MEMBER roles on memberships
- **Server-side checks**: Every server action validates session + org membership
- **No client-side trust**: All authorization decisions happen server-side

## Input Validation (OWASP A03:2021)

- All server inputs validated with Zod schemas
- Email normalization (lowercase)
- String length limits on all fields
- URL validation on document links
- Date validation on expiry dates

## API Security

- **Rate limiting**: In-memory rate limiter on API routes (30 req/min per key)
- **Webhook verification**: Stripe webhook signature verification
- **Cron security**: Bearer token authentication on cron endpoints
- **CSRF protection**: NextAuth built-in CSRF tokens

## Data Protection

- **Soft deletes**: Data is soft-deleted, not permanently removed (for audit trail)
- **No PII in logs**: Application logs do not contain passwords or tokens
- **Environment variables**: All secrets stored in environment variables
- **No secrets in repo**: `.env` is gitignored, `.env.example` contains only placeholder values

## Infrastructure Security

- **HTTPS only**: Enforced by Vercel
- **Secure headers**: Next.js default security headers
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (via Vercel)
- **Database**: Connection via SSL in production (Neon/Supabase)

## Stripe Integration

- **Server-side only**: Stripe secret key never exposed to client
- **Webhook verification**: `stripe.webhooks.constructEvent()` validates signatures
- **Checkout Sessions**: Server-created, redirect-based flow
- **No card data**: COI Vault never sees card numbers (Stripe Checkout handles PCI)

## OWASP Top 10 Considerations

| Risk | Mitigation |
|------|-----------|
| A01 Broken Access Control | Server-side org membership checks on every action |
| A02 Cryptographic Failures | bcrypt hashing, HTTPS only, no secrets in code |
| A03 Injection | Prisma ORM (parameterized queries), Zod validation |
| A04 Insecure Design | Multi-tenant isolation, principle of least privilege |
| A05 Security Misconfiguration | Environment variables, secure defaults |
| A06 Vulnerable Components | Regular `npm audit`, dependabot |
| A07 Auth Failures | bcrypt, rate limiting, JWT sessions |
| A08 Data Integrity | Stripe webhook signature verification |
| A09 Logging Failures | Audit log system for all critical actions |
| A10 SSRF | No user-controlled server-side requests |

## Incident Response

1. Rotate all secrets (NEXTAUTH_SECRET, STRIPE keys, CRON_SECRET)
2. Check audit logs for suspicious activity
3. Review Stripe dashboard for unauthorized transactions
4. Reset affected user passwords
5. Notify affected organizations

## Future Improvements

- [ ] Add email verification flow
- [ ] Implement 2FA (TOTP)
- [ ] Add IP-based rate limiting (Redis)
- [ ] Set up Sentry for error tracking
- [ ] Add Content Security Policy headers
- [ ] Implement session revocation
