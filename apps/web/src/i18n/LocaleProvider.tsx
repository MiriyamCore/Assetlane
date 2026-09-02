import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translate } from './translate';
import { setActiveLocale } from './locale-state';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  htmlLangForLocale,
  normalizeLocale,
  type Locale,
} from './types';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const readStoredLocale = () => {
  try {
    return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
};

export function LocaleProvider({
  children,
  storeLocale,
}: {
  children: ReactNode;
  storeLocale?: string;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = readStoredLocale();
    if (stored !== DEFAULT_LOCALE || !storeLocale) {
      return stored;
    }
    return normalizeLocale(storeLocale);
  });

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Ignore storage failures in private browsing.
    }
  };

  useEffect(() => {
    setActiveLocale(locale);
    document.documentElement.lang = htmlLangForLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { locale, setLocale, t } = useLocale();
  return { locale, setLocale, t };
};
