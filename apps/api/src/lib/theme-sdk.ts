import {
  buildHomeContext,
  buildProductContext,
  buildThemeManifest,
  buildThemeSdkResponse,
  THEME_HELPERS,
  type SettingsRecord,
  type ThemeProduct,
} from '@assetlane/theme-sdk';
import prisma from './prisma';
import { getSettingsMap } from './settings';
import { serializeProduct } from './serializers';
import { getThemeById } from './themes';

const toThemeProduct = (product: ReturnType<typeof serializeProduct>): ThemeProduct => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  summary: product.summary,
  description: product.description,
  tags: product.tags,
  priceCents: product.priceCents,
  price: product.price,
  currency: product.currency,
  status: product.status,
  version: product.version,
  changelog: product.changelog,
  seoTitle: product.seoTitle,
  metaDescription: product.metaDescription,
  featuredImageUrl: product.featuredImageUrl,
  galleryImageUrls: product.galleryImageUrls,
  digitalFileName: product.digitalFileName,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
});

const publicSettingKeys = [
  'storeName',
  'storeDescription',
  'storeUrl',
  'storeMode',
  'supportEmail',
  'defaultCurrency',
  'downloadExpiryDays',
  'downloadLimit',
  'footerText',
  'termsUrl',
  'privacyUrl',
  'logoPath',
  'faviconPath',
  'brandPrimaryColor',
  'brandSecondaryColor',
  'heroHeadline',
  'heroSubheadline',
  'primaryCtaLabel',
  'secondaryCtaLabel',
  'homepageMode',
  'featuredProductSlug',
  'showHeroHighlights',
  'catalogEyebrow',
  'catalogTitle',
  'catalogDescription',
  'emptyCatalogTitle',
  'emptyCatalogMessage',
  'aboutTitle',
  'aboutBody',
  'announcementText',
  'announcementUrl',
  'socialWebsite',
  'socialTwitter',
  'socialInstagram',
  'socialYoutube',
  'showPublicAdminLinks',
  'storefrontTheme',
] as const;

const toPublicAssetUrl = (value: string | undefined, basePath: string) => {
  if (!value) return '';
  return `/${basePath}/${value.replace(/^branding\//, '').replace(/^\/+/, '')}`;
};

export const toPublicSettingsRecord = async (): Promise<SettingsRecord> => {
  const settings = await getSettingsMap();
  const activeTheme = getThemeById(settings.storefrontTheme);

  return {
    ...Object.fromEntries(publicSettingKeys.map((key) => [key, settings[key] ?? ''])),
    storefrontTheme: activeTheme.id,
    storefrontThemeBase: activeTheme.baseTheme,
    storefrontThemeStylesheetUrl: activeTheme.stylesheetUrl || '',
    logoUrl: toPublicAssetUrl(settings.logoPath, 'branding-assets'),
    faviconUrl: toPublicAssetUrl(settings.faviconPath, 'branding-assets'),
  };
};

export const getActiveThemeManifest = async () => {
  const settings = await toPublicSettingsRecord();
  const activeTheme = getThemeById(settings.storefrontTheme);
  return buildThemeManifest(
    {
      id: activeTheme.id,
      title: activeTheme.title,
      description: activeTheme.description,
      version: activeTheme.version,
      author: activeTheme.author,
      baseTheme: activeTheme.baseTheme,
      source: activeTheme.source,
      stylesheetUrl: activeTheme.stylesheetUrl,
      previewImageUrl: activeTheme.previewImageUrl,
      minAssetlaneVersion: activeTheme.minAssetlaneVersion,
      custom: activeTheme.custom,
      packageLayout: activeTheme.packageLayout,
    },
    settings,
  );
};

export const listPublishedProducts = async (): Promise<ThemeProduct[]> => {
  const products = await prisma.product.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
  });

  return products.map((product) => toThemeProduct(serializeProduct(product)));
};

export const getPublishedProductBySlug = async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: 'published',
    },
  });

  if (!product) {
    return null;
  }

  return toThemeProduct(serializeProduct(product));
};

export const getThemeSdkPayload = async () => {
  const theme = await getActiveThemeManifest();
  return buildThemeSdkResponse(theme, THEME_HELPERS);
};

export const getHomeContextPayload = async () => {
  const [settings, products, theme] = await Promise.all([
    toPublicSettingsRecord(),
    listPublishedProducts(),
    getActiveThemeManifest(),
  ]);

  return buildHomeContext({
    settings,
    products,
    theme,
  });
};

export const getProductContextPayload = async (slug: string) => {
  const [settings, product, theme] = await Promise.all([
    toPublicSettingsRecord(),
    getPublishedProductBySlug(slug),
    getActiveThemeManifest(),
  ]);

  if (!product) {
    return null;
  }

  return buildProductContext({
    settings,
    product,
    theme,
  });
};
