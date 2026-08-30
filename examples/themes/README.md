# Example zip themes

Theme developers build a folder, zip it, and the store owner uploads it from admin. **No app code changes.**

## Quick start

```bash
cd examples/themes
cp -R starter my-store-theme
# edit my-store-theme/theme.json — set a unique id, title, description
# edit my-store-theme/theme.css — your styles
zip -r my-store-theme.zip my-store-theme
```

Upload `my-store-theme.zip` in **Admin → Settings → Themes**.

## Packages in this folder

| Folder | Description |
|--------|-------------|
| `starter/` | Blank template to copy |
| `midnight-journal/` | Example dark editorial skin |

Full guidelines: [THEMES.md](../../THEMES.md)
