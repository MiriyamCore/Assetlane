# AssetLane Feature Track

Living log of product improvements, fixes, and planned work. Update when shipping changes.

**Product:** AssetLane · **Company:** Miriyam Core

---

## Shipped (2026-09-01)

| ID | Type | Summary |
|----|------|---------|
| F-024 | Feature | **Team roles** — owner/admin/viewer accounts with team management in Settings → Team |
| F-025 | UX | **Per-section settings save** — save only the active settings section |
| F-026 | UX | **Theme uninstall dialog** — confirmation modal with active-theme warning |
| F-027 | Feature | **Embed analytics hooks** — `assetlane:*` events and `AssetLaneEmbed.on()` callbacks |
| F-023 | Feature | **Product attributes** — merchant-defined label/value specs on product pages (product editor → storefront) |
| F-022 | Feature | **Discount codes** — percent or fixed amount off at checkout; admin CRUD |
| F-021 | Feature | **Free products** — price `0` skips payment and delivers immediately |
| F-020 | Feature | **Multiple files per product** — primary + additional downloadable files |
| F-019 | Feature | **Customer library** — magic-link purchase library at `/library` |
| F-018 | Feature | **Admin refunds** — refund paid orders (Stripe auto-refund; bKash/free marked refunded) |
| F-017 | Feature | **Outbound webhooks** — `order.paid` and `order.refunded` with HMAC signatures |
| F-016 | Feature | **PostgreSQL database option** for production — dual SQLite/Postgres with migrations |
| F-015 | Feature | **Typography settings** — body and heading font presets from Settings → Branding |
| F-014 | UX | **Product editor** mobile layout — scrollable steps, stacked footer actions, single-column fields |
| F-009 | Feature | **Hero cover image** upload from Settings → Branding |
| F-010 | Feature | **FAQ** and **trust blocks** on storefront (Settings → Content) |
| F-011 | UX | **Orders table** — date column, provider/status badges, CSV export |
| F-012 | Test | Automated tests for checkout receipt → paid download URL |
| F-013 | Ops | `npm audit` remediation |
| F-001 | Feature | Admin **Send test email** — verify SMTP from Settings → Email |
| F-002 | Feature | **Checkout receipt** API — success page shows download link when payment is confirmed |
| F-003 | Feature | **Resend download email** from order detail in admin |
| F-004 | Feature | **Order search** by customer email in admin |
| F-005 | Feature | **Per-product embed snippet** on product editor (edit mode) |
| F-006 | Feature | **bKash credentials** on setup wizard integrations step |
| F-007 | UX | **Admin dashboard** onboarding empty state when store has no products |
| F-008 | Fix | Success page polls receipt until Stripe webhook marks order paid |

---

## In progress

_None._

---

## Planned — high priority

_None._

---

## Planned — medium priority

_None._

---

## Planned — later

| ID | Type | Summary |
|----|------|---------|
| L-001 | Feature | Subscription / recurring products |
| L-002 | Feature | Built-in email provider (Resend, Postmark) |
| L-003 | Feature | PayPal checkout |
| L-004 | Platform | Theme marketplace |
| L-005 | i18n | Multi-language admin and storefront |

---

## How to use this file

1. Add a row under **Planned** when scoping work.
2. Move to **In progress** when starting.
3. Move to **Shipped** with date when merged.
4. Link PR or commit in the summary when useful.
5. Update [README.md](README.md) **Capabilities** when the feature is merchant-visible.
