import { atelierTheme } from './themes/atelier';
import { canvasTheme } from './themes/canvas';
import { emberTheme } from './themes/ember';
import { paperTheme } from './themes/paper';
import type { PublicSettings } from '../types/store';
import type { StoreThemeDefinition, StoreThemeId } from './types';

export const builtInStoreThemes: StoreThemeDefinition[] = [atelierTheme, paperTheme, emberTheme, canvasTheme];

export const builtInStoreThemeMap: Record<string, StoreThemeDefinition> = Object.fromEntries(
  builtInStoreThemes.map((theme) => [theme.id, theme]),
);

export const defaultStoreThemeId: StoreThemeId = 'canvas';

export const packageTheme: StoreThemeDefinition = {
  ...canvasTheme,
  id: 'package',
  title: 'Uploaded zip theme',
  description: 'Rendered by the AssetLane zip theme engine.',
};

export type StoreThemeSelector = Pick<PublicSettings, 'storefrontTheme' | 'storefrontThemeStylesheetUrl'>;

export const isUploadedThemePackage = (settings: StoreThemeSelector) => Boolean(settings.storefrontThemeStylesheetUrl);

export const getStoreTheme = (settings: StoreThemeSelector): StoreThemeDefinition => {
  if (isUploadedThemePackage(settings)) {
    return packageTheme;
  }

  return builtInStoreThemeMap[settings.storefrontTheme || defaultStoreThemeId] || canvasTheme;
};
