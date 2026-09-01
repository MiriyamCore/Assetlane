import { CreditCard, Download, Mail, Package, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useHeroCopy, useHomeLayout } from '@assetlane/theme-sdk/react';
import { HomeContentSections } from '../../components/storefront/HomeContentSections';
import { HeroCoverImage } from '../../components/storefront/HeroCoverImage';
import { CatalogSection } from '../../components/storefront/CatalogSection';
import { FeaturedProductSpotlight } from '../../components/storefront/FeaturedProductSpotlight';
import { ErrorPanel, InlineError, LoadingPanel, SuccessPanel } from '../../components/ui/States';
import { CheckoutPaymentMethods } from '../../components/storefront/CheckoutPaymentMethods';
import { SafeMarkdown } from '../../components/ui/SafeMarkdown';
import { ProductSpecsSection } from '../../components/storefront/ProductSpecsSection';
import { API_ROOT } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import type {
  CancelThemeProps,
  DownloadThemeProps,
  ProductThemeProps,
  StoreThemeDefinition,
  StorefrontThemeProps,
  SuccessThemeProps,
} from '../types';

function AtelierHomePage({ products, featuredProduct, loading, error, settings }: StorefrontThemeProps) {
  const layout = useHomeLayout();
  const hero = useHeroCopy();
  const productSection = <CatalogSection error={error} loading={loading} products={products} settings={settings} themeBase="atelier" />;

  return (
    <div className="container home-shell">
      {layout.showCatalogFirst ? productSection : null}
      <section className="hero-panel">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className="eyebrow">{settings.storeName}</span>
          <h1>{hero.headline}</h1>
          <p>{hero.subheadline}</p>
          <div className="hero-actions">
            <a className="primary-link" href="#products">
              {hero.primaryCtaLabel}
            </a>
            <Link className="secondary-link" to={layout.featuredProductLink}>
              {hero.secondaryCtaLabel}
            </Link>
          </div>
        </motion.div>

        {layout.showHeroHighlights ? (
          <motion.aside
            className="hero-facts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div className="fact-card">
              <ShieldCheck size={18} />
              <div>
                <strong>Secure delivery</strong>
                <span>Customers receive protected download access so your products stay private and easy to deliver.</span>
              </div>
            </div>
            <div className="fact-card">
              <CreditCard size={18} />
              <div>
                <strong>Fast checkout</strong>
                <span>Customers can pay quickly and get straight to their purchase.</span>
              </div>
            </div>
            <div className="fact-card">
              <Mail size={18} />
              <div>
                <strong>Post-purchase support</strong>
                <span>Delivery emails and support details give buyers a clear next step after checkout.</span>
              </div>
            </div>
          </motion.aside>
        ) : null}
        <HeroCoverImage settings={settings} />
      </section>
      {layout.showFeaturedFirst && featuredProduct ? (
        <FeaturedProductSpotlight
          body="Lead with a single release before customers browse the rest of the catalog."
          eyebrow="Featured product"
          product={featuredProduct}
          title="Spotlight a release"
          variant="atelier"
        />
      ) : null}
      {!layout.showCatalogFirst ? productSection : null}
      <HomeContentSections settings={settings} />
    </div>
  );
}

