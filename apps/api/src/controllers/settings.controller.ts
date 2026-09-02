import { Request, Response } from 'express';
import { normalizeStoreCurrency, isStoreCurrency } from '../lib/currency';
import prisma from '../lib/prisma';
import { getSettingsMap, upsertSettings } from '../lib/settings';
import { getThemeById, listAvailableThemes } from '../lib/themes';
import { sanitizeFilename } from '../lib/storage';
import { sendTestEmail } from '../services/email.service';

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
  'heroImagePath',
  'brandPrimaryColor',
  'brandSecondaryColor',
  'bodyFontPreset',
  'headingFontPreset',
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
  'faqTitle',
  'faqBody',
  'trustTitle',
  'trustBlock1Title',
  'trustBlock1Body',
  'trustBlock2Title',
  'trustBlock2Body',
  'trustBlock3Title',
  'trustBlock3Body',
  'announcementText',
  'announcementUrl',
  'socialWebsite',
  'socialTwitter',
  'socialInstagram',
  'socialYoutube',
  'showPublicAdminLinks',
  'storeLocale',
  'storefrontTheme',
] as const;

const toPublicAssetUrl = (value: string | undefined, basePath: string) => {
  if (!value) return '';
  return `/${basePath}/${value.replace(/^branding\//, '').replace(/^\/+/, '')}`;
};

export const getPublicSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getSettingsMap();
    const activeTheme = getThemeById(settings.storefrontTheme);
    const response = {
      ...Object.fromEntries(publicSettingKeys.map((key) => [key, settings[key] ?? ''])),
      storefrontTheme: activeTheme.id,
      storefrontThemeBase: activeTheme.baseTheme,
      storefrontThemeStylesheetUrl: activeTheme.stylesheetUrl || '',
      storefrontThemePackageLayout: activeTheme.packageLayout ? JSON.stringify(activeTheme.packageLayout) : '',
      logoUrl: toPublicAssetUrl(settings.logoPath, 'branding-assets'),
      faviconUrl: toPublicAssetUrl(settings.faviconPath, 'branding-assets'),
      heroImageUrl: toPublicAssetUrl(settings.heroImagePath, 'branding-assets'),
    };
    return res.json(response);
  } catch (error) {
    console.error('getPublicSettings error', error);
    return res.status(500).json({ message: 'Unable to fetch public settings.' });
  }
};

export const getAvailableThemes = async (_req: Request, res: Response) => {
  try {
    return res.json({ themes: listAvailableThemes() });
  } catch (error) {
    console.error('getAvailableThemes error', error);
    return res.status(500).json({ message: 'Unable to fetch available themes.' });
  }
};

export const getAdminSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getSettingsMap();
    return res.json(settings);
  } catch (error) {
    console.error('getAdminSettings error', error);
    return res.status(500).json({ message: 'Unable to fetch settings.' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const payload = req.body as Record<string, string | number | undefined>;
    const entries = Object.fromEntries(
      Object.entries(payload)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );

    if (entries.defaultCurrency && !isStoreCurrency(entries.defaultCurrency)) {
      return res.status(400).json({ message: 'Store currency must be one of BDT, USD, EUR, or GBP.' });
    }

    const currentSettings = await getSettingsMap();
    const nextCurrency = entries.defaultCurrency
      ? normalizeStoreCurrency(entries.defaultCurrency)
      : normalizeStoreCurrency(currentSettings.defaultCurrency);

    if (entries.defaultCurrency) {
      entries.defaultCurrency = nextCurrency;
    }

    const settings = await upsertSettings(entries);

    if (entries.defaultCurrency && nextCurrency !== normalizeStoreCurrency(currentSettings.defaultCurrency)) {
      await prisma.product.updateMany({
        data: { currency: nextCurrency },
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error('updateSettings error', error);
    return res.status(500).json({ message: 'Unable to save settings.' });
  }
};

export const updateBrandingAssets = async (req: Request, res: Response) => {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const logoFile = files?.logo?.[0] ?? null;
    const faviconFile = files?.favicon?.[0] ?? null;
    const heroImageFile = files?.heroImage?.[0] ?? null;
    const body = req.body as Record<string, string | undefined>;

    const entries: Record<string, string> = {};

    if (body.removeLogo === 'true') {
      entries.logoPath = '';
    }

    if (body.removeFavicon === 'true') {
      entries.faviconPath = '';
    }

    if (body.removeHeroImage === 'true') {
      entries.heroImagePath = '';
    }

    if (logoFile) {
      entries.logoPath = sanitizeFilename(logoFile.filename);
    }

    if (faviconFile) {
      entries.faviconPath = sanitizeFilename(faviconFile.filename);
    }

    if (heroImageFile) {
      entries.heroImagePath = sanitizeFilename(heroImageFile.filename);
    }

    const settings = await upsertSettings(entries);
    return res.json(settings);
  } catch (error) {
    console.error('updateBrandingAssets error', error);
    return res.status(500).json({ message: 'Unable to save branding assets.' });
  }
};

export const postTestEmail = async (req: Request, res: Response) => {
  try {
    const settings = await getSettingsMap();
    const to = String((req.body as { to?: string }).to || settings.supportEmail || '').trim();

    if (!to) {
      return res.status(400).json({ message: 'A recipient email address is required.' });
    }

    await sendTestEmail(to);
    return res.json({ success: true, message: `Test email sent to ${to}.` });
  } catch (error) {
    console.error('postTestEmail error', error);
    const message = error instanceof Error ? error.message : 'Unable to send test email.';
    return res.status(400).json({ message });
  }
};
