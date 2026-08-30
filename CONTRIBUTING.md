# Contributing to AssetLane

Thank you for your interest in contributing. AssetLane is maintained by Miriyam Core.

## Getting started

1. Read [README.md](README.md) for project overview and architecture.
2. For non-trivial changes, open an issue first to discuss approach.
3. Keep pull requests focused — one concern per PR when possible.

## Development setup

**Requirements:** Node.js 20+, npm 9+

```bash
cp .env.example apps/api/.env
npm install
npm rebuild better-sqlite3
npm run prisma:generate
npm run prisma:push
npm run dev
```

Complete the setup wizard at [http://localhost:5173/setup](http://localhost:5173/setup) to create a local admin account. Sample products are optional:

```bash
npm run seed
```

Verify the build before submitting:

```bash
npm run build
```

### Reset local state

```bash
npm run dev:reset        # Wipe database, return to setup wizard
npm run dev:reset:full   # Also clear uploads and installed themes
```

## Project structure

| Path | Purpose |
|------|---------|
| `apps/web` | React storefront and admin UI |
| `apps/api` | Express API, Prisma schema, webhooks |
| `packages/theme-sdk` | Shared theme types and helpers |
| `storage/` | Local private file storage (gitignored contents) |
| `examples/themes/` | Theme package templates |

Preserve this layout. Place new code in the appropriate workspace rather than adding top-level application directories.

## Code guidelines

- Match existing naming, import style, and file organization in the area you are editing.
- Prefer small, composable modules over large single files.
- Keep user-facing copy consistent with **AssetLane** (product) and **Miriyam Core** (company).
- Do not commit secrets, local databases, or uploaded files.

## Pull requests

Include in your PR description:

- Summary of what changed and why
- User-facing behavior changes, if any
- New environment variables, schema changes, or storage requirements
- Screenshots or recordings for visible UI changes

Confirm `npm run build` passes before requesting review.

## Areas where contributions are especially valuable

- Deployment and operations documentation
- Automated tests and CI improvements
- Theme developer tooling
- Accessibility improvements
- Storage backends beyond local disk
- Production hardening

## Bug reports

When filing a bug, include:

1. Expected behavior
2. Actual behavior
3. Steps to reproduce
4. Environment (OS, Node version, deployment method)
5. Relevant logs or screenshots

Use the GitHub issue templates when available.

## Security

Do not report security vulnerabilities in public issues. Follow the process in [SECURITY.md](SECURITY.md).

## Code of conduct

All participants are expected to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
