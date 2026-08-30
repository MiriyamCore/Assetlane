import { buildHomeContext, buildProductContext, buildThemeManifest } from '@assetlane/theme-sdk';
import type { ThemePackageLayout } from '@assetlane/theme-sdk';
import type { Product, PublicSettings } from '../types/store';

export const toSettingsRecord = (settings: PublicSettings) => settings as Record<string, string | undefined>;

const parsePackageLayout = (value: string | undefined): ThemePackageLayout | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(value) as ThemePackageLayout;
  } catch {
    return undefined;
  }
};

export const buildStoreThemeManifest = (settings: PublicSettings) => {
  const packageLayout = parsePackageLayout(settings.storefrontThemePackageLayout);
  const isPackage = Boolean(settings.storefrontThemeStylesheetUrl);

  return buildThemeManifest(
    {
      id: settings.storefrontTheme,
      title: settings.storefrontTheme,
      description: isPackage ? 'Uploaded zip theme package' : 'Active storefront theme',
      baseTheme: isPackage ? 'canvas' : settings.storefrontThemeBase || settings.storefrontTheme,
      source: isPackage ? 'package' : 'bundled',
      ...(settings.storefrontThemeStylesheetUrl ? { stylesheetUrl: settings.storefrontThemeStylesheetUrl } : {}),
      ...(packageLayout ? { packageLayout } : {}),
    },
    toSettingsRecord(settings),
  );
};

export const buildStoreHomeContext = (input: {
  settings: PublicSettings;
  products: Product[];
  loading?: boolean;
  error?: string;
}) =>
  buildHomeContext({
    settings: toSettingsRecord(input.settings),
    products: input.products,
    theme: buildStoreThemeManifest(input.settings),
    ...(input.loading !== undefined ? { loading: input.loading } : {}),
    ...(input.error !== undefined ? { error: input.error } : {}),
  });

export const buildStoreProductContext = (input: { settings: PublicSettings; product: Product }) =>
  buildProductContext({
    settings: toSettingsRecord(input.settings),
    product: input.product,
    theme: buildStoreThemeManifest(input.settings),
  });
