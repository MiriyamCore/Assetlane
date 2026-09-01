import prisma from './prisma';
import { PRODUCT_NAME } from './platform';

const defaultSettings = {
  storeName: PRODUCT_NAME,
  storeUrl: 'http://localhost:5173',
  supportEmail: 'support@example.com',
  defaultCurrency: 'BDT',
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
  heroImagePath: '',
  brandPrimaryColor: '#73f0c5',
  brandSecondaryColor: '#4eb8ff',
  bodyFontPreset: 'theme-default',
  headingFontPreset: 'match-body',
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
  faqTitle: '',
  faqBody: '',
  trustTitle: '',
  trustBlock1Title: '',
  trustBlock1Body: '',
  trustBlock2Title: '',
  trustBlock2Body: '',
  trustBlock3Title: '',
  trustBlock3Body: '',
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
  const existing = await prisma.setting.findMany({ select: { key: true } });
  const existingKeys = new Set(existing.map((setting) => setting.key));

  const missingEntries = Object.fromEntries(
    Object.entries(defaults).filter(([key]) => !existingKeys.has(key)),
  );

  if (Object.keys(missingEntries).length > 0) {
    await prisma.$transaction(
      Object.entries(missingEntries).map(([key, value]) =>
        prisma.setting.create({
          data: { key, value },
        }),
      ),
    );
  }

  const userCount = await prisma.user.count();
  if (userCount > 0) {
    const settings = await getSettingsMap();
    if (settings.setupCompleted !== 'true') {
      await upsertSettings({ setupCompleted: 'true' });
    }
  }

  return getSettingsMap();
};

export const toIntSetting = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
