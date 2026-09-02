import { getMessages } from './messages';
import type { Locale } from './types';

const resolvePath = (tree: Record<string, unknown>, key: string): string | undefined => {
  const parts = key.split('.');
  let current: unknown = tree;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
};

export const translate = (locale: Locale, key: string, vars?: Record<string, string | number>) => {
  const template = resolvePath(getMessages(locale) as Record<string, unknown>, key) ?? key;

  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce((result, [name, value]) => {
    return result.replaceAll(`{{${name}}}`, String(value));
  }, template);
};
