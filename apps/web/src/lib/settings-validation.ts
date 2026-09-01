import type { SettingsMap } from '../types/store';
import { isStoreCurrency } from './currency';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidUrl = (value: string) => {
  if (!value.trim()) return true;
  if (value.startsWith('mailto:')) return emailPattern.test(value.replace(/^mailto:/i, ''));
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidEmail = (value: string) => !value.trim() || emailPattern.test(value.trim());

const isValidColor = (value: string) => !value.trim() || /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());

const isValidPositiveInteger = (value: string) => {
  if (!value.trim()) return true;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0;
};

export const validateSettingsForm = (form: SettingsMap, fields?: string[]): string[] => {
  const errors: string[] = [];
  const shouldValidate = (key: string) => !fields || fields.includes(key);

  if (shouldValidate('storeName') && !form.storeName?.trim()) {
    errors.push('Store name is required.');
  }

  if (shouldValidate('supportEmail') && !isValidEmail(form.supportEmail || '')) {
    errors.push('Support email must be a valid email address.');
  }

  if (shouldValidate('storeUrl') && !isValidUrl(form.storeUrl || '')) {
    errors.push('Store URL must be a valid http or https link.');
  }

  if (shouldValidate('brandPrimaryColor') && !isValidColor(form.brandPrimaryColor || '')) {
    errors.push('Primary brand color must be a valid hex color.');
  }

  if (shouldValidate('brandSecondaryColor') && !isValidColor(form.brandSecondaryColor || '')) {
    errors.push('Secondary brand color must be a valid hex color.');
  }

  if (shouldValidate('downloadExpiryDays') && !isValidPositiveInteger(form.downloadExpiryDays || '')) {
    errors.push('Download expiry days must be a positive number.');
  }

  if (shouldValidate('downloadLimit') && !isValidPositiveInteger(form.downloadLimit || '')) {
    errors.push('Download limit must be a positive number.');
  }

  if (shouldValidate('defaultCurrency') && form.defaultCurrency && !isStoreCurrency(form.defaultCurrency)) {
    errors.push('Store currency must be one of BDT, USD, EUR, or GBP.');
  }

  for (const [label, key] of [
    ['Terms URL', 'termsUrl'],
    ['Privacy URL', 'privacyUrl'],
    ['Announcement URL', 'announcementUrl'],
    ['Website link', 'socialWebsite'],
    ['Twitter link', 'socialTwitter'],
    ['Instagram link', 'socialInstagram'],
    ['YouTube link', 'socialYoutube'],
  ] as const) {
    if (shouldValidate(key) && !isValidUrl(form[key] || '')) {
      errors.push(`${label} must be a valid http or https link.`);
    }
  }

  if (
    shouldValidate('announcementUrl') &&
    shouldValidate('announcementText') &&
    (form.announcementUrl || '').trim() &&
    !(form.announcementText || '').trim()
  ) {
    errors.push('Announcement text is required when an announcement link is set.');
  }

  return errors;
};
