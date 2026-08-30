import { Request, Response } from 'express';
import { getSettingsMap, upsertSettings } from '../lib/settings';
import { getThemeById, listAvailableThemes } from '../lib/themes';
import { sanitizeFilename } from '../lib/storage';

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

    const settings = await upsertSettings(entries);
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
    const body = req.body as Record<string, string | undefined>;

    const entries: Record<string, string> = {};

    if (body.removeLogo === 'true') {
      entries.logoPath = '';
    }

    if (body.removeFavicon === 'true') {
      entries.faviconPath = '';
    }

    if (logoFile) {
      entries.logoPath = sanitizeFilename(logoFile.filename);
    }

    if (faviconFile) {
      entries.faviconPath = sanitizeFilename(faviconFile.filename);
    }

    const settings = await upsertSettings(entries);
    return res.json(settings);
  } catch (error) {
    console.error('updateBrandingAssets error', error);
    return res.status(500).json({ message: 'Unable to save branding assets.' });
  }
};
