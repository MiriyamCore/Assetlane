import { catalogGridClass, resolveThemeBase, type ThemeBase as StoreThemeBase } from '@assetlane/theme-sdk';
import type { PublicSettings } from '../types/store';

export { catalogGridClass, type StoreThemeBase };

export function resolveStoreThemeBase(settings: Pick<PublicSettings, 'storefrontThemeBase'>): StoreThemeBase {
  return resolveThemeBase(settings.storefrontThemeBase);
}
