import { SDK_VERSION } from '../types';
import type {
  HomePageContext,
  ProductPageContext,
  SettingsRecord,
  ThemeManifest,
  ThemePackageLayout,
  ThemeProduct,
  ThemeSdkResponse,
} from '../types';
import {
  getAboutCopy,
  getAnnouncement,
  getCatalogCopy,
  getEmptyCatalogCopy,
  getHeroCopy,
  getSite,
  hasAboutSection,
  hasAnnouncement,
} from '../helpers/site';
import { getHomeLayout, resolveFeaturedProduct, resolvePackageHomeLayout } from '../helpers/theme';

export type ThemeRecordInput = {
  id: string;
  title: string;
  description: string;
  version?: string;
  author?: string;
  baseTheme: string;
  source: 'bundled' | 'package';
  stylesheetUrl?: string;
  previewImageUrl?: string;
  minAssetlaneVersion?: string;
  custom?: Record<string, unknown>;
  packageLayout?: ThemePackageLayout;
};

export const buildThemeManifest = (theme: ThemeRecordInput, settings: SettingsRecord): ThemeManifest => {
  const base = theme.baseTheme === 'paper' || theme.baseTheme === 'ember' || theme.baseTheme === 'canvas' ? theme.baseTheme : 'atelier';

  return {
    id: theme.id,
    title: theme.title,
    description: theme.description,
    version: theme.version,
    author: theme.author,
    base,
    source: theme.source,
    stylesheetUrl: theme.stylesheetUrl,
    previewImageUrl: theme.previewImageUrl,
    minAssetlaneVersion: theme.minAssetlaneVersion,
    custom: theme.custom,
    ...(theme.packageLayout ? { packageLayout: theme.packageLayout } : {}),
    tokens: {
      base,
      catalogGridClass:
        base === 'paper'
          ? 'product-grid product-grid-paper'
          : base === 'ember'
            ? 'product-grid product-grid-ember'
            : base === 'canvas'
              ? 'product-grid product-grid-canvas'
              : 'product-grid',
      dataAttributes: {
        theme: base,
        storeTheme: theme.id || settings.storefrontTheme || base,
      },
    },
  };
};

export const buildHomeContext = (input: {
  settings: SettingsRecord;
  products: ThemeProduct[];
  theme: ThemeManifest;
  loading?: boolean;
  error?: string;
}): HomePageContext => {
  const featuredProduct = resolveFeaturedProduct(input.products, input.settings);
  const adminLayout = getHomeLayout(input.settings, input.products, featuredProduct);
  const layout = resolvePackageHomeLayout(adminLayout, input.theme.packageLayout?.home);

  return {
    context: 'home',
    sdkVersion: SDK_VERSION,
    site: getSite(input.settings),
    theme: input.theme,
    hero: getHeroCopy(input.settings),
    catalog: getCatalogCopy(input.settings),
    emptyCatalog: getEmptyCatalogCopy(input.settings),
    about: getAboutCopy(input.settings),
    announcement: getAnnouncement(input.settings),
    products: input.products,
    featuredProduct,
    layout,
    flags: {
      hasAbout: hasAboutSection(input.settings),
      hasAnnouncement: hasAnnouncement(input.settings),
      hasProducts: input.products.length > 0,
    },
    ...(input.loading !== undefined ? { loading: input.loading } : {}),
    ...(input.error !== undefined ? { error: input.error } : {}),
  };
};

export const buildProductContext = (input: {
  settings: SettingsRecord;
  product: ThemeProduct;
  theme: ThemeManifest;
}): ProductPageContext => {
  const productPath = `/product/${input.product.slug}`;

  return {
    context: 'product',
    sdkVersion: SDK_VERSION,
    site: getSite(input.settings),
    theme: input.theme,
    product: input.product,
    urls: {
      product: input.settings.storeUrl ? `${input.settings.storeUrl.replace(/\/+$/, '')}${productPath}` : productPath,
      checkout: '/api/checkout/sessions',
    },
  };
};

export const buildThemeSdkResponse = (theme: ThemeManifest, helpers: ThemeSdkResponse['helpers']): ThemeSdkResponse => ({
  sdkVersion: SDK_VERSION,
  helpers,
  theme,
  contexts: {
    home: '/api/v1/contexts/home',
    product: '/api/v1/contexts/product/:slug',
  },
});
