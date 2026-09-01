import type { SettingsRecord } from '../types';
import { readSetting } from './settings';

export type FontPresetId =
  | 'theme-default'
  | 'match-body'
  | 'system'
  | 'inter'
  | 'ibm-plex-sans'
  | 'space-grotesk'
  | 'dm-sans'
  | 'plus-jakarta'
  | 'source-serif'
  | 'fraunces'
  | 'newsreader';

export type FontPreset = {
  id: FontPresetId;
  label: string;
  family: string;
  googleFamilies?: string;
};

export const FONT_PRESETS: FontPreset[] = [
  { id: 'theme-default', label: 'Theme default', family: '' },
  { id: 'system', label: 'System UI', family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  {
    id: 'inter',
    label: 'Inter',
    family: "'Inter', system-ui, sans-serif",
    googleFamilies: 'Inter:wght@400;500;600;700',
  },
  {
    id: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    family: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    googleFamilies: 'IBM+Plex+Sans:wght@400;500;600;700',
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: "'Space Grotesk', 'IBM Plex Sans', sans-serif",
    googleFamilies: 'Space+Grotesk:wght@500;600;700',
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    family: "'DM Sans', system-ui, sans-serif",
    googleFamilies: 'DM+Sans:wght@400;500;600;700',
  },
  {
    id: 'plus-jakarta',
    label: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', system-ui, sans-serif",
    googleFamilies: 'Plus+Jakarta+Sans:wght@400;500;600;700',
  },
  {
    id: 'source-serif',
    label: 'Source Serif 4',
    family: "'Source Serif 4', Georgia, serif",
    googleFamilies: 'Source+Serif+4:wght@400;600;700',
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    family: "'Fraunces', Georgia, serif",
    googleFamilies: 'Fraunces:wght@500;600;700',
  },
  {
    id: 'newsreader',
    label: 'Newsreader',
    family: "'Newsreader', Georgia, serif",
    googleFamilies: 'Newsreader:wght@400;500;600;700',
  },
];

export const BODY_FONT_PRESETS = FONT_PRESETS.filter((preset) => preset.id !== 'match-body');

export const HEADING_FONT_PRESETS: FontPreset[] = [
  { id: 'match-body', label: 'Match body font', family: '' },
  ...FONT_PRESETS,
];

export const getFontPreset = (id: string): FontPreset | undefined =>
  FONT_PRESETS.find((preset) => preset.id === id) ||
  HEADING_FONT_PRESETS.find((preset) => preset.id === id);

export const buildGoogleFontsUrl = (families: string[]) => {
  const uniqueFamilies = [...new Set(families.filter(Boolean))];
  if (!uniqueFamilies.length) {
    return '';
  }

  return `https://fonts.googleapis.com/css2?${uniqueFamilies.map((family) => `family=${family}`).join('&')}&display=swap`;
};

export type ResolvedTypography = {
  bodyFontFamily: string | null;
  headingFontFamily: string | null;
  googleFontsUrl: string;
  bodyFontPreset: string;
  headingFontPreset: string;
};

export const resolveTypography = (settings: SettingsRecord): ResolvedTypography => {
  const bodyFontPreset = readSetting(settings, 'bodyFontPreset', 'theme-default');
  const headingFontPreset = readSetting(settings, 'headingFontPreset', 'match-body');

  const bodyPreset = getFontPreset(bodyFontPreset);
  const headingPreset =
    headingFontPreset === 'match-body' ? bodyPreset : getFontPreset(headingFontPreset);

  const googleFamilies = [bodyPreset?.googleFamilies, headingPreset?.googleFamilies].filter(
    (value): value is string => Boolean(value),
  );

  return {
    bodyFontFamily: bodyPreset?.family || null,
    headingFontFamily: headingPreset?.family || null,
    googleFontsUrl: buildGoogleFontsUrl(googleFamilies),
    bodyFontPreset,
    headingFontPreset,
  };
};
