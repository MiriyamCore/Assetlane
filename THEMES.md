# AssetLane Theme Packages

Theme specification for AssetLane storefronts.

AssetLane uses a **zip-first** theme model: developers package styling and metadata into a zip archive; store owners upload and activate themes from the admin panel. No changes to application source code are required.

For platform overview and setup, see [README.md](README.md).

---

## Overview

| Role | Responsibility |
|------|----------------|
| Theme developer | Authors `theme.json`, `theme.css`, and optional assets; delivers a zip package |
| Store owner | Uploads the zip in **Admin → Settings → Themes** and sets it active |

Built-in themes (`canvas`, `atelier`, `paper`, `ember`) ship with the application as references. Production custom themes should be distributed as zip packages.

---

## Workflow

```
Theme developer                    Store owner
─────────────────                  ───────────
1. Copy examples/themes/starter     1. Admin → Settings → Themes
2. Edit theme.json + theme.css      2. Upload theme zip
3. zip -r my-theme.zip my-theme/    3. Set active
4. Deliver zip to store owner
```

---

## Package structure

```
my-store-theme/
├── theme.json        Required — manifest
├── theme.css         Required — all styling
├── layout.json       Optional — homepage section order
├── preview.svg       Optional — admin thumbnail
├── README.md         Optional — notes for store owner
└── assets/           Optional — fonts, images (served from /theme-assets/{id}/)
```

### Manifest (`theme.json`)

```json
{
  "id": "my-store-theme",
  "title": "My Store Theme",
  "description": "Short summary shown in admin.",
  "version": "1.0.0",
  "author": "Your Name",
  "stylesheet": "theme.css",
  "previewImage": "preview.svg",
  "minAssetlaneVersion": "1.0.0",
  "custom": {}
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | URL-safe slug; used in CSS selectors and asset paths |
| `title` | Yes | Display name in the admin theme picker |
| `description` | Yes | Short summary for admin |
| `stylesheet` | No | Defaults to `theme.css` |
| `previewImage` | No | Thumbnail shown in admin |
| `minAssetlaneVersion` | No | Future compatibility gate |
| `custom` | No | Reserved for theme-specific settings |

---

## Stylesheet rules

Scope all CSS under your theme identifier:

```css
.storefront-shell[data-store-theme='my-store-theme'] {
  --bg: #0b1020;
  --text: #f8fafc;
  --theme-accent: var(--brand-primary);
}
```

**Do not** target `body[data-theme]`. Upload validation rejects this selector.

### Available hooks

| Selector / variable | Purpose |
|---------------------|---------|
| `.storefront-shell[data-store-theme='your-id']` | Root scope and design tokens |
| `--brand-primary`, `--brand-secondary` | Values set in admin branding settings |
| `.canvas-page`, `.canvas-hero`, `.canvas-product-list` | Homepage layout |
| `.canvas-checkout`, `.checkout-form` | Product checkout |
| `.site-header`, `.site-footer` | Navigation and footer |

The platform renders structure and data; your stylesheet controls appearance.

### Homepage layout (`layout.json`)

Optional section ordering without code changes:

```json
{
  "home": {
    "sections": ["hero", "featured", "catalog", "about"],
    "showHeroHighlights": false
  }
}
```

Allowed sections: `hero`, `featured`, `catalog`, `about`.

---

## Upload validation

On install, AssetLane validates:

- `theme.json` parses and contains required fields
- The declared stylesheet file exists
- No `body[data-theme]` selectors (error)
- A `.storefront-shell[data-store-theme='your-id']` root block is present (warning)

Errors block installation. Warnings are displayed in admin after a successful upload.

---

## Headless API

External frontends can consume the same data shapes the React storefront uses:

| Endpoint | Returns |
|----------|---------|
| `GET /api/v1/theme` | Active theme manifest and helper registry |
| `GET /api/v1/contexts/home` | Homepage context |
| `GET /api/v1/contexts/product/:slug` | Product page context |
| `GET /api/v1/products` | Published product list |

Type definitions and helpers: `packages/theme-sdk/`.

When `storeMode` is set to `headless`, the built-in React storefront is hidden; API and theme contexts remain available.

---

## Built-in themes

| ID | Purpose |
|----|---------|
| `canvas` | Default rendering engine for zip themes |
| `atelier` | Reference — glass studio aesthetic |
| `paper` | Reference — editorial layout |
| `ember` | Reference — high-contrast energy |

Do not fork built-in themes in application code. Start from `examples/themes/starter/`.

---

## Examples

| Path | Description |
|------|-------------|
| `examples/themes/starter/` | Minimal template to copy |
| `examples/themes/midnight-journal/` | Complete example package |

```bash
cd examples/themes
cp -R starter my-store-theme
# Edit my-store-theme/theme.json and theme.css
zip -r my-store-theme.zip my-store-theme
```

---

## Implementation reference

| Area | Location |
|------|----------|
| Zip install and validation | `apps/api/src/lib/themes.ts`, `theme-lint.ts` |
| Zip theme rendering | `apps/web/src/storefront/themes/canvas.tsx` |
| Theme SDK | `packages/theme-sdk/` |

---

*AssetLane is built by Miriyam Core.*
