import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildGoogleFontsUrl, resolveTypography } from '../helpers/typography';

describe('typography helpers', () => {
  it('keeps theme defaults when presets are unset', () => {
    const typography = resolveTypography({});

    assert.equal(typography.bodyFontFamily, null);
    assert.equal(typography.headingFontFamily, null);
    assert.equal(typography.googleFontsUrl, '');
  });

  it('loads google fonts for custom body and heading presets', () => {
    const typography = resolveTypography({
      bodyFontPreset: 'inter',
      headingFontPreset: 'fraunces',
    });

    assert.match(typography.bodyFontFamily || '', /Inter/);
    assert.match(typography.headingFontFamily || '', /Fraunces/);
    assert.match(typography.googleFontsUrl, /fonts\.googleapis\.com/);
    assert.match(typography.googleFontsUrl, /Inter/);
    assert.match(typography.googleFontsUrl, /Fraunces/);
  });

  it('matches heading font to body when requested', () => {
    const typography = resolveTypography({
      bodyFontPreset: 'dm-sans',
      headingFontPreset: 'match-body',
    });

    assert.equal(typography.bodyFontFamily, typography.headingFontFamily);
    assert.match(typography.googleFontsUrl, /DM\+Sans/);
  });

  it('deduplicates google font families', () => {
    const url = buildGoogleFontsUrl(['Inter:wght@400;500;600;700', 'Inter:wght@400;500;600;700']);

    assert.equal(url.split('family=').length - 1, 1);
  });
});
