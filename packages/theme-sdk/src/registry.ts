import type { ThemeHelperDefinition } from './types';

export const THEME_HELPERS: ThemeHelperDefinition[] = [
  {
    name: 'site',
    kind: 'data',
    description: 'Resolved public store metadata, branding, and social links.',
    react: 'useSite() or getSite(settings)',
    headless: 'GET /api/v1/contexts/home → site',
  },
  {
    name: 'catalog',
    kind: 'data',
    description: 'Catalog section copy and empty-state messaging.',
    react: 'useCatalogCopy() or getCatalogCopy(settings)',
    headless: 'GET /api/v1/contexts/home → catalog, emptyCatalog',
  },
  {
    name: 'hero',
    kind: 'data',
    description: 'Homepage hero headline, subheadline, and CTA labels.',
    react: 'useHeroCopy() or getHeroCopy(settings)',
    headless: 'GET /api/v1/contexts/home → hero',
  },
  {
    name: 'products',
    kind: 'data',
    description: 'Published products for the storefront catalog.',
    react: 'useProducts()',
    headless: 'GET /api/v1/products or contexts/home → products',
  },
  {
    name: 'featured_product',
    kind: 'functional',
    description: 'Featured product resolved from admin slug or first published item.',
    react: 'useFeaturedProduct() or resolveFeaturedProduct(products, settings)',
    headless: 'GET /api/v1/contexts/home → featuredProduct',
  },
  {
    name: 'home_layout',
    kind: 'functional',
    description:
      'Optional homepage hints from admin settings (section order, featured visibility). Themes may follow, adapt, or ignore them.',
    react: 'useHomeLayout() — optional; useThemeHomeContext() for full freedom',
    headless: 'GET /api/v1/contexts/home → layout (optional hints)',
  },
  {
    name: 'theme',
    kind: 'data',
    description: 'Active theme manifest, base layout preset, and CSS tokens.',
    react: 'useThemeManifest()',
    headless: 'GET /api/v1/theme → theme',
  },
  {
    name: 'product_url',
    kind: 'functional',
    description: 'Absolute or relative product page URL.',
    react: 'getProductUrl(slug, settings)',
    headless: 'GET /api/v1/contexts/product/:slug → urls.product',
  },
  {
    name: 'money',
    kind: 'format',
    description: 'Locale-aware currency formatting.',
    react: 'formatMoney(amount, currency)',
    headless: 'Use product.price + product.currency from API payloads',
  },
];
