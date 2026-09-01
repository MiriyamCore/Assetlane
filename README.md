# AssetLane

Digital commerce platform for selling downloadable products.

Built by **Miriyam Core**.

AssetLane gives merchants a storefront, admin dashboard, and API to publish digital products, accept payments, and deliver files through secure, expiring download links. Payments are supported via Stripe (cards) and bKash (Bangladesh). Delivery is handled over SMTP.

---

## Documentation

| Document | Description |
|----------|-------------|
| [BETA_LAUNCH.md](BETA_LAUNCH.md) | Production deployment runbook — environment variables, webhooks, verification checklist |
| [FEATURE_TRACK.md](FEATURE_TRACK.md) | Feature improvements, fixes, and roadmap |
| [THEMES.md](THEMES.md) | Zip theme package format, validation rules, and headless API references |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development setup and pull request guidelines |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting policy |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community standards |

---

## Quick start

**Requirements:** Node.js 20+, npm 9+

```bash
git clone <repository-url>
cd assetlane
cp .env.example apps/api/.env
npm install
npm rebuild better-sqlite3
npm run prisma:generate
npm run prisma:push
npm run dev
```

Open [http://localhost:5173/setup](http://localhost:5173/setup) and complete the first-boot wizard to create your admin account and store profile.

| Surface | URL |
|---------|-----|
| Storefront | http://localhost:5173 |
| Admin | http://localhost:5173/admin |
| API health | http://localhost:5001/health |

Configure Stripe, bKash, and SMTP in **Admin → Settings** after setup. For local development, payment and email credentials are optional until you test checkout.

---

## Capabilities

**Store management**
- First-boot setup wizard
- Single-admin authentication (HTTP-only cookies, bcrypt passwords)
- Product CRUD with draft, published, and archived states
- Private file storage for digital products and product images

**Commerce**
- Stripe Checkout for card payments
- bKash Tokenized Checkout for BDT-priced products
- Global store currency (BDT default; USD, EUR, GBP)
- Discount codes at checkout
- Free products with instant delivery
- Purchase tracking, refunds, and download history
- Configurable download expiry and download count limits
- Multiple downloadable files per product
- Customer purchase library (magic-link access)
- Outbound webhooks for paid/refunded orders

**Delivery**
- Secure download tokens (not publicly guessable)
- Automated buyer emails with download links after payment confirmation
- Admin download-link regeneration

**Distribution**
- Public storefront with theme support
- Headless API (`/api/v1`) for external frontends
- JavaScript embed widget (`/embed.js`)
- Store modes: full storefront, headless, or hybrid

**Themes**
- Built-in reference themes (`canvas`, `atelier`, `paper`, `ember`)
- Custom zip theme packages uploaded from admin (no application code changes)

---

## Architecture

Monorepo layout:

```
assetlane/
├── apps/
│   ├── api/          Express API, Prisma, webhooks, file streaming
│   └── web/          React storefront and admin UI (Vite)
├── packages/
│   └── theme-sdk/    Shared theme context types and helpers
├── storage/          Private uploads and installed theme packages
├── examples/themes/  Starter and sample theme packages
└── docker-compose.yml
```

**Runtime:** SQLite database (`apps/api/assetlane.db`), local disk storage (`storage/`). Digital product files are served only through authenticated download endpoints — never from the frontend public directory.

**Stack:** React, TypeScript, Vite, Express, Prisma, SQLite, Nodemailer.

---

## Configuration

Environment variables are defined in [`.env.example`](.env.example). Copy this file to `apps/api/.env` for local development.

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Session signing (required in production) |
| `FRONTEND_URL` | Storefront origin for CORS and email links |
| `API_PUBLIC_URL` | Public API origin for bKash payment callbacks |
| `STRIPE_*` | Stripe API and webhook credentials (fallback; admin settings take precedence) |
| `BKASH_*` | bKash merchant credentials (fallback; admin settings take precedence) |

Most merchant-facing settings — store identity, payments, SMTP, branding, themes — are managed in the admin UI and stored in the database. Environment variables serve as deployment-time fallbacks.

### Stripe webhook

Register in the Stripe Dashboard:

```text
POST https://<api-host>/api/webhooks/stripe
```

Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`.

### Payment delivery flow

```text
Payment confirmed (Stripe webhook or bKash callback)
  → Order marked paid
  → Download token activated with expiry
  → Email sent to buyer with secure link
  → Buyer downloads file from /download/{token}
```

SMTP must be configured for automatic email delivery. See [BETA_LAUNCH.md](BETA_LAUNCH.md) for production requirements.

---

## Themes

Storefront appearance is controlled through theme packages. Merchants upload zip files from **Admin → Settings → Themes**; developers author packages without modifying application source.

```bash
cd examples/themes
cp -R starter my-store-theme
# Edit theme.json and theme.css
zip -r my-store-theme.zip my-store-theme
```

Full specification: [THEMES.md](THEMES.md).

---

## Development

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and web in development mode |
| `npm run build` | Build all workspaces |
| `npm run seed` | Load sample products (optional) |
| `npm run prisma:push` | Apply schema changes to SQLite (local dev) |
| `npm run prisma:migrate:deploy` | Apply PostgreSQL migrations (production) |
| `npm run dev:reset` | Wipe database and return to setup wizard |
| `npm run dev:reset:full` | Reset database, uploads, and installed themes |

### Docker

```bash
docker compose up --build
```

Uploaded files persist via the `storage/` volume mount. For production deployment, see [BETA_LAUNCH.md](BETA_LAUNCH.md).

### PostgreSQL (production)

Local development defaults to **SQLite** (`file:./assetlane.db`). For production, use **PostgreSQL**:

```bash
# Start Postgres locally
docker compose --profile postgres up postgres -d

# Apply migrations and run API against Postgres
export DATABASE_PROVIDER=postgresql
export DATABASE_URL=postgresql://assetlane:assetlane@localhost:5432/assetlane
npm run prisma:migrate:deploy
npm run dev
```

Full Docker stack with Postgres:

```bash
docker compose --profile postgres up --build api-postgres web-postgres postgres
```

Set `DATABASE_PROVIDER=postgresql` and a `postgresql://…` `DATABASE_URL` in production. The API Docker image runs `prisma migrate deploy` automatically on startup when Postgres is configured.

---

## Deployment

AssetLane is designed for single-tenant self-hosted installs: one store per deployment. Beta deployment instructions — including HTTPS requirements, integration endpoints, backup procedures, and a pre-launch verification checklist — are in [BETA_LAUNCH.md](BETA_LAUNCH.md).

---

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Report security issues privately per [SECURITY.md](SECURITY.md).

---

## License

MIT — see [LICENSE](LICENSE).
