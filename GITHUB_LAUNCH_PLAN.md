# AssetLane GitHub Launch Plan

> Internal checklist for public repository launch. Public-facing documentation lives in [README.md](README.md), [BETA_LAUNCH.md](BETA_LAUNCH.md), and [CONTRIBUTING.md](CONTRIBUTING.md).

This file tracks remaining work to make the repository presentable on GitHub.

## Launch Goal

Publish AssetLane as an open-source project that:

- installs cleanly
- runs locally without guesswork
- has a safe default setup
- looks trustworthy on GitHub
- gives contributors a clear place to start

## Current State

The repo already has strong MVP coverage:

- working React + Express app structure
- SQLite + Prisma setup
- Stripe checkout and webhook flow
- SMTP buyer email flow
- admin product management
- storefront theme system
- zip theme install/export/delete flow
- Docker files and `docker-compose.yml`
- README and MIT license

The biggest gap is not product scope anymore. The biggest gap is launch polish, repo hygiene, and contributor readiness.

## Must Finish Before Public GitHub Launch

### 1. Repo hygiene

- [ ] Add a root `.gitignore`
- [ ] Make sure `node_modules/`, local `.env` files, build output, temp zips, and local databases are ignored
- [ ] Remove local-only files from the repo if any are accidentally tracked
- [ ] Confirm `dev.db`, `apps/api/assetlane.db`, and theme test archives are not committed as launch artifacts
- [ ] Make sure storage directories are either empty or include only safe placeholder files

Why this matters:
The repo should clone cleanly and not leak local machine state.

### 2. Production-safe defaults

- [ ] Replace any weak demo secrets in docs and examples with clearly fake placeholders
- [ ] Review cookie/auth settings for production deployment assumptions
- [ ] Confirm `JWT_SECRET` requirements are documented clearly
- [ ] Confirm webhook and SMTP failure behavior is acceptable for a public release
- [ ] Review CORS and `FRONTEND_URL` assumptions for hosted deployment

Why this matters:
People will copy-paste defaults. Unsafe defaults become support and trust problems fast.

### 3. Local setup must be frictionless

- [ ] Test the full setup from scratch using only the README
- [ ] Verify `npm install`, Prisma setup, seed, and `npm run dev` all work in a fresh checkout
- [ ] Verify Docker setup works from a fresh checkout too
- [ ] Document any platform-specific notes for macOS/Linux if needed
- [ ] Document seeded login credentials and how to change them safely

Why this matters:
If first run is confusing, GitHub visitors drop immediately.

### 4. README needs launch-grade polish

- [ ] Add a short “Why AssetLane exists” section
- [ ] Add screenshots or a short GIF of storefront, product editor, and theme manager
- [ ] Add a “Quick start” section near the top
- [ ] Add a “Feature status” or “MVP scope” section so users know what is production-ready vs evolving
- [ ] Add “How themes work” with both built-in themes and zip theme packages
- [ ] Add deployment notes for self-hosting
- [ ] Add troubleshooting for Stripe, SMTP, and uploads

Why this matters:
README is the landing page for the launch.

### 5. Deployment story must be clear

- [ ] Decide the recommended first deployment path
- [ ] Option A: Docker Compose on a VPS
- [ ] Option B: split frontend/backend hosting
- [ ] Document required environment variables for production
- [ ] Explain persistent storage requirements for uploads, SQLite, and installed theme packages
- [ ] Explain HTTPS requirement for Stripe callbacks and auth cookies
- [ ] Add a basic backup note for database and uploaded files

Why this matters:
“Open source” without “how to actually deploy this” will create confusion.

### 6. CI and quality gates

- [ ] Add a GitHub Actions workflow for install + build
- [ ] Add a workflow for lint/typecheck/build at minimum
- [ ] Add at least one basic health test or smoke test
- [ ] Decide whether to add ESLint now or after launch

Why this matters:
Public repos need visible signals that the main branch is healthy.

### 7. Legal and community files

- [ ] Keep `LICENSE`
- [ ] Add `CONTRIBUTING.md`
- [ ] Add `CODE_OF_CONDUCT.md`
- [ ] Add `SECURITY.md`
- [ ] Add issue templates
- [ ] Add a pull request template

Why this matters:
These files make the project feel maintained and contributor-friendly.

## High Priority Soon After Launch

### 8. Release packaging

- [ ] Tag the first public release
- [ ] Add release notes
- [ ] Include a sample theme package asset in the release if useful
- [ ] Decide whether to publish a hosted demo or video walkthrough

### 9. Theme developer experience

- [ ] Add a dedicated `THEMES.md`
- [ ] Document the zip package schema in more detail
- [ ] Add more sample themes
- [ ] Add built-in preview thumbnails for bundled themes
- [ ] Consider manifest versioning for future compatibility

### 10. Product hardening

- [ ] Add uninstall safeguards for active themes with better UX messaging
- [ ] Add more admin success/error states around theme actions
- [ ] Add better handling for missing SMTP/Stripe config
- [ ] Add migration/upgrade notes for future versions

## Nice To Have After Launch

- [ ] Hosted docs site
- [ ] Theme marketplace/import registry concept
- [ ] Multi-admin support
- [ ] Postgres support
- [ ] S3-compatible file storage option
- [ ] More automated tests around checkout, downloads, and theme lifecycle

## Recommended Launch Order

1. Clean the repo and add missing meta files
2. Tighten README and quick-start docs
3. Add root `.gitignore`
4. Add GitHub Actions build workflow
5. Re-test fresh local setup
6. Re-test Docker setup
7. Prepare screenshots/GIFs
8. Publish repo
9. Create first tagged release

## Suggested First GitHub Issues

- [ ] Add root `.gitignore`
- [ ] Add GitHub Actions CI workflow
- [ ] Add `CONTRIBUTING.md`
- [ ] Add `CODE_OF_CONDUCT.md`
- [ ] Add `SECURITY.md`
- [ ] Add launch screenshots to README
- [ ] Document production deployment using Docker Compose
- [ ] Add built-in preview thumbnails for bundled themes
- [ ] Add smoke tests for auth, storefront, and theme manager

## My Recommendation

If the goal is “publish soon but not embarrassingly early,” the minimum bar before making the repo public is:

- root `.gitignore`
- launch-grade README
- clean env/docs story
- CI build workflow
- basic community files
- one verified deployment path

That is enough to make the project look intentional instead of experimental.
