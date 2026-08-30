import type { CatalogCopy, EmptyCatalogCopy, SettingsRecord, SiteData, SocialLink } from '../types';
import { isTruthySetting, readSetting } from './settings';

export const getSocialLinks = (settings: SettingsRecord): SocialLink[] =>
  [
    { key: 'website', label: 'Website', url: readSetting(settings, 'socialWebsite') },
    { key: 'twitter', label: 'Twitter', url: readSetting(settings, 'socialTwitter') },
    { key: 'instagram', label: 'Instagram', url: readSetting(settings, 'socialInstagram') },
    { key: 'youtube', label: 'YouTube', url: readSetting(settings, 'socialYoutube') },
  ].filter((link) => Boolean(link.url.trim()));

export const getSite = (settings: SettingsRecord): SiteData => ({
  name: readSetting(settings, 'storeName', 'AssetLane Store'),
  description: readSetting(settings, 'storeDescription'),
  url: readSetting(settings, 'storeUrl'),
  supportEmail: readSetting(settings, 'supportEmail'),
  logoUrl: readSetting(settings, 'logoUrl'),
  faviconUrl: readSetting(settings, 'faviconUrl'),
  footerText: readSetting(settings, 'footerText'),
  currency: readSetting(settings, 'defaultCurrency', 'USD'),
  termsUrl: readSetting(settings, 'termsUrl'),
  privacyUrl: readSetting(settings, 'privacyUrl'),
  downloadExpiryDays: readSetting(settings, 'downloadExpiryDays', '7'),
  downloadLimit: readSetting(settings, 'downloadLimit', '5'),
  socialLinks: getSocialLinks(settings),
});

export const getCatalogCopy = (settings: SettingsRecord): CatalogCopy => ({
  eyebrow: readSetting(settings, 'catalogEyebrow', 'Available now'),
  title: readSetting(settings, 'catalogTitle', 'Shop the catalog'),
  description: readSetting(
    settings,
    'catalogDescription',
    'Browse published products and purchase with secure delivery.',
  ),
});

export const getEmptyCatalogCopy = (settings: SettingsRecord): EmptyCatalogCopy => ({
  title: readSetting(settings, 'emptyCatalogTitle', 'New releases coming soon'),
  message: readSetting(
    settings,
    'emptyCatalogMessage',
    'This storefront is getting ready. Check back soon for the first release.',
  ),
});

export const getHeroCopy = (settings: SettingsRecord) => ({
  headline: readSetting(settings, 'heroHeadline'),
  subheadline: readSetting(settings, 'heroSubheadline'),
  primaryCtaLabel: readSetting(settings, 'primaryCtaLabel', 'Browse products'),
  secondaryCtaLabel: readSetting(settings, 'secondaryCtaLabel', 'View featured'),
});

export const getAboutCopy = (settings: SettingsRecord) => ({
  title: readSetting(settings, 'aboutTitle', 'About this store'),
  body: readSetting(settings, 'aboutBody'),
});

export const hasAboutSection = (settings: SettingsRecord) => Boolean(readSetting(settings, 'aboutBody').trim());

export const hasAnnouncement = (settings: SettingsRecord) => Boolean(readSetting(settings, 'announcementText').trim());

export const getAnnouncement = (settings: SettingsRecord) => {
  if (!hasAnnouncement(settings)) {
    return null;
  }

  return {
    text: readSetting(settings, 'announcementText'),
    url: readSetting(settings, 'announcementUrl'),
  };
};

export const showPublicAdminLinks = (settings: SettingsRecord) => isTruthySetting(readSetting(settings, 'showPublicAdminLinks'));

export const getHomepageMode = (settings: SettingsRecord) => {
  const mode = readSetting(settings, 'homepageMode', 'hero-grid');
  if (mode === 'catalog-first' || mode === 'featured-first') {
    return mode;
  }
  return 'hero-grid';
};

export const showHeroHighlights = (settings: SettingsRecord) => isTruthySetting(readSetting(settings, 'showHeroHighlights'));
