# AssetLane Release Track

> Internal engineering checklist for v1.0 release readiness. For public documentation, see [README.md](README.md) and [BETA_LAUNCH.md](BETA_LAUNCH.md).

Update status as work lands.

## Pre-release polish (in progress)

### Admin dashboard redesign
- [x] Dedicated `admin.css` with compact 14px dashboard typography
- [x] Fixed sidebar + topbar layout (seller dashboard pattern)
- [x] Remove admin headings from storefront `clamp()` typography rules
- [x] Dashboard overview with stat row + order/product panels
- [x] Login + setup screens aligned to admin visual system
- [ ] Product editor layout pass
- [ ] Orders/purchases table polish
- [ ] Mobile sidebar refinement

### JS embed (replaces iframe)
- [x] `public/embed.js` widget script
- [x] Admin snippet copy UI in Settings → Distribution
- [x] Dynamic CORS for `embedAllowedOrigins`
- [x] Removed iframe embed route from app router
- [ ] Per-product embed copy on product editor

## Phase 1 — Release blockers

### Theme isolation (storefront only)
- [x] Move theme CSS from `body[data-theme]` to `.storefront-shell[data-theme]`
- [x] Add fixed admin surface styles (`body[data-surface='admin']`)
- [x] `StorefrontLayout` owns theme, brand colors, zip stylesheet, navbar, footer
- [x] Admin + login + setup routes use neutral admin shell (no storefront theme)

### First-boot setup wizard
- [x] `setupCompleted` setting + `GET /api/setup/status`
- [x] `POST /api/setup` (admin account + required store info + optional Stripe/SMTP)
- [x] Setup UI at `/setup` with redirect guard
- [x] Seed no longer creates default admin (setup wizard only)
- [x] Stripe/SMTP configurable from admin DB settings (env fallback)

### API security baseline
- [x] `helmet` security headers
- [x] Rate limits on login, setup, checkout, downloads
- [x] Fail startup in production without `JWT_SECRET`
- [x] Hardened auth cookies (httpOnly, secure in prod, sameSite lax)
- [x] Setup-only gate on protected API routes until install completes

## Phase 2 — Distribution modes

### Embeddable checkout (JS snippet)
- [x] `embed.js` hosted at `/embed.js`
- [x] `embedAllowedOrigins` admin setting + dynamic CORS
- [x] Checkout `successUrl` / `cancelUrl` override for embed
- [ ] Embed analytics / callback hooks (post-release)

### Headless API v1
- [x] `GET /api/v1/products` and `GET /api/v1/products/:slug`
- [x] `GET /api/v1/settings/public`
- [x] `POST /api/v1/checkout/sessions` with secret key auth
- [x] `storeMode`: full | headless | hybrid
- [x] API keys generated at setup / editable in admin

## Phase 3 — Install polish

- [x] `.env.example` trimmed to server-only secrets
- [ ] Docker compose healthcheck + setup note in README
- [x] README install docs updated for setup wizard flow

## Monetization (post-release, not coded here)

- [ ] Hosted cloud tier
- [ ] Pro license features
- [ ] Theme marketplace

---

## Progress log

| Date | Note |
|------|------|
| 2026-07-06 | Release track created |
| 2026-07-06 | Phase 1 + Phase 2 core implemented |
| 2026-07-06 | Admin dashboard redesign + JS embed snippet |
| 2026-07-06 | `npm run dev:reset` for local DB wipe + fresh setup |

## Quick reference

### Setup wizard
- First visit → `/setup`
- Required: admin email/password, store name, description
- Optional: Stripe, SMTP (can configure later in admin)

### Headless API
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`
- `GET /api/v1/settings/public`
- `GET /api/v1/theme` — active theme manifest + helper registry
- `GET /api/v1/contexts/home` — homepage context (same contract as React theme SDK)
- `GET /api/v1/contexts/product/:slug` — product page context
- `POST /api/v1/checkout/sessions` with header `X-Assetlane-Secret: <headlessSecretKey>`

### JS embed
```html
<script
  src="https://your-store.com/embed.js"
  data-store="https://your-store.com"
  data-product="your-product-slug"
  async
></script>
<div data-assetlane-product="your-product-slug"></div>
```

Add each external site origin to **Settings → Distribution → Embed allowed origins**.

### Store modes
- `hybrid` — storefront + API (default)
- `full` — storefront focused
- `headless` — hides main storefront routes; API/embed still available
