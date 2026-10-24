# API reference

All endpoints live in `frontend/app/api/**/route.ts` and run on the Node.js runtime.
They are active only when `DATA_SOURCE=postgres`; in mock mode they return
`503 {"error":{"code":"data_source_disabled"}}` (except `/api/health`).

**Conventions**
* JSON in, JSON out: `{ "data": ..., "error": null }` or `{ "data": null, "error": { "code", "message", "details?" } }`.
* Every state-changing request must send `Content-Type: application/json` and an `Origin` equal to the
  site origin (or listed in `APP_ORIGINS`); otherwise `415` / `403` (CSRF defence).
* Authentication: HttpOnly session cookie (`__Host-qrobo_session` in production) set by login/register.
* Responses are `Cache-Control: no-store`. SQL errors are mapped to safe codes:
  `409 conflict` (unique), `409 in_use` (foreign key), `400 invalid_value|missing_field`, `503 service_unavailable`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | – | Liveness + DB readiness |
| POST | `/api/auth/register` | – (rate-limited 5/h/IP) | Create customer account + session |
| POST | `/api/auth/login` | – (20/15 min/IP, 5/15 min/IP+email) | Start session |
| POST | `/api/auth/logout` | cookie | Delete session |
| GET | `/api/auth/me` | cookie (optional) | Current user/profile |
| POST | `/api/auth/password` | user (5/15 min) | Change password; body `{current_password, password}`; revokes all sessions |
| POST | `/api/auth/verify-email` | – (30/15 min/IP) | `{token}` from the email link; promotes `ADMIN_EMAILS` addresses |
| POST | `/api/auth/resend-verification` | user (3/h) | New verification link |
| POST | `/api/auth/forgot-password` | – (10/h/IP, 3/h/email) | `{email}`; identical response for unknown emails |
| POST | `/api/auth/reset-password` | – (30/15 min/IP) | `{token, password}`; revokes all sessions |
| GET / POST | `/api/admin/email` | admin | Delivery status (no bodies/secrets) / send a test email to yourself |

Email details: docs/email.md.
| POST | `/api/data` | depends on table policy | Data gateway used by the existing pages |
| POST | `/api/checkout` | user (10/min) | Create COD order from the server cart |
| POST | `/api/payments/razorpay/webhook` | HMAC signature | Verified payment events (inert until online payment exists) |

## GET /api/health
```json
200 {"status":"ok","dataSource":"postgres","database":"ok"}
200 {"status":"ok","dataSource":"mock","database":"disabled"}
503 {"status":"error","dataSource":"postgres","database":"not_configured" | "unavailable"}
```

## POST /api/auth/register
```http
POST /api/auth/register
Content-Type: application/json
Origin: https://<your-domain>

{"email":"asha@example.com","password":"at least 8 chars","full_name":"Asha"}
```
`201` + `Set-Cookie`:
```json
{"data":{"user":{"id":"<uuid>","email":"asha@example.com","user_metadata":{"full_name":"Asha"}},
         "profile":{"id":"<uuid>","full_name":"Asha","role":"customer","phone":null}},"error":null}
```
Any other field (e.g. `role`) is ignored. `400 weak_password` (8–72 bytes), `409 registration_failed`, `429 rate_limited`.

## POST /api/auth/login
Body `{"email","password"}` → `200` (same shape as register) + cookie, or
`401 {"error":{"code":"invalid_credentials","message":"Invalid email or password."}}` for both unknown
email and wrong password.

## POST /api/auth/logout · GET /api/auth/me · POST /api/auth/password
* logout → `200 {"data":{"signedOut":true}}`, cookie cleared, session row deleted.
* me → `200 {"data":{"user":{...},"profile":{...}}}` or `{"data":{"user":null,"profile":null}}`.
* password → body `{"password":"new passphrase"}`; `200 {"data":{"updated":true}}` with a fresh cookie.

