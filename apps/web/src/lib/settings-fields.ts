export type SettingsFieldKind = 'text' | 'textarea' | 'email' | 'url' | 'password' | 'number' | 'color';

export type SettingsFieldMeta = {
  kind: SettingsFieldKind;
  rows?: number;
  fullWidth?: boolean;
  compact?: boolean;
};

const textareaFields: Record<string, number> = {
  storeDescription: 3,
  heroSubheadline: 2,
  catalogDescription: 3,
  emptyCatalogMessage: 3,
  aboutBody: 5,
  faqBody: 6,
  footerText: 3,
  announcementText: 2,
  embedAllowedOrigins: 3,
};

const emailFields = new Set(['supportEmail', 'smtpFrom']);
const urlFields = new Set([
  'storeUrl',
  'termsUrl',
  'privacyUrl',
  'announcementUrl',
  'socialWebsite',
  'socialTwitter',
  'socialInstagram',
  'socialYoutube',
]);
const passwordFields = new Set([
  'smtpPass',
  'stripeSecretKey',
  'stripeWebhookSecret',
  'headlessSecretKey',
  'bkashAppSecret',
  'bkashPassword',
]);
const numberFields = new Set(['downloadExpiryDays', 'downloadLimit', 'smtpPort']);
const colorFields = new Set(['brandPrimaryColor', 'brandSecondaryColor']);

const fullWidthFields = new Set([
  'storeDescription',
  'heroSubheadline',
  'catalogDescription',
  'emptyCatalogMessage',
  'aboutBody',
  'faqBody',
  'footerText',
  'announcementText',
  'embedAllowedOrigins',
]);

export function getSettingsFieldMeta(key: string): SettingsFieldMeta {
  if (colorFields.has(key)) {
    return { kind: 'color', compact: true };
  }

  if (textareaFields[key]) {
    return {
      kind: 'textarea',
      rows: textareaFields[key],
      fullWidth: fullWidthFields.has(key),
    };
  }

  if (emailFields.has(key)) {
    return { kind: 'email' };
  }

  if (urlFields.has(key)) {
    return { kind: 'url' };
  }

  if (passwordFields.has(key)) {
    return { kind: 'password' };
  }

  if (numberFields.has(key)) {
    return { kind: 'number' };
  }

  return { kind: 'text' };
}

export const settingsFieldHelp: Partial<Record<string, string>> = {
  aboutBody: 'Leave blank to hide the about section.',
  faqBody: 'Markdown supported. Leave blank to hide the FAQ section.',
  trustBlock1Body: 'Shown in the trust section when title or description is filled.',
  catalogDescription: 'Shown under the catalog heading on the homepage.',
  embedAllowedOrigins: 'Comma-separated site origins allowed to load embed.js and start checkout, e.g. https://myblog.com',
  headlessSecretKey: 'Send as X-Assetlane-Secret when calling POST /api/v1/checkout/sessions.',
  paymentProviderMode: 'Choose Stripe, bKash, or both at checkout.',
  bkashSandbox: 'Keep enabled until you have live bKash merchant credentials from your bKash onboarding.',
  announcementUrl: 'Optional link when shoppers click the announcement.',
  bodyFontPreset: 'Applies to storefront body text. Theme default keeps each theme’s built-in pairing.',
  headingFontPreset: 'Applies to headlines and display text. Match body uses the body font selection.',
  defaultCurrency: 'Use BDT when accepting bKash. Stripe supports all listed currencies.',
  storeLocale: 'Default language for new storefront visitors before they choose English or Bangla.',
};
