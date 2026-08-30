# AssetLane App Launch Track

> Internal product roadmap. For deployment readiness, see [BETA_LAUNCH.md](BETA_LAUNCH.md). For public overview, see [README.md](README.md).

Tracks product gaps before AssetLane is merchant-ready beyond beta.

## Main Product Gaps Right Now

The app is already functional, but it still feels like:

- a capable MVP
- a developer demo
- not yet a polished merchant-ready product

The two biggest product gaps are now:

1. the storefront needs more merchant-controlled layout/content modes beyond the hero
2. the admin settings area is improving, but still needs more structure and richer customization

## What Admin Can Customize Today

Current admin customization is limited to:

- store name
- store URL
- support email
- default currency
- download expiry days
- download limit
- footer text
- terms URL
- privacy URL
- SMTP host
- SMTP port
- SMTP user
- SMTP pass
- SMTP from
- storefront theme activation
- zip theme install/export/delete

## What Admin Cannot Customize Yet

This is the real launch gap.

### Branding

- [x] upload/change logo
- [x] upload/change favicon
- [ ] set brand wordmark without code edits
- [ ] set a default store cover / hero media
- [x] set theme-specific brand colors from admin
- [x] set button/accent color from admin
- [ ] set typography choices from admin

### Storefront content

- [x] edit homepage hero headline
- [x] edit homepage subheadline
- [x] edit homepage CTA labels
- [ ] edit homepage sections without touching code
- [x] control whether homepage shows intro copy vs product-first layout
- [ ] add merchant story / about block
- [ ] add FAQ / trust / delivery info blocks
- [ ] add social links

### Store identity

- [x] custom logo in navbar and footer
- [~] custom footer layout/content
- [ ] custom contact links
- [ ] custom support/about/legal navigation
- [ ] optional announcement bar

### Storefront structure

- [x] choose homepage mode:
  - explanatory / marketing-first
  - product-grid-first
  - featured-product-first
- [ ] choose whether to show theme promo copy
- [ ] choose whether to show admin/demo-style references like “Add a product”
- [x] choose featured products / pinned products on homepage

### Theme management

- [ ] better activation UX for bundled vs zip themes
- [ ] built-in preview thumbnails for bundled themes
- [ ] theme metadata panel in admin
- [ ] clearer active theme summary
- [ ] uninstall safeguards and messaging polish

## Homepage Problem

Right now the homepage copy is mostly explaining AssetLane itself:

- “Run your own storefront, then style it like an actual brand.”
- “AssetLane gives creators full ownership...”

That was fine for a demo, but not for a real seller storefront.

The main hero now supports merchant-owned content, but the next gap is giving merchants more control over homepage structure and supporting sections.

### What is needed

- [ ] merchant-editable homepage content
- [x] option to remove platform explanatory sections entirely
- [x] option to make homepage product-first
- [x] featured collection / featured product support
- [ ] cleaner empty state for brand-new stores

## Settings Page Problem

Right now the settings page is a mixed technical form:

- store identity
- legal fields
- download rules
- SMTP credentials
- theme management

It works, but it is not well organized for a merchant.

### What is needed

- [x] split settings into clearer groups:
  - branding
  - storefront
  - checkout/download rules
  - legal/contact
  - email delivery
  - themes
- [x] add descriptions/help text for each section
- [ ] separate technical settings from visual settings
- [ ] better success and validation UX
- [ ] preview-oriented settings where possible

## Recommended Launch Priorities

### Priority 1: merchant branding

- [x] logo upload
- [x] favicon upload
- [x] brand color settings
- [x] homepage hero copy fields
- [x] remove demo/explanatory homepage language from merchant storefront

### Priority 2: storefront customization

- [x] homepage mode selection
- [x] featured products / pinned products
- [ ] social links
- [ ] footer customization
- [ ] announcement bar or promo strip

### Priority 3: admin UX cleanup

- [x] reorganize settings page
- [ ] separate branding from SMTP/system settings
- [ ] add bundled theme thumbnails
- [ ] add better empty states and helper text

## Concrete Build List

If we want the shortest path to a credible launch, this is the build order I recommend:

1. Add branding settings model:
   - [x] logo
   - [x] favicon
   - [x] primary color
   - [x] secondary color
   - [x] hero headline
   - [x] hero subheadline
   - [x] primary CTA label
   - [x] secondary CTA label

2. Update navbar/footer/homepage to use those settings
   - [x] navbar now supports branded logo
   - [x] favicon now updates from admin branding settings
   - [x] homepage hero now uses merchant-controlled copy and CTA labels
   - [x] footer now supports branded logo and store identity

3. Replace homepage demo copy with merchant-controlled content

4. Rework admin settings into sections:
   - [x] Branding
   - [x] Storefront
   - [x] Themes
   - [x] Policies and contact
   - [x] Delivery rules
   - [x] Email

5. Add bundled theme thumbnails

6. Add featured products / homepage layout mode
   - [x] homepage mode selector
   - [x] featured product selector
   - [x] theme homepage rendering support

## What I Would Call “Launch-Ready Enough”

For the app itself, I would not call it launch-ready until at least these are done:

- logo upload
- favicon upload
- editable homepage hero
- product-first homepage option
- cleaner settings page structure
- bundled theme previews
- admin-controlled brand colors or theme accent overrides

Without those, a merchant can run the app, but they still cannot really make the storefront feel like their own brand from admin.

## In Progress Now

Current implementation pass:

- completed homepage mode selection
- completed featured product selection
- completed theme homepage support for merchant-selected homepage structure

Still expected after this pass:

- more polished validation and preview flows in settings
- more storefront content blocks from admin
