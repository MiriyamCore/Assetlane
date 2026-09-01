import { useEffect, useMemo, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { resolveTypography } from '@assetlane/theme-sdk';
import Navbar from './Navbar';
import { AnnouncementBar } from './storefront/AnnouncementBar';
import { SocialLinks } from './storefront/SocialLinks';
import { resolveStoreThemeBase } from '../lib/storefront-theme';
import { defaultSettings } from '../lib/product-form';
import { isTruthySetting } from '../lib/storefront-content';
import { defaultStoreThemeId } from '../storefront/catalog';
import type { PublicSettings } from '../types/store';

type StorefrontLayoutProps = {
  settings: PublicSettings;
  embed?: boolean;
  children?: ReactNode;
};

export function StorefrontLayout({ settings, embed = false, children }: StorefrontLayoutProps) {
  const themeBase = resolveStoreThemeBase(settings);
  const themeId = settings.storefrontTheme || defaultStoreThemeId;
  const typography = useMemo(() => resolveTypography(settings), [settings]);

  useEffect(() => {
    document.body.dataset.surface = 'storefront';
    document.body.dataset.theme = themeBase;
    document.body.dataset.storeTheme = themeId;
    return () => {
      delete document.body.dataset.surface;
      delete document.body.dataset.theme;
      delete document.body.dataset.storeTheme;
    };
  }, [themeBase, themeId]);

  useEffect(() => {
    const linkId = 'assetlane-theme-package';
    const existingLink = document.getElementById(linkId);

    if (!settings.storefrontThemeStylesheetUrl) {
      existingLink?.remove();
      return;
    }

    const link = existingLink instanceof HTMLLinkElement ? existingLink : document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = settings.storefrontThemeStylesheetUrl;

    if (!existingLink) {
      document.head.appendChild(link);
    }

    return () => {
      existingLink?.remove();
    };
  }, [settings.storefrontThemeStylesheetUrl]);

  useEffect(() => {
    const linkId = 'assetlane-storefront-fonts';
    const existingLink = document.getElementById(linkId);

    if (!typography.googleFontsUrl) {
      existingLink?.remove();
      return;
    }

    const link = existingLink instanceof HTMLLinkElement ? existingLink : document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = typography.googleFontsUrl;

    if (!existingLink) {
      document.head.appendChild(link);
    }

    return () => {
      link.remove();
    };
  }, [typography.googleFontsUrl]);

  const storefrontStyle = {
    ['--brand-primary' as string]: settings.brandPrimaryColor || defaultSettings.brandPrimaryColor,
    ['--brand-secondary' as string]: settings.brandSecondaryColor || defaultSettings.brandSecondaryColor,
    ...(typography.bodyFontFamily ? { ['--font-body' as string]: typography.bodyFontFamily } : {}),
    ...(typography.headingFontFamily ? { ['--font-display' as string]: typography.headingFontFamily } : {}),
  };

  return (
    <div
      className={embed ? 'storefront-shell storefront-shell-embed' : 'storefront-shell'}
      data-store-theme={themeId}
      data-theme={themeBase}
      style={storefrontStyle}
    >
      {!embed ? <AnnouncementBar settings={settings} /> : null}
      {!embed ? (
        <Navbar
          logoUrl={settings.logoUrl}
          showAdminLinks={isTruthySetting(settings.showPublicAdminLinks)}
          storeName={settings.storeName}
          themeBase={themeBase}
        />
      ) : null}
      <main className={`main-shell main-shell-${themeBase}`}>{children || <Outlet />}</main>
      {!embed ? (
        <footer className={`site-footer site-footer-${themeBase}`}>
          <div className="container footer-shell">
            <div>
              <div className="footer-brand">
                {settings.logoUrl ? <img className="brand-logo brand-logo-small" src={settings.logoUrl} alt={settings.storeName} /> : null}
                <strong>{settings.storeName}</strong>
              </div>
              <p>{settings.footerText}</p>
            </div>
            <div className="footer-links">
              <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
              {settings.privacyUrl ? (
                <a href={settings.privacyUrl} rel="noreferrer" target="_blank">
                  Privacy
                </a>
              ) : null}
              {settings.termsUrl ? (
                <a href={settings.termsUrl} rel="noreferrer" target="_blank">
                  Terms
                </a>
              ) : null}
              <SocialLinks className="social-links footer-social-links" settings={settings} />
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
