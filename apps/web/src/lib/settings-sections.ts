import type { SettingsMap } from '../types/store';
import { validateSettingsForm } from './settings-validation';

export type SettingsSectionId =
  | 'branding'
  | 'themes'
  | 'store'
  | 'payments'
  | 'distribution'
  | 'storefront'
  | 'content'
  | 'promotion'
  | 'social'
  | 'policies'
  | 'delivery'
  | 'email'
  | 'team';

export const settingsSectionFields: Record<SettingsSectionId, string[]> = {
  branding: [
    'heroHeadline',
    'heroSubheadline',
    'primaryCtaLabel',
    'secondaryCtaLabel',
    'brandPrimaryColor',
    'brandSecondaryColor',
    'bodyFontPreset',
    'headingFontPreset',
    'showHeroHighlights',
  ],
  themes: [],
  store: ['storeName', 'storeUrl', 'storeDescription', 'supportEmail', 'storeMode', 'showPublicAdminLinks'],
  payments: [
    'paymentProviderMode',
    'stripeSecretKey',
    'stripePublicKey',
    'stripeWebhookSecret',
    'bkashAppKey',
    'bkashAppSecret',
    'bkashUsername',
    'bkashPassword',
    'bkashSandbox',
  ],
  distribution: ['headlessApiKey', 'headlessSecretKey', 'embedAllowedOrigins'],
  storefront: ['homepageMode', 'featuredProductSlug'],
  content: [
    'catalogEyebrow',
    'catalogTitle',
    'catalogDescription',
    'emptyCatalogTitle',
    'emptyCatalogMessage',
    'aboutTitle',
    'aboutBody',
    'faqTitle',
    'faqBody',
    'trustTitle',
    'trustBlock1Title',
    'trustBlock1Body',
    'trustBlock2Title',
    'trustBlock2Body',
    'trustBlock3Title',
    'trustBlock3Body',
  ],
  promotion: ['announcementText', 'announcementUrl'],
  social: ['socialWebsite', 'socialTwitter', 'socialInstagram', 'socialYoutube'],
  policies: ['footerText', 'termsUrl', 'privacyUrl'],
  delivery: ['defaultCurrency', 'downloadExpiryDays', 'downloadLimit'],
  email: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom'],
  team: [],
};

export const settingsSectionSaveLabel: Partial<Record<SettingsSectionId, string>> = {
  branding: 'Save branding',
  store: 'Save store settings',
  payments: 'Save payment settings',
  distribution: 'Save distribution settings',
  storefront: 'Save storefront layout',
  content: 'Save content blocks',
  promotion: 'Save promotion settings',
  social: 'Save social links',
  policies: 'Save policies',
  delivery: 'Save delivery rules',
  email: 'Save email settings',
};

export const buildSectionSettingsPayload = (
  sectionId: SettingsSectionId,
  currentSettings: SettingsMap,
  form: SettingsMap,
): SettingsMap => {
  const nextSettings = { ...currentSettings };
  for (const key of settingsSectionFields[sectionId]) {
    nextSettings[key] = form[key] ?? '';
  }
  return nextSettings;
};

export const validateSettingsSection = (sectionId: SettingsSectionId, form: SettingsMap): string[] =>
  validateSettingsForm(form, settingsSectionFields[sectionId]);

export const sectionHasSaveAction = (sectionId: SettingsSectionId) =>
  sectionId !== 'themes' && sectionId !== 'team' && settingsSectionFields[sectionId].length > 0;
