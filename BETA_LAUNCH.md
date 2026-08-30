# AssetLane Beta Launch Runbook

Production deployment guide for AssetLane (Miriyam Core).

| | |
|---|---|
| **Audience** | Operators deploying a beta instance |
| **Scope** | Single-tenant self-hosted install — one store per deployment |
| **Related docs** | [README.md](README.md) · [THEMES.md](THEMES.md) · [SECURITY.md](SECURITY.md) |

This document covers configuration, integration endpoints, and verification. It is not a feature overview.

---

## 1. Before you deploy

### Accounts and credentials

| Service | Required for | Obtain from |
|---------|--------------|-------------|
| Domain + TLS certificate | Production auth, Stripe webhooks, bKash callbacks | Your DNS / hosting provider |
| Stripe account | Card payments | [dashboard.stripe.com](https://dashboard.stripe.com) |
| bKash merchant account | Bangladesh mobile payments | bKash merchant onboarding (sandbox first) |
| SMTP provider | Buyer download emails after payment | SendGrid, Postmark, Gmail SMTP, etc. |

SMTP is not optional for a functioning beta. Payment can succeed without it, but buyers will not receive download links automatically.

### Host requirements

- Linux VPS or container host (2 GB RAM minimum recommended)
- HTTPS termination (reverse proxy: Caddy, Nginx, or cloud load balancer)
- Persistent disk for:
  - `apps/api/assetlane.db` (SQLite)
  - `storage/` (uploaded product files and theme packages)

### URLs you will need

Replace `yourdomain.com` with your actual domain throughout.

| Purpose | URL |
|---------|-----|
| Storefront | `https://yourdomain.com` |
| Admin | `https://yourdomain.com/admin` |
| API (public) | `https://api.yourdomain.com` or `https://yourdomain.com/api` (if proxied) |
| Health check | `https://api.yourdomain.com/health` |

`FRONTEND_URL` and the **Store URL** in admin settings must match the public storefront origin exactly (scheme + host, no trailing slash).

`API_PUBLIC_URL` must be the publicly reachable API origin — bKash redirects the buyer's browser through this host after payment.

---

## 2. Environment variables

Copy `.env.example` to `apps/api/.env` for local runs, or inject the same variables into your container / process manager.

### Required (production)

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | API refuses to start without `JWT_SECRET` when set |
| `JWT_SECRET` | 64+ char random string | `openssl rand -hex 32` |
| `DATABASE_URL` | `file:./assetlane.db` | Keep on persistent volume |
| `PORT` | `5001` | API listen port |
| `FRONTEND_URL` | `https://yourdomain.com` | CORS + email link base |
| `API_PUBLIC_URL` | `https://api.yourdomain.com` | bKash callback construction |

### Stripe (env fallback; admin settings override)

| Variable | Notes |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_…` or `sk_test_…` for beta |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint setup |

### bKash (env fallback; admin settings override)

| Variable | Notes |
|----------|-------|
| `BKASH_APP_KEY` | From bKash merchant portal |
| `BKASH_APP_SECRET` | Keep secret |
| `BKASH_USERNAME` | Merchant API username |
| `BKASH_PASSWORD` | Merchant API password |
| `BKASH_SANDBOX` | `true` until live credentials are approved |

### Frontend build (Docker / static hosting)

| Variable | When set | Notes |
|----------|----------|-------|
| `VITE_API_URL` | **At web build time** | Public API origin, e.g. `https://api.yourdomain.com`. If omitted, the web app calls `/api` on the same host (requires reverse-proxy routing). |

---

## 3. Integration endpoints

Configure these in external dashboards after the API is reachable over HTTPS.

### Stripe webhook

| Field | Value |
|-------|-------|
| Endpoint URL | `https://api.yourdomain.com/api/webhooks/stripe` |
| Events | `checkout.session.completed`, `checkout.session.expired`, `charge.refunded` |
| Signing secret | Paste into Admin → Settings → Payments → Stripe webhook secret |

Stripe cannot deliver webhooks to `localhost`. Use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook testing only.

### bKash callback

No manual registration is required in the bKash portal for Tokenized Checkout v1.2. AssetLane registers the callback URL per payment:

```text
https://api.yourdomain.com/api/checkout/bkash/callback
```

The server executes the payment on this callback before redirecting the buyer to the storefront success page. The callback URL must be publicly reachable over HTTPS.

### Buyer redirect URLs (automatic)

| Provider | Success | Cancel |
|----------|---------|--------|
| Stripe | `/success?session_id={CHECKOUT_SESSION_ID}` | `/cancel?product={slug}` |
| bKash | `/success?purchase_id={purchaseId}` | `/cancel?product={slug}` |

---

## 4. Deployment

### Option A — Docker Compose (recommended for beta)

1. Set variables in a `.env` file at the repo root (used by Compose):

```env
JWT_SECRET=<generate-a-strong-secret>
FRONTEND_URL=https://yourdomain.com
API_PUBLIC_URL=https://api.yourdomain.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BKASH_APP_KEY=...
BKASH_APP_SECRET=...
BKASH_USERNAME=...
BKASH_PASSWORD=...
BKASH_SANDBOX=true
```

2. Build and start:

```bash
docker compose up --build -d
```

3. Place a reverse proxy in front of the `web` (5173) and `api` (5001) services with TLS.

4. Confirm health:

```bash
curl -s https://api.yourdomain.com/health
# {"status":"ok"}
```

Volumes `storage/` and `apps/api/assetlane.db` must survive container restarts.

### Option B — Process manager (Node on VPS)

```bash
npm ci
npm run prisma:generate
npm run prisma:push
npm run build
```

Run the API (`apps/api`) and serve the web build (`apps/web/dist`) behind your reverse proxy. Set all environment variables on the API process.

---

## 5. First-boot configuration

1. Open `https://yourdomain.com/setup`.
2. Create the admin account and store profile.
3. In **Admin → Settings**, configure:

| Section | Action |
|---------|--------|
| **General** | Set store name, support email, store URL (`https://yourdomain.com`) |
| **Payments** | Payment providers (Stripe / bKash / both), enter credentials, disable bKash sandbox only when going live |
| **Email** | SMTP host, port, user, password, from address — send a test by completing a purchase |
| **Delivery** | Download expiry days and download limit |
| **Branding** | Logo, favicon, colors, homepage copy |

4. Create a product:
   - Status: **Published**
   - Upload the digital file (required for delivery)
   - For bKash: price currency must be **BDT**

---

## 6. Verification checklist

Complete every row before inviting beta merchants.

### Infrastructure

- [ ] `GET /health` returns `{"status":"ok"}` over HTTPS
- [ ] `/setup` is inaccessible after setup completes (redirects to `/admin`)
- [ ] `storage/` and `assetlane.db` are on persistent disk
- [ ] `JWT_SECRET` is set and not the default Compose fallback

### Stripe (test mode acceptable for beta)

- [ ] Checkout shows **Card (Stripe)** on a published product
- [ ] Test card `4242 4242 4242 4242` completes payment
- [ ] Stripe webhook shows `checkout.session.completed` delivered (200)
- [ ] Order appears in **Admin → Orders** with status **paid**
- [ ] Buyer receives email with download link
- [ ] Download link serves the file

### bKash (sandbox)

- [ ] Product currency is **BDT**
- [ ] Checkout shows **bKash** when credentials and provider mode allow it
- [ ] Sandbox payment completes and returns to `/success?purchase_id=…`
- [ ] Order status is **paid**; bKash TRX ID visible in order detail
- [ ] Buyer receives email with download link

### Email

- [ ] SMTP credentials saved in admin settings
- [ ] Download email arrives within one minute of payment
- [ ] Link in email uses the correct `FRONTEND_URL` / store URL
- [ ] Expiry date in email matches admin download settings

### Failure paths

- [ ] Abandoned checkout does not mark order as paid
- [ ] Expired download link returns a clear error
- [ ] Download limit enforced after configured number of downloads

---

## 7. Payment → delivery flow

Understanding this flow helps diagnose support tickets.

```text
Buyer pays
    │
    ├─ Stripe ──► webhook: checkout.session.completed
    │                  └─► finalizePaidPurchase()
    │
    └─ bKash ──► GET /api/checkout/bkash/callback
                       └─► execute payment server-side
                           └─► finalizePaidPurchase()

finalizePaidPurchase()
    ├─ Mark purchase paid
    ├─ Set download expiry
    └─ sendDownloadEmail()  ──► requires SMTP configured
            └─► link: {storeUrl}/download/{token}
                    └─► buyer downloads file (count + expiry enforced)
```

The success page confirms payment. The file is delivered via the emailed secure link, not inline on the success page.

If a buyer paid but did not receive email:

1. Check **Admin → Orders** — is the order **paid**?
2. Check API logs for `SMTP settings are incomplete`
3. Regenerate the download link from the order detail if needed

---

## 8. Beta limitations

Document these for beta participants so expectations are clear.

| Area | Beta behavior |
|------|---------------|
| Database | SQLite — suitable for low traffic; not multi-region |
| Admin | Single admin account per install |
| Email | SMTP only; no built-in email provider |
| Payments | Stripe + bKash; no PayPal or manual invoicing |
| Storefront | Theme zip packages + built-in themes; limited homepage section editor |
| Scaling | Single-node; no horizontal autoscaling guidance yet |

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Payment succeeds, order stays **pending** (Stripe) | Webhook not received or signature mismatch | Confirm webhook URL, secret, and HTTPS |
| bKash redirects but order not paid | Callback URL not reachable | Set `API_PUBLIC_URL` to public HTTPS API origin |
| bKash option missing on checkout | Currency not BDT or credentials incomplete | Set product to BDT; verify bKash fields in Payments settings |
| No buyer email | SMTP not configured | Fill Email settings; check API logs |
| Download link 403 | Expired or limit reached | Regenerate link in admin or extend expiry settings |
| Admin login fails after deploy | Wrong `JWT_SECRET` or cookie domain | Consistent secret across restarts; HTTPS required in production |
| Web app cannot reach API | `VITE_API_URL` wrong at build time | Rebuild web with correct API URL or proxy `/api` to the API service |

---

## 10. Backup (minimum for beta)

Before onboarding merchants with real products:

```bash
# Database
cp apps/api/assetlane.db backups/assetlane-$(date +%F).db

# Uploads and themes
tar -czf backups/storage-$(date +%F).tar.gz storage/
```

Schedule this daily on the host. Beta data loss is a support incident, not a code bug.

---

## 11. Handoff to beta merchants

Provide each beta participant:

1. Their storefront URL and admin login (created during setup on their instance, or yours if you host for them)
2. This runbook sections 5–9 (configuration + verification)
3. Support contact (`supportEmail` from their store settings)
4. Explicit note: **configure SMTP before taking real orders**

---

*AssetLane — built by Miriyam Core. Security reports: [SECURITY.md](SECURITY.md).*
