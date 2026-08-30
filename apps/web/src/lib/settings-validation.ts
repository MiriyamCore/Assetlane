import type { SettingsMap } from '../types/store';

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

export const validateSettingsForm = (form: SettingsMap): string[] => {
  const errors: string[] = [];

  if (!form.storeName?.trim()) {
    errors.push('Store name is required.');
  }

  if (!isValidEmail(form.supportEmail || '')) {
    errors.push('Support email must be a valid email address.');
  }

  if (!isValidUrl(form.storeUrl || '')) {
    errors.push('Store URL must be a valid http or https link.');
  }

  if (!isValidColor(form.brandPrimaryColor || '')) {
    errors.push('Primary brand color must be a valid hex color.');
  }

  if (!isValidColor(form.brandSecondaryColor || '')) {
    errors.push('Secondary brand color must be a valid hex color.');
  }

  if (!isValidPositiveInteger(form.downloadExpiryDays || '')) {
    errors.push('Download expiry days must be a positive number.');
  }

  if (!isValidPositiveInteger(form.downloadLimit || '')) {
    errors.push('Download limit must be a positive number.');
  }

  for (const [label, value] of [
    ['Terms URL', form.termsUrl],
    ['Privacy URL', form.privacyUrl],
    ['Announcement URL', form.announcementUrl],
    ['Website link', form.socialWebsite],
    ['Twitter link', form.socialTwitter],
    ['Instagram link', form.socialInstagram],
    ['YouTube link', form.socialYoutube],
  ] as const) {
    if (!isValidUrl(value || '')) {
      errors.push(`${label} must be a valid http or https link.`);
    }
  }

  if ((form.announcementUrl || '').trim() && !(form.announcementText || '').trim()) {
    errors.push('Announcement text is required when an announcement link is set.');
  }

  return errors;
};
