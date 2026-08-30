import prisma from './prisma';
import { PRODUCT_NAME } from './platform';

const defaultSettings = {
  storeName: PRODUCT_NAME,
  storeUrl: 'http://localhost:5173',
  supportEmail: 'support@example.com',
  defaultCurrency: 'USD',
  downloadExpiryDays: '7',
  downloadLimit: '5',
  setupCompleted: 'false',
  storeDescription: '',
  storeMode: 'hybrid',
  stripeSecretKey: '',
  stripePublicKey: '',
  stripeWebhookSecret: '',
  paymentProviderMode: 'both',
  bkashAppKey: '',
  bkashAppSecret: '',
  bkashUsername: '',
  bkashPassword: '',
  bkashSandbox: 'true',
  headlessApiKey: '',
  headlessSecretKey: '',
  embedAllowedOrigins: '',
  footerText: 'Thanks for visiting our store.',
  termsUrl: '',
  privacyUrl: '',
  logoPath: '',
  faviconPath: '',
  brandPrimaryColor: '#73f0c5',
  brandSecondaryColor: '#4eb8ff',
  heroHeadline: 'Sell digital products under your own brand.',
  heroSubheadline: 'Launch a storefront that feels like yours. Accept Stripe or bKash, deliver files securely, and run under your own brand.',
  primaryCtaLabel: 'Browse products',
  secondaryCtaLabel: 'View featured product',
  homepageMode: 'hero-grid',
  featuredProductSlug: '',
  showHeroHighlights: 'false',
  catalogEyebrow: 'Available now',
  catalogTitle: 'Shop the catalog',
  catalogDescription: 'Browse published products and purchase with secure delivery.',
  emptyCatalogTitle: 'New releases coming soon',
  emptyCatalogMessage: 'This storefront is getting ready. Check back soon for the first release.',
  aboutTitle: '',
  aboutBody: '',
  announcementText: '',
  announcementUrl: '',
  socialWebsite: '',
  socialTwitter: '',
  socialInstagram: '',
  socialYoutube: '',
  showPublicAdminLinks: 'false',
  storefrontTheme: 'canvas',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  smtpFrom: 'noreply@assetlane.local',
} as const;

export type SettingsMap = Record<string, string>;

export const getDefaultSettings = (): SettingsMap => ({ ...defaultSettings });

export const getSettingsMap = async (): Promise<SettingsMap> => {
  const settings = await prisma.setting.findMany();
  const merged = getDefaultSettings();

  settings.forEach((setting) => {
    merged[setting.key] = setting.value;
  });

  return merged;
};

export const upsertSettings = async (entries: Record<string, string>) => {
  const updates = Object.entries(entries).map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );

  await prisma.$transaction(updates);
  return getSettingsMap();
};

export const ensureDefaultSettings = async () => {
  const defaults = getDefaultSettings();
  await upsertSettings(defaults);
};

export const toIntSetting = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
