import type { Locale } from '../types';
import { bnMessages } from './bn';
import { enMessages } from './en';

export const messagesByLocale = {
  en: enMessages,
  bn: bnMessages,
} as const;

export type TranslationKey =
  | `common.${keyof typeof enMessages.common}`
  | `nav.${keyof typeof enMessages.nav}`
  | `admin.${keyof typeof enMessages.admin}`
  | `auth.${keyof typeof enMessages.auth}`
  | `checkout.${keyof typeof enMessages.checkout}`
  | `library.${keyof typeof enMessages.library}`
  | `specs.${keyof typeof enMessages.specs}`;

export const getMessages = (locale: Locale) => messagesByLocale[locale];
