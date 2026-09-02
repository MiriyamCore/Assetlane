import { motion } from 'framer-motion';
import { ArrowRight, Download, LockKeyhole, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeroCopy, useHomeLayout } from '@assetlane/theme-sdk/react';
import { HomeContentSections } from '../../components/storefront/HomeContentSections';
import { HeroCoverImage } from '../../components/storefront/HeroCoverImage';
import { CatalogSection } from '../../components/storefront/CatalogSection';
import { FeaturedProductSpotlight } from '../../components/storefront/FeaturedProductSpotlight';
import { InlineError } from '../../components/ui/States';
import { CheckoutPaymentMethods } from '../../components/storefront/CheckoutPaymentMethods';
import { CheckoutCustomerFields, checkoutSubmitLabel } from '../../components/storefront/CheckoutCustomerFields';
import { SafeMarkdown } from '../../components/ui/SafeMarkdown';
import { ProductSpecsSection } from '../../components/storefront/ProductSpecsSection';
import { API_ROOT } from '../../lib/api';
import { useCheckoutSuccessCopy } from '../../lib/checkout-success';
import { formatMoney } from '../../lib/format';
import { useTranslation } from '../../i18n/LocaleProvider';
import type {
  CancelThemeProps,
  DownloadThemeProps,
  ProductThemeProps,
  StoreThemeDefinition,
  StorefrontThemeProps,
  SuccessThemeProps,
} from '../types';

