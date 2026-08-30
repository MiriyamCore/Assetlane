import type { SettingsRecord } from '../types';

export const readSetting = (settings: SettingsRecord, key: string, fallback = '') =>
  typeof settings[key] === 'string' && settings[key] !== undefined ? settings[key]! : fallback;

export const isTruthySetting = (value: string | undefined) => value === 'true' || value === '1' || value === 'yes';
