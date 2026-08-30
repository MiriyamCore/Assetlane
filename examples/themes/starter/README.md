# Starter Theme

Minimal zip theme template for AssetLane storefronts.

## Usage

```bash
cd examples/themes
cp -R starter my-store-theme
# Edit my-store-theme/theme.json (set a unique id and title)
# Edit my-store-theme/theme.css
zip -r my-store-theme.zip my-store-theme
```

Upload `my-store-theme.zip` from **Admin → Settings → Themes**.

## Package contents

| File | Required | Purpose |
|------|----------|---------|
| `theme.json` | Yes | Manifest (id, title, description, version) |
| `theme.css` | Yes | All visual styling |
| `layout.json` | No | Homepage section order |
| `preview.svg` | No | Admin preview thumbnail |
| `README.md` | No | Notes for the store owner |
| `assets/` | No | Fonts and images (served from `/theme-assets/{id}/`) |

Themes are rendered by the platform zip engine. You do not modify AssetLane application code.

Full specification: [THEMES.md](../../THEMES.md).