function AtelierProductPage({
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
  return (
    <div className="container detail-shell">
      <div className="detail-main">
        <div className="detail-media">
          {product.featuredImageUrl ? (
            <img src={product.featuredImageUrl} alt={product.title} />
          ) : (
            <div className="media-placeholder">
              <Package size={52} />
            </div>
          )}
        </div>

        <div className="detail-copy">
          <span className="eyebrow">Published product</span>
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
          <div className="rich-panel">
            <h3>Description</h3>
            <SafeMarkdown content={product.description} />
          </div>
          <ProductSpecsSection attributes={product.attributes || []} />
          {product.changelog ? (
            <div className="rich-panel">
              <h3>Changelog</h3>
              <p>{product.changelog}</p>
            </div>
          ) : null}
          {product.galleryImageUrls.length > 0 ? (
            <div className="gallery-grid">
              {product.galleryImageUrls.map((url) => (
                <img key={url} src={url} alt={product.title} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <aside className="checkout-card">
        <div className="price-label">Price</div>
        <div className="checkout-price">{formatMoney(product.price, product.currency)}</div>
        <div className="checkout-note">Secure checkout with expiring download links after purchase.</div>
        <form className="checkout-form" onSubmit={onCheckout}>
          <CheckoutPaymentMethods methods={paymentMethods} onChange={onPaymentMethodChange} value={paymentMethod} />
          <label>
            Name
            <input value={customerName} onChange={(event) => onCustomerNameChange(event.target.value)} placeholder="Optional" />
          </label>
          <label>
            Email
            <input required type="email" value={customerEmail} onChange={(event) => onCustomerEmailChange(event.target.value)} placeholder="you@example.com" />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? <Download className="spin" size={16} /> : <CreditCard size={16} />}
            <span>{submitting ? 'Redirecting' : 'Checkout'}</span>
          </button>
        </form>
        {error ? <InlineError message={error} /> : null}
        <div className="detail-meta">
          <div>
            <strong>Version</strong>
            <span>{product.version || 'Current release'}</span>
          </div>
          <div>
            <strong>Support</strong>
            <span>{settings.supportEmail}</span>
          </div>
          <div>
            <strong>Download rules</strong>
            <span>
              {settings.downloadLimit} downloads within {settings.downloadExpiryDays} days
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function AtelierSuccessPage({ settings, orderReference, receipt, receiptLoading }: SuccessThemeProps) {
  const downloadUrl = receipt?.status === 'paid' ? receipt.downloadUrl : undefined;
  const pending = receiptLoading || receipt?.status === 'pending';

  return (
    <div className="container narrow-shell">
      <SuccessPanel
        title="Payment completed"
        message={
          downloadUrl
            ? `Your purchase of ${receipt?.productTitle || 'your product'} is ready. We also emailed a secure download link from ${settings.supportEmail}.`
            : pending
              ? `We are confirming your payment. A download link will appear here and arrive by email from ${settings.supportEmail}.`
              : `Your purchase was captured successfully. We'll email a secure download link to you from ${settings.supportEmail}.`
        }
        {...(orderReference ? { detail: `Order reference: ${orderReference}` } : {})}
        {...(downloadUrl ? { downloadUrl } : {})}
        {...(pending ? { pending } : {})}
      />
    </div>
  );
}

function AtelierCancelPage({ productSlug }: CancelThemeProps) {
  return (
    <div className="container narrow-shell">
      <ErrorPanel
        title="Checkout canceled"
        message="Your payment was not completed. You can return to the product page and try again whenever you’re ready."
        action={
          productSlug ? (
            <Link className="secondary-link" to={`/product/${productSlug}`}>
              Return to product
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}

function AtelierDownloadPage({ payload, token }: DownloadThemeProps) {
  return (
    <div className="container narrow-shell">
      <section className="download-panel">
        <span className="eyebrow">Secure download</span>
        <h1>{payload.productTitle}</h1>
        <p>{payload.fileName || 'Private digital file'}</p>

        <div className="download-metrics">
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
            <strong>Expires</strong>
            <span>{payload.downloadExpiresAt ? new Date(payload.downloadExpiresAt).toLocaleString() : 'Not available'}</span>
          </div>
          <div>
            <strong>Status</strong>
            <span>{payload.status}</span>
          </div>
        </div>

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

export const atelierTheme: StoreThemeDefinition = {
  id: 'atelier',
  title: 'Atelier',
  description: 'Polished product studio with cool glass panels and a clean launch aesthetic.',
  HomePage: AtelierHomePage,
  ProductPage: AtelierProductPage,
  SuccessPage: AtelierSuccessPage,
  CancelPage: AtelierCancelPage,
  DownloadPage: AtelierDownloadPage,
};
