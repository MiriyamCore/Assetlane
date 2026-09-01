import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Download, LoaderCircle, Save, Trash2, Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BODY_FONT_PRESETS, HEADING_FONT_PRESETS } from '@assetlane/theme-sdk';
import { AnnouncementPreview } from '../../components/storefront/AnnouncementBar';
import { WebhooksManager } from './WebhooksManager';
import { buildEmbedScriptSnippet } from '../../lib/embed-snippet';
import { apiFetch } from '../../lib/api';
import { STORE_CURRENCIES, STORE_CURRENCY_LABELS, normalizeStoreCurrency } from '../../lib/currency';
import { settingsFields } from '../../lib/product-form';
import { getSettingsFieldMeta, settingsFieldHelp } from '../../lib/settings-fields';
import { validateSettingsForm } from '../../lib/settings-validation';
import type { HomepageMode, Product, SettingsMap, StoreTheme } from '../../types/store';
import { InlineError, SuccessInline } from '../../components/ui/States';

type SettingsSectionId =
  | 'branding'
  | 'themes'
  | 'store'
  | 'payments'
  | 'distribution'
  | 'storefront'
  | 'content'
  | 'promotion'
  | 'social'
  | 'policies'
  | 'delivery'
  | 'email';

const settingsSections: { id: SettingsSectionId; label: string; description: string }[] = [
  { id: 'branding', label: 'Branding', description: 'Logo, colors, typography, and hero copy' },
  { id: 'themes', label: 'Themes', description: 'Install and activate storefront themes' },
  { id: 'store', label: 'Store', description: 'Name, mode, and support details' },
  { id: 'payments', label: 'Payments', description: 'Stripe, bKash, and checkout providers' },
  { id: 'distribution', label: 'Distribution', description: 'API keys and embed snippet' },
  { id: 'storefront', label: 'Storefront', description: 'Homepage layout and preview' },
  { id: 'content', label: 'Content', description: 'Catalog, about, and empty states' },
  { id: 'promotion', label: 'Promotion', description: 'Announcement bar' },
  { id: 'social', label: 'Social', description: 'Footer social links' },
  { id: 'policies', label: 'Policies', description: 'Footer and legal pages' },
  { id: 'delivery', label: 'Delivery', description: 'Currency and download rules' },
  { id: 'email', label: 'Email', description: 'SMTP for purchase receipts' },
];

