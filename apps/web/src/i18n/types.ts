export type Locale = 'en' | 'bn';

export const LOCALES: Locale[] = ['en', 'bn'];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'assetlane_locale';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

export const htmlLangForLocale = (locale: Locale) => (locale === 'bn' ? 'bn-BD' : 'en');

export const intlLocaleForLocale = (locale: Locale) => (locale === 'bn' ? 'bn-BD' : 'en-US');

export const normalizeLocale = (value: string | null | undefined): Locale => {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'bn' || normalized === 'bn-bd' || normalized === 'bangla' || normalized === 'বাংলা') {
    return 'bn';
  }

  return DEFAULT_LOCALE;
};
