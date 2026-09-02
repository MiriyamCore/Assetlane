import { DEFAULT_LOCALE, type Locale } from './types';

let activeLocale: Locale = DEFAULT_LOCALE;

export const getActiveLocale = () => activeLocale;

export const setActiveLocale = (locale: Locale) => {
  activeLocale = locale;
};