export function StoreSettingsPage({
  settings,
  storeUrl,
  products,
  themes,
  onInstallTheme,
  onDownloadTheme,
  onRemoveTheme,
  onSaveBrandingAssets,
  onSaved,
}: {
  settings: SettingsMap;
  storeUrl: string;
  products: Product[];
  themes: StoreTheme[];
  onInstallTheme: (file: File) => Promise<string[] | undefined>;
  onDownloadTheme: (theme: StoreTheme) => void;
  onRemoveTheme: (theme: StoreTheme) => Promise<void>;
  onSaveBrandingAssets: (files: {
    logo: File | null;
    favicon: File | null;
    heroImage: File | null;
    removeLogo: boolean;
    removeFavicon: boolean;
    removeHeroImage: boolean;
  }) => Promise<void>;
  onSaved: (nextSettings: SettingsMap) => Promise<void>;
}) {
  const [form, setForm] = useState<SettingsMap>(settings);
  const [saving, setSaving] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busyThemeId, setBusyThemeId] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);
  const [removeHeroImage, setRemoveHeroImage] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('branding');
  const [testEmailTo, setTestEmailTo] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const updateField = (key: string, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const fieldLabel = (key: string) => settingsFields.find((field) => field.key === key)?.label || key;

  const renderSettingsField = (key: string, options?: { placeholder?: string; help?: string }) => {
    const meta = getSettingsFieldMeta(key);
    const help = options?.help ?? settingsFieldHelp[key];

    return (
      <label
        key={key}
        className={[meta.fullWidth ? 'form-field-full' : undefined, meta.compact ? 'form-field-color' : undefined]
          .filter(Boolean)
          .join(' ') || undefined}
      >
        {fieldLabel(key)}
        {meta.kind === 'textarea' ? (
          <textarea
            rows={meta.rows ?? 3}
            value={form[key] || ''}
            onChange={(event) => updateField(key, event.target.value)}
          />
        ) : (
          <input
            placeholder={options?.placeholder}
            type={meta.kind}
            value={form[key] || ''}
            onChange={(event) => updateField(key, event.target.value)}
          />
        )}
        {help ? <small>{help}</small> : null}
      </label>
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setError('');

    const validationErrors = validateSettingsForm(form);
    if (validationErrors.length > 0) {
      setError(validationErrors[0] ?? 'Please fix the highlighted settings before saving.');
      setSaving(false);
      return;
    }

    try {
      await onSaved(form);
      if (logoFile || faviconFile || heroImageFile || removeLogo || removeFavicon || removeHeroImage) {
        await onSaveBrandingAssets({
          favicon: faviconFile,
          logo: logoFile,
          heroImage: heroImageFile,
          removeLogo,
          removeFavicon,
          removeHeroImage,
        });
        setLogoFile(null);
        setFaviconFile(null);
        setHeroImageFile(null);
        setRemoveLogo(false);
        setRemoveFavicon(false);
        setRemoveHeroImage(false);
      }
      setSuccessMessage('Store settings saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const activateTheme = async (themeId: string) => {
    const nextForm = { ...form, storefrontTheme: themeId };
    setForm(nextForm);
    setSaving(true);
    setBusyThemeId(themeId);
    setSuccessMessage('');
    setError('');

    try {
      await onSaved(nextForm);
      setSuccessMessage('Theme activated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to activate theme.');
    } finally {
      setSaving(false);
      setBusyThemeId('');
    }
  };

  const installPackage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setInstalling(true);
    setSuccessMessage('');
    setError('');

    try {
      const warnings = await onInstallTheme(file);
      setSuccessMessage(
        warnings?.length ? `Theme installed. Notes: ${warnings.join(' ')}` : 'Theme package installed successfully.',
      );
    } catch (installError) {
      setError(installError instanceof Error ? installError.message : 'Unable to install theme package.');
    } finally {
      setInstalling(false);
      event.target.value = '';
    }
  };

  const removeTheme = async (theme: StoreTheme) => {
    if (!window.confirm(`Delete the "${theme.title}" theme package?`)) {
      return;
    }

    setBusyThemeId(theme.id);
    setSuccessMessage('');
    setError('');

    try {
      await onRemoveTheme(theme);
      if (form.storefrontTheme === theme.id) {
        setForm((current) => ({
          ...current,
          storefrontTheme: 'canvas',
        }));
      }
      setSuccessMessage('Theme package deleted.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to delete theme package.');
    } finally {
      setBusyThemeId('');
    }
  };

  const brandingFields = ['heroHeadline', 'heroSubheadline', 'primaryCtaLabel', 'secondaryCtaLabel', 'brandPrimaryColor', 'brandSecondaryColor'];
  const storefrontContentFields = [
    'catalogEyebrow',
    'catalogTitle',
    'catalogDescription',
    'emptyCatalogTitle',
    'emptyCatalogMessage',
    'aboutTitle',
    'aboutBody',
    'faqTitle',
    'faqBody',
    'trustTitle',
    'trustBlock1Title',
    'trustBlock1Body',
    'trustBlock2Title',
    'trustBlock2Body',
    'trustBlock3Title',
    'trustBlock3Body',
  ];
  const announcementFields = ['announcementText', 'announcementUrl'];
  const socialFields = ['socialWebsite', 'socialTwitter', 'socialInstagram', 'socialYoutube'];
  const storeIdentityFields = ['storeName', 'storeUrl', 'storeDescription', 'supportEmail', 'storeMode'];
  const paymentFields = [
    'paymentProviderMode',
    'stripeSecretKey',
    'stripePublicKey',
    'stripeWebhookSecret',
    'bkashAppKey',
    'bkashAppSecret',
    'bkashUsername',
    'bkashPassword',
    'bkashSandbox',
  ];
  const integrationFields = ['headlessApiKey', 'headlessSecretKey', 'embedAllowedOrigins'];
  const legalFields = ['footerText', 'termsUrl', 'privacyUrl'];
  const deliveryFields = ['defaultCurrency', 'downloadExpiryDays', 'downloadLimit'];
  const emailFields = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom'];
  const brandingPreviewLogo = settings.logoPath ? `/branding-assets/${settings.logoPath}` : '';
  const brandingPreviewFavicon = settings.faviconPath ? `/branding-assets/${settings.faviconPath}` : '';
  const brandingPreviewHero = settings.heroImagePath ? `/branding-assets/${settings.heroImagePath}` : '';
  const publishedProducts = products.filter((product) => product.status === 'published');
  const homepageMode = (form.homepageMode || 'hero-grid') as HomepageMode;
  const exampleProductSlug = publishedProducts[0]?.slug || 'your-product-slug';
  const embedSnippet = buildEmbedScriptSnippet(form.storeUrl || storeUrl, exampleProductSlug);

  const copyEmbedSnippet = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setSuccessMessage('Embed snippet copied to clipboard.');
    } catch {
      setError('Unable to copy snippet. Select and copy the code manually.');
    }
  };

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiFetch<{ message: string }>('/settings/test-email', {
        method: 'POST',
        body: JSON.stringify({ to: testEmailTo || form.supportEmail }),
      });
      setSuccessMessage(response.message);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to send test email.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const activeMeta = settingsSections.find((section) => section.id === activeSection) ?? settingsSections[0];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'branding':
        return (
          <>
            <div className="branding-upload-grid">
              <div className="branding-upload-card">
                <span className="branding-upload-label">Logo</span>
                {logoFile ? (
                  <span className="theme-meta">{logoFile.name}</span>
                ) : removeLogo ? (
                  <span className="theme-meta">Logo will be removed on save</span>
                ) : brandingPreviewLogo ? (
                  <img className="branding-preview-image" src={brandingPreviewLogo} alt="Current store logo" />
                ) : (
                  <span className="theme-meta">No logo uploaded yet</span>
                )}
                <input
                  accept="image/*"
                  className="sr-only"
                  id="branding-logo-input"
                  onChange={(event) => {
                    setLogoFile(event.target.files?.[0] || null);
                    setRemoveLogo(false);
                  }}
                  type="file"
                />
                <div className="button-stack">
                  <label className="secondary-button" htmlFor="branding-logo-input">
                    Upload logo
                  </label>
                  {brandingPreviewLogo || logoFile ? (
                    <button
                      className="secondary-button danger-button"
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setRemoveLogo(true);
                      }}
                    >
                      Remove logo
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="branding-upload-card">
                <span className="branding-upload-label">Favicon</span>
                {faviconFile ? (
                  <span className="theme-meta">{faviconFile.name}</span>
                ) : removeFavicon ? (
                  <span className="theme-meta">Favicon will be removed on save</span>
                ) : brandingPreviewFavicon ? (
                  <img className="branding-preview-icon" src={brandingPreviewFavicon} alt="Current favicon" />
                ) : (
                  <span className="theme-meta">No favicon uploaded yet</span>
                )}
                <input
                  accept="image/*"
                  className="sr-only"
                  id="branding-favicon-input"
                  onChange={(event) => {
                    setFaviconFile(event.target.files?.[0] || null);
                    setRemoveFavicon(false);
                  }}
                  type="file"
                />
                <div className="button-stack">
                  <label className="secondary-button" htmlFor="branding-favicon-input">
                    Upload favicon
                  </label>
                  {brandingPreviewFavicon || faviconFile ? (
                    <button
                      className="secondary-button danger-button"
                      type="button"
                      onClick={() => {
                        setFaviconFile(null);
                        setRemoveFavicon(true);
                      }}
                    >
                      Remove favicon
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="branding-upload-card branding-upload-card-wide">
                <span className="branding-upload-label">Hero cover image</span>
                {heroImageFile ? (
                  <span className="theme-meta">{heroImageFile.name}</span>
                ) : removeHeroImage ? (
                  <span className="theme-meta">Hero image will be removed on save</span>
                ) : brandingPreviewHero ? (
                  <img className="branding-preview-hero" src={brandingPreviewHero} alt="Current hero cover" />
                ) : (
                  <span className="theme-meta">No hero cover uploaded yet</span>
                )}
                <input
                  accept="image/*"
                  className="sr-only"
                  id="branding-hero-input"
                  onChange={(event) => {
                    setHeroImageFile(event.target.files?.[0] || null);
                    setRemoveHeroImage(false);
                  }}
                  type="file"
                />
                <div className="button-stack">
                  <label className="secondary-button" htmlFor="branding-hero-input">
                    Upload hero cover
                  </label>
                  {brandingPreviewHero || heroImageFile ? (
                    <button
                      className="secondary-button danger-button"
                      type="button"
                      onClick={() => {
                        setHeroImageFile(null);
                        setRemoveHeroImage(true);
                      }}
                    >
                      Remove hero cover
                    </button>
                  ) : null}
                </div>
                <small>Shown beside or behind the homepage hero. Recommended 1600×900 or wider.</small>
              </div>
            </div>

            <div className="form-grid">
              {settingsFields
                .filter((field) => brandingFields.includes(field.key) && !field.key.includes('Color'))
                .map((field) => renderSettingsField(field.key))}
            </div>

            <div className="form-color-row">
              {renderSettingsField('brandPrimaryColor')}
              {renderSettingsField('brandSecondaryColor')}
            </div>

            <div className="form-grid">
              <label>
                Body font
                <select
                  value={form.bodyFontPreset || 'theme-default'}
                  onChange={(event) => updateField('bodyFontPreset', event.target.value)}
                >
                  {BODY_FONT_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <small>{settingsFieldHelp.bodyFontPreset}</small>
              </label>
              <label>
                Heading font
                <select
                  value={form.headingFontPreset || 'match-body'}
                  onChange={(event) => updateField('headingFontPreset', event.target.value)}
                >
                  {HEADING_FONT_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <small>{settingsFieldHelp.headingFontPreset}</small>
              </label>
            </div>

            <label className="settings-toggle">
              <input
                checked={form.showHeroHighlights === 'true'}
                onChange={(event) => updateField('showHeroHighlights', event.target.checked ? 'true' : 'false')}
                type="checkbox"
              />
              <span>Show optional hero highlight cards on the homepage</span>
            </label>
          </>
        );

      case 'themes':
        return (
          <>
            <div className="theme-panel-header">
              <div>
                <h3 className="settings-panel-title">Zip themes</h3>
                <p>
                  Custom themes ship as zip packages — no app code changes. Theme developers follow{' '}
                  <code>THEMES.md</code> and <code>examples/themes/starter</code>, then the store owner uploads the zip here.
                </p>
                <p className="theme-meta">
                  Required: <code>theme.json</code> + <code>theme.css</code>. Optional: <code>layout.json</code>, <code>preview.svg</code>, <code>assets/</code>.
                </p>
              </div>
              <label className="secondary-button">
                {installing ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />}
                <span>{installing ? 'Installing...' : 'Upload theme zip'}</span>
                <input accept=".zip" className="sr-only" onChange={installPackage} type="file" />
              </label>
            </div>

            <div className="theme-picker-grid">
              {themes.map((theme) => {
                const isActive = form.storefrontTheme === theme.id;

                return (
                  <div key={theme.id} className={isActive ? `theme-preview-card ${theme.baseTheme} active` : `theme-preview-card ${theme.baseTheme}`}>
                    {theme.previewImageUrl ? (
                      <img className="theme-preview-image" src={theme.previewImageUrl} alt={theme.title} />
                    ) : (
                      <div className="theme-preview-placeholder">{theme.title}</div>
                    )}
                    <div className="theme-card-copy">
                      <strong>{theme.title}</strong>
                      <span>{theme.description}</span>
                      <span className="theme-meta">
                        {theme.source === 'package' ? 'Uploaded zip theme' : 'Built-in starter / reference'}
                      </span>
                      {theme.version ? <span className="theme-meta">Version {theme.version}</span> : null}
                    </div>
                    <div className="theme-card-actions">
                      <span className="subtle-chip">{theme.source === 'package' ? 'Zip package' : 'Built-in'}</span>
                      <button
                        className="primary-button"
                        disabled={saving || isActive || busyThemeId === theme.id}
                        type="button"
                        onClick={() => void activateTheme(theme.id)}
                      >
                        {isActive ? 'Active theme' : busyThemeId === theme.id ? 'Saving...' : 'Set active'}
                      </button>
                      {theme.source === 'package' && theme.downloadUrl ? (
                        <button className="secondary-button" type="button" onClick={() => onDownloadTheme(theme)}>
                          <Download size={16} />
                          <span>Export zip</span>
                        </button>
                      ) : null}
                      {theme.source === 'package' ? (
                        <button className="secondary-button danger-button" disabled={busyThemeId === theme.id} type="button" onClick={() => void removeTheme(theme)}>
                          <Trash2 size={16} />
                          <span>{busyThemeId === theme.id ? 'Deleting...' : 'Delete theme'}</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );

      case 'store':
        return (
          <>
            <div className="form-grid">
              {storeIdentityFields.map((fieldKey) => {
                if (fieldKey === 'storeMode') {
                  return (
                    <label key={fieldKey}>
                      Store mode
                      <select value={form.storeMode || 'hybrid'} onChange={(event) => updateField('storeMode', event.target.value)}>
                        <option value="hybrid">Hybrid (storefront + API)</option>
                        <option value="full">Full storefront</option>
                        <option value="headless">Headless API only</option>
                      </select>
                      <small>Headless hides the main storefront and keeps API/embed delivery paths.</small>
                    </label>
                  );
                }

                return renderSettingsField(fieldKey);
              })}
            </div>
            <label className="settings-toggle">
              <input
                checked={form.showPublicAdminLinks === 'true'}
                onChange={(event) => updateField('showPublicAdminLinks', event.target.checked ? 'true' : 'false')}
                type="checkbox"
              />
              <span>Show Admin and Login links on the public storefront navigation</span>
            </label>
          </>
        );

      case 'payments':
        return (
          <>
            <div className="settings-note-card">
              <strong>Payments</strong>
              <span>
                Enable Stripe for international cards and bKash for Bangladesh. bKash is available when the store currency is BDT. Use sandbox credentials while testing.
              </span>
            </div>
            <div className="form-grid">
              <label>
                Payment providers
                <select value={form.paymentProviderMode || 'both'} onChange={(event) => updateField('paymentProviderMode', event.target.value)}>
                  <option value="stripe">Stripe only</option>
                  <option value="bkash">bKash only</option>
                  <option value="both">Stripe + bKash</option>
                </select>
              </label>
              {paymentFields
                .filter((fieldKey) => fieldKey !== 'paymentProviderMode')
                .map((fieldKey) => {
                  if (fieldKey === 'bkashSandbox') {
                    return (
                      <label key={fieldKey} className="settings-toggle">
                        <input
                          checked={form.bkashSandbox === 'true' || form.bkashSandbox === '1'}
                          onChange={(event) => updateField('bkashSandbox', event.target.checked ? 'true' : 'false')}
                          type="checkbox"
                        />
                        <span>Use bKash sandbox environment</span>
                      </label>
                    );
                  }

                  return renderSettingsField(fieldKey);
                })}
            </div>
          </>
        );

      case 'distribution':
        return (
          <>
            <div className="form-grid">
              {integrationFields.map((fieldKey) => renderSettingsField(fieldKey))}
            </div>
            <div className="settings-note-card embed-snippet-block">
              <strong>JavaScript embed snippet</strong>
              <span>Paste this on any allowed external site. Replace the product slug or duplicate the div block for more products.</span>
              <pre>{embedSnippet}</pre>
              <button className="secondary-button" type="button" onClick={() => void copyEmbedSnippet()}>
                Copy snippet
              </button>
            </div>
            <WebhooksManager />
          </>
        );

      case 'storefront':
        return (
          <>
            <div className="settings-subgrid">
              <label>
                Homepage mode
                <select value={homepageMode} onChange={(event) => updateField('homepageMode', event.target.value)}>
                  <option value="hero-grid">Marketing first</option>
                  <option value="catalog-first">Product grid first</option>
                  <option value="featured-first">Featured product first</option>
                </select>
                <small>Pick whether visitors land on the hero, the catalog, or a single highlighted product first.</small>
              </label>

              <label>
                Featured product
                <select value={form.featuredProductSlug || ''} onChange={(event) => updateField('featuredProductSlug', event.target.value)}>
                  <option value="">No featured product selected</option>
                  {publishedProducts.map((product) => (
                    <option key={product.id} value={product.slug}>
                      {product.title}
                    </option>
                  ))}
                </select>
                <small>
                  Used by the featured product first mode. If nothing is selected, the storefront falls back to the first published product.
                </small>
              </label>
            </div>

            <div className="settings-note-card">
              <strong>Current mode behavior</strong>
              <span>
                {homepageMode === 'hero-grid'
                  ? 'Hero content appears first, followed by the product catalog.'
                  : homepageMode === 'catalog-first'
                    ? 'The storefront opens directly on the product grid before the hero section.'
                    : 'A single featured product is spotlighted before the rest of the catalog.'}
              </span>
            </div>

            <div className="settings-preview-card">
              <strong>Homepage preview</strong>
              <div className="settings-preview-hero">
                <span className="eyebrow">{form.storeName || 'Your store'}</span>
                <h4>{form.heroHeadline || 'Hero headline'}</h4>
                <p>{form.heroSubheadline || 'Hero subheadline preview'}</p>
              </div>
              <AnnouncementPreview text={form.announcementText || ''} url={form.announcementUrl || ''} />
            </div>
          </>
        );

      case 'content':
        return (
          <div className="form-grid">
            {settingsFields
              .filter((field) => storefrontContentFields.includes(field.key))
              .map((field) => renderSettingsField(field.key))}
          </div>
        );

      case 'promotion':
        return (
          <div className="form-grid">
            {announcementFields.map((fieldKey) => renderSettingsField(fieldKey))}
          </div>
        );

      case 'social':
        return <div className="form-grid">{socialFields.map((fieldKey) => renderSettingsField(fieldKey))}</div>;

      case 'policies':
        return <div className="form-grid">{legalFields.map((fieldKey) => renderSettingsField(fieldKey))}</div>;

      case 'delivery':
        return (
          <div className="form-grid">
            {deliveryFields.map((fieldKey) => {
              if (fieldKey === 'defaultCurrency') {
                return (
                  <label key={fieldKey}>
                    {fieldLabel(fieldKey)}
                    <select
                      value={normalizeStoreCurrency(form.defaultCurrency)}
                      onChange={(event) => updateField('defaultCurrency', event.target.value)}
                    >
                      {STORE_CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>
                          {STORE_CURRENCY_LABELS[currency]}
                        </option>
                      ))}
                    </select>
                    {settingsFieldHelp.defaultCurrency ? <small>{settingsFieldHelp.defaultCurrency}</small> : null}
                  </label>
                );
              }

              return renderSettingsField(fieldKey);
            })}
          </div>
        );

      case 'email':
        return (
          <>
            <div className="form-grid">{emailFields.map((fieldKey) => renderSettingsField(fieldKey))}</div>
            <div className="settings-note-card">
              <strong>Test SMTP delivery</strong>
              <span>Save your SMTP settings first, then send a test message to confirm buyer emails will work.</span>
              <div className="form-grid">
                <label>
                  Send test email to
                  <input
                    type="email"
                    value={testEmailTo}
                    onChange={(event) => setTestEmailTo(event.target.value)}
                    placeholder={form.supportEmail || 'support@yourstore.com'}
                  />
                </label>
              </div>
              <button className="secondary-button" disabled={sendingTestEmail} type="button" onClick={() => void sendTestEmail()}>
                {sendingTestEmail ? <LoaderCircle className="spin" size={16} /> : null}
                <span>{sendingTestEmail ? 'Sending…' : 'Send test email'}</span>
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form className="settings-workspace" onSubmit={submit}>
      <nav aria-label="Settings sections" className="settings-nav">
        <Link className="settings-nav-back" to="/admin">
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </Link>
        <span className="settings-nav-label">Sections</span>
        {settingsSections.map((section) => (
          <button
            key={section.id}
            className={activeSection === section.id ? 'settings-nav-item active' : 'settings-nav-item'}
            type="button"
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="settings-panel-main">
        <header className="settings-panel-header">
          <h2>{activeMeta?.label}</h2>
          <p>{activeMeta?.description}</p>
        </header>

        {error ? <InlineError message={error} /> : null}
        {successMessage ? <SuccessInline message={successMessage} /> : null}

        <div className="settings-panel-body">{renderSectionContent()}</div>

        <footer className="settings-panel-footer">
          <span className="settings-panel-footer-note">Changes apply across your storefront after saving.</span>
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}
            <span>Save settings</span>
          </button>
        </footer>
      </div>
    </form>
  );
}
