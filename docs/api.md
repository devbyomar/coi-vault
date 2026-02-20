# COI Vault — API Reference

## Authentication

All dashboard routes require authentication via NextAuth JWT session.

API routes use different auth mechanisms as documented below.

---

## API Routes

### `POST /api/auth/[...nextauth]`

NextAuth handler. Supports:
- `POST /api/auth/callback/credentials` — Sign in
- `GET /api/auth/session` — Get current session
- `POST /api/auth/signout` — Sign out

---

### `POST /api/webhooks/stripe`

Stripe webhook endpoint. Handles:
- `checkout.session.completed` — Activate subscription after checkout
- `customer.subscription.updated` — Sync plan changes
- `customer.subscription.deleted` — Revert to FREE plan
- `invoice.payment_failed` — Mark subscription as PAST_DUE

**Authentication**: Stripe webhook signature (`stripe-signature` header)

**Request**: Raw body (not parsed JSON — required for signature verification)

**Response**:
```json
{ "received": true }
```

---

### `GET /api/cron/reminders`

Finds documents expiring within 7 days and emails organization owners.

**Authentication**: Bearer token via `Authorization` header
```
Authorization: Bearer <CRON_SECRET>
```

**Response**:
```json
{
  "success": true,
  "documentsExpiring": 5,
  "organizationsNotified": 2,
  "emailsSent": 2
}
```

---

## Server Actions

Server actions are called from client components and validated server-side.

### Auth

#### `signUp(input)`

Create a new user, organization, membership, and subscription.

**Input**:
```typescript
{
  name: string;          // 1-100 chars
  email: string;         // valid email
  password: string;      // 8-100 chars
  orgName: string;       // 1-200 chars
}
```

**Returns**: `{ success: true, userId: string }` or `{ error: string }`

---

### Vendors

#### `createVendor(input)`

**Input**:
```typescript
{
  name: string;          // required, 1-200 chars
  email?: string;        // optional, valid email
  phone?: string;        // optional, max 50 chars
  company?: string;      // optional, max 200 chars
  notes?: string;        // optional, max 1000 chars
}
```

**Plan limits enforced**: Checks vendor count against plan limit.

**Returns**: `{ success: true, vendorId: string }` or `{ error: string }`

#### `getVendors()`

Returns all vendors for the current organization with their documents.

#### `getVendor(vendorId)`

Returns a single vendor with documents, or null if not found.

#### `deleteVendor(vendorId)`

Soft-deletes a vendor. Creates audit log entry.

---

### Documents

#### `createDocument(input)`

**Input**:
```typescript
{
  title: string;         // required, 1-200 chars
  type: "COI" | "WSIB" | "OTHER";
  url: string;           // valid URL
  expiryDate: string;    // valid date string
  vendorId: string;      // must belong to org
}
```

**Plan limits enforced**: Checks document count against plan limit.

**Returns**: `{ success: true, documentId: string }` or `{ error: string }`

#### `deleteDocument(documentId)`

Soft-deletes a document. Creates audit log entry.

---

### Billing

#### `createCheckoutSession(plan)`

Creates a Stripe Checkout session and redirects to Stripe.

**Input**: `"PRO" | "TEAM"`

#### `createBillingPortalSession()`

Creates a Stripe Billing Portal session and redirects.

#### `deleteAccount()`

Soft-deletes the user and organization. Owner only.