function PaperHomePage({ products, featuredProduct, loading, error, settings }: StorefrontThemeProps) {
  const layout = useHomeLayout();
  const hero = useHeroCopy();

  const productSection = (
    <CatalogSection error={error} loading={loading} products={products} settings={settings} themeBase="paper" />
  );

  return (
    <div className="container home-shell home-shell-paper">
      {layout.showCatalogFirst ? productSection : null}
      <section className="paper-hero">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className="eyebrow">{settings.storeName}</span>
          <h1>{hero.headline}</h1>
        </motion.div>
        <div className="paper-hero-grid">
          <div className="detail-copy">
            <p>{hero.subheadline}</p>
            <div className="hero-actions">
              <a className="primary-link" href="#products">
                {hero.primaryCtaLabel}
              </a>
              <Link className="secondary-link" to={layout.featuredProductLink}>
                {hero.secondaryCtaLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="paper-callout">
            <strong>{settings.storeName}</strong>
            <span>{settings.footerText}</span>
            <span>{settings.supportEmail}</span>
          </div>
          <HeroCoverImage settings={settings} className="hero-cover hero-cover-paper" />
        </div>
      </section>
      {layout.showFeaturedFirst && featuredProduct ? (
        <FeaturedProductSpotlight
          body="Start the page with one recommended release before moving into the broader catalog."
          eyebrow="Featured release"
          product={featuredProduct}
          title="Lead with one product"
          variant="paper"
        />
      ) : null}
      {!layout.showCatalogFirst ? productSection : null}
      <HomeContentSections settings={settings} />
    </div>
  );
}

function PaperProductPage({
  product,
  settings,
  customerEmail,
  customerName,
  submitting,
  error,
  paymentMethod,
  paymentMethods,
  onPaymentMethodChange,
  onCustomerEmailChange,
  onCustomerNameChange,
  onCheckout,
}: ProductThemeProps) {
  const { t } = useTranslation();

  return (
    <div className="container detail-shell detail-shell-paper">
      <section className="detail-main paper-detail-main">
        <div className="detail-copy">
          <span className="eyebrow">Editorial release</span>
          <h1>{product.title}</h1>
          <p className="detail-summary">{product.summary}</p>
          {product.tags.length > 0 ? (
            <div className="tag-row">
              {product.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="paper-stat-row">
            <div>
              <strong>Price</strong>
              <span>{formatMoney(product.price, product.currency)}</span>
            </div>
            <div>
              <strong>Version</strong>
              <span>{product.version || 'Current release'}</span>
            </div>
            <div>
              <strong>Support</strong>
              <span>{settings.supportEmail}</span>
            </div>
          </div>
          <div className="rich-panel">
            <h3>Overview</h3>
            <SafeMarkdown content={product.description} />
          </div>
          <ProductSpecsSection attributes={product.attributes || []} />
          {product.changelog ? (
            <div className="rich-panel">
              <h3>Release notes</h3>
              <p>{product.changelog}</p>
            </div>
          ) : null}
        </div>

        <aside className="checkout-card checkout-card-paper">
          {product.featuredImageUrl ? <img className="paper-feature-image" src={product.featuredImageUrl} alt={product.title} /> : null}
          <div className="paper-note-row">
            <div className="paper-note">
              <ReceiptText size={16} />
              <span>{t('checkout.secureCheckoutNote')}</span>
            </div>
            <div className="paper-note">
              <LockKeyhole size={16} />
              <span>
                {t('checkout.supportMeta', {
                  email: settings.supportEmail,
                  limit: settings.downloadLimit,
                  days: settings.downloadExpiryDays,
                })}
              </span>
            </div>
          </div>
          <form className="checkout-form" onSubmit={onCheckout}>
            <CheckoutPaymentMethods methods={paymentMethods} onChange={onPaymentMethodChange} value={paymentMethod} />
            <CheckoutCustomerFields
              customerEmail={customerEmail}
              customerName={customerName}
              onCustomerEmailChange={onCustomerEmailChange}
              onCustomerNameChange={onCustomerNameChange}
            />
            <button className="primary-button" disabled={submitting} type="submit">
              <span>{checkoutSubmitLabel(t, submitting)}</span>
              <ArrowRight size={16} />
            </button>
          </form>
          {error ? <InlineError message={error} /> : null}
        </aside>
      </section>

      {product.galleryImageUrls.length > 0 ? (
        <section className="gallery-grid gallery-grid-paper">
          {product.galleryImageUrls.map((url) => (
            <img key={url} src={url} alt={product.title} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

function PaperSuccessPage({ settings, orderReference, receipt, receiptLoading }: SuccessThemeProps) {
  const { t } = useTranslation();
  const downloadUrl = receipt?.status === 'paid' ? receipt.downloadUrl : undefined;
  const pending = receiptLoading || receipt?.status === 'pending';
  const copy = useCheckoutSuccessCopy({
    supportEmail: settings.supportEmail,
    productTitle: receipt?.productTitle,
    downloadUrl,
    pending,
  });

  return (
    <div className="container narrow-shell">
      <section className="download-panel download-panel-paper">
        <span className="eyebrow">{t('checkout.paymentCompleted')}</span>
        <h1>{copy.title}</h1>
        <p>{copy.message}</p>
        <div className="paper-stat-row">
          <div>
            <strong>Store</strong>
            <span>{settings.storeName}</span>
          </div>
          {orderReference ? (
            <div>
              <strong>Order reference</strong>
              <span>{orderReference}</span>
            </div>
          ) : null}
        </div>
        {downloadUrl ? (
          <a className="primary-link" href={downloadUrl}>
            {t('common.openSecureDownload')}
          </a>
        ) : null}
      </section>
    </div>
  );
}

function PaperCancelPage({ productSlug }: CancelThemeProps) {
  const { t } = useTranslation();

  return (
    <div className="container narrow-shell">
      <section className="download-panel download-panel-paper">
        <span className="eyebrow">{t('checkout.checkoutCanceled')}</span>
        <h1>{t('checkout.checkoutCanceled')}</h1>
        <p>{t('checkout.cancelMessage')}</p>
        {productSlug ? (
          <Link className="secondary-link" to={`/product/${productSlug}`}>
            {t('checkout.returnToProduct')}
          </Link>
        ) : null}
      </section>
    </div>
  );
}

function PaperDownloadPage({ payload, token, settings }: DownloadThemeProps) {
  return (
    <div className="container narrow-shell">
      <section className="download-panel download-panel-paper">
        <span className="eyebrow">Private file delivery</span>
        <h1>{payload.productTitle}</h1>
        <p>{payload.fileName || 'Private digital file'}</p>

        <div className="paper-stat-row">
          <div>
            <strong>Recipient</strong>
            <span>{payload.customerEmail}</span>
          </div>
          <div>
            <strong>Attempts</strong>
            <span>
              {payload.downloadCount} / {payload.downloadLimit}
            </span>
          </div>
          <div>
            <strong>Support</strong>
            <span>{settings.supportEmail}</span>
          </div>
        </div>

        <p className="checkout-note">
          Expires {payload.downloadExpiresAt ? new Date(payload.downloadExpiresAt).toLocaleString() : 'Not available'}.
        </p>

        {payload.canDownload ? (
          <a className="primary-link wide-link" href={`${API_ROOT}/downloads/${token}/file`}>
            <Download size={18} />
            <span>Download file</span>
          </a>
        ) : (
          <InlineError
            message={
              payload.isExpired
                ? 'This link has expired.'
                : payload.isLimitReached
                  ? 'This purchase has reached its download limit.'
                  : 'This purchase is not currently eligible for download.'
            }
          />
        )}
      </section>
    </div>
  );
}

export const paperTheme: StoreThemeDefinition = {
  id: 'paper',
  title: 'Paper',
  description: 'Soft editorial storefront with warm surfaces, darker ink, and a calmer feel.',
  HomePage: PaperHomePage,
  ProductPage: PaperProductPage,
  SuccessPage: PaperSuccessPage,
  CancelPage: PaperCancelPage,
  DownloadPage: PaperDownloadPage,
};