## POST /api/data
Request (what `lib/api-client.ts` sends for `dataClient.from(...)` chains):
```json
{
  "table": "products",
  "op": "select",                       // select | insert | update | delete
  "select": "*, product:products(*)",   // columns and allowlisted relations
  "filters": [["eq","is_published",true],["gte","price",0],["in","brand_id",["<uuid>"]]],
  "or": "name.ilike.%arduino%,tags.cs.{arduino}",
  "order": [{"column":"price","ascending":true}],
  "offset": 0, "limit": 12,            // capped at 200 (1000 for admins)
  "count": "exact",                      // optional
  "single": "maybe",                     // optional: single | maybe
  "values": {...},                       // insert/update
  "returning": "id"                      // insert/update: columns to return
}
```
Response: `{"data": [...] | {...} | null, "error": null, "count": 42 | null}`.

Operators: `eq neq gt gte lt lte in like ilike`, plus `or` with `eq|like|ilike|cs`.
Updates/deletes require at least one `eq` filter. Unknown tables → `404`, unknown/hidden columns → `400`.

### Table policies (summary of `lib/server/gateway/policies.ts`)
| Table | Read | Write |
|---|---|---|
| categories, brands | public | admin |
| products | public (published only; `cost_price` hidden) | admin |
| banners, promo_cards, deals | public (active only) | admin |
| projects, tutorials | public (published only) | admin |
| project_components | public | admin |
| coupons | non-admin: lookup by `code` only, active only, internal columns hidden; admin: all | admin (not `used_count`) |
| reviews | public (approved only, no user ids) | admin: `is_approved`, delete |
| profiles | own row; admin: all | own `full_name`, `phone` only (never `role`) |
| orders (+ `order_items` relation) | own; admin: all | admin: `status` only. Creation via `/api/checkout` |
| order_items | own orders; admin: all | – |
| carts, cart_items, wishlists, addresses | own only (also for admins) | own only; `user_id` forced to the session user |
| users, sessions, inventory_transactions, payment_events | not exposed | not exposed |

Example — admin creates a category:
```json
{"table":"categories","op":"insert","values":{"name":"Drones","slug":"drones","icon_name":"Plane"},"returning":"id","single":"single"}
→ 200 {"data":{"id":"<uuid>"},"error":null,"count":null}
→ 403 {"data":null,"error":{"code":"forbidden","message":"Administrator access required."}}   (customer)
```

## POST /api/checkout
```json
{
  "idempotency_key": "<uuid v4, one per checkout attempt>",
  "delivery_method": "standard" | "express",
  "payment_method": "cod",
  "coupon_code": "WELCOME10",            // optional
  "shipping_address": {"fullName":"Asha","phone":"9876543210","addressLine1":"1 MG Road","addressLine2":"",
                       "city":"Bengaluru","state":"KA","postalCode":"560001","country":"India"}
}
```
* Items, prices, stock, coupon and totals come from the database (the user's server cart).
* `201 {"data":{"orderId":"<uuid>","orderNumber":"QR-20261023-1A2B3C4D","total":2728,"replayed":false}}`
* Same key again → `200` with the same order (`"replayed": true`); stock is not decremented twice.
* `400 cart_empty | invalid_coupon | validation_error`, `409 insufficient_stock` (whole transaction rolled back),
  `401` signed out, `503 payment_unavailable` for `payment_method: "razorpay"`.
* Result: order `status: confirmed`, `payment_status: pending` (COD is never marked paid here).

## POST /api/payments/razorpay/webhook
Headers `X-Razorpay-Signature` (HMAC-SHA256 of the raw body with `RAZORPAY_WEBHOOK_SECRET`) and
`X-Razorpay-Event-Id`. `503` if no secret configured, `401` bad signature, `200 {"received":true}` otherwise.
Duplicate event ids are ignored. Only `payment.captured` for a known `razorpay_order_id` with an exactly
matching amount (paise) sets `payment_status = paid`.
