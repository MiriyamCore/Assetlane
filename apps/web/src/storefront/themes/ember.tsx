import { motion } from 'framer-motion';
import { CreditCard, Download, Flame, Shield, Sparkles, Tag, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeroCopy, useHomeLayout } from '@assetlane/theme-sdk/react';
import { HomeContentSections } from '../../components/storefront/HomeContentSections';
import { HeroCoverImage } from '../../components/storefront/HeroCoverImage';
import { CatalogSection } from '../../components/storefront/CatalogSection';
import { FeaturedProductSpotlight } from '../../components/storefront/FeaturedProductSpotlight';
import { InlineError } from '../../components/ui/States';
import { CheckoutPaymentMethods } from '../../components/storefront/CheckoutPaymentMethods';
import { SafeMarkdown } from '../../components/ui/SafeMarkdown';
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

function EmberHomePage({ products, featuredProduct, loading, error, settings }: StorefrontThemeProps) {
  const layout = useHomeLayout();
  const hero = useHeroCopy();

  const productSection = <CatalogSection error={error} loading={loading} products={products} settings={settings} themeBase="ember" />;

  return (
    <div className="container home-shell home-shell-ember">
      {layout.showCatalogFirst ? productSection : null}
      <section className="ember-hero">
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
          <div className="ember-points">
            <div className="fact-card">
              <Flame size={18} />
              <div>
                <strong>Launch-ready energy</strong>
                <span>Make new releases feel timely, prominent, and easy for customers to notice.</span>
              </div>
            </div>
            <div className="fact-card">
              <Tag size={18} />
              <div>
                <strong>Organized catalog</strong>
                <span>Use tags and consistent product structure to guide customers through your catalog.</span>
              </div>
            </div>
            <div className="fact-card">
              <Sparkles size={18} />
              <div>
                <strong>Clear conversion path</strong>
                <span>Strong emphasis on featured products helps shoppers move quickly from interest to checkout.</span>
              </div>
            </div>
          </div>
        ) : null}
        <HeroCoverImage settings={settings} className="hero-cover hero-cover-ember" />
      </section>
      {layout.showFeaturedFirst && featuredProduct ? (
        <FeaturedProductSpotlight
          body="Put one launch, bundle, or timely product in front of shoppers before the full catalog."
          eyebrow="Featured drop"
          product={featuredProduct}
          title="Drive attention to one release"
          variant="ember"
        />
      ) : null}
      {!layout.showCatalogFirst ? productSection : null}
      <HomeContentSections settings={settings} />
    </div>
  );
}

function EmberProductPage({
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
    <div className="container detail-shell detail-shell-ember">
      <section className="ember-product-hero">
        <div className="detail-copy">
          <span className="eyebrow">Live release</span>
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
        </div>
        <div className="ember-launch-strip">
          <div>
            <strong>{formatMoney(product.price, product.currency)}</strong>
            <span>One-time purchase</span>
          </div>
          <div>
            <strong>{product.version || 'Current release'}</strong>
            <span>Version</span>
          </div>
          <div>
            <strong>{settings.downloadLimit}x</strong>
            <span>Download limit</span>
          </div>
        </div>
      </section>

      <div className="detail-main">
        <div className="detail-copy">
          <div className="rich-panel">
            <h3>What is included</h3>
            <SafeMarkdown content={product.description} />
          </div>
          {product.changelog ? (
            <div className="rich-panel">
              <h3>What changed</h3>
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

        <aside className="checkout-card checkout-card-ember">
          {product.featuredImageUrl ? (
            <img className="paper-feature-image" src={product.featuredImageUrl} alt={product.title} />
          ) : (
            <div className="media-placeholder">
              <Zap size={44} />
            </div>
          )}
          <div className="ember-points ember-points-compact">
            <div className="fact-card">
              <Shield size={18} />
              <div>
                <strong>Protected delivery</strong>
                <span>Secure, expiring links handled after payment.</span>
              </div>
            </div>
          </div>
          <form className="checkout-form" onSubmit={onCheckout}>
            <CheckoutPaymentMethods methods={paymentMethods} onChange={onPaymentMethodChange} value={paymentMethod} />
            <label>
              Buyer name
              <input value={customerName} onChange={(event) => onCustomerNameChange(event.target.value)} placeholder="Optional" />
            </label>
            <label>
              Receipt email
              <input required type="email" value={customerEmail} onChange={(event) => onCustomerEmailChange(event.target.value)} placeholder="you@example.com" />
            </label>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? <Download className="spin" size={16} /> : <CreditCard size={16} />}
              <span>{submitting ? 'Preparing checkout' : 'Buy now'}</span>
            </button>
          </form>
          {error ? <InlineError message={error} /> : null}
        </aside>
      </div>
    </div>
  );
}

function EmberSuccessPage({ settings, orderReference, receipt, receiptLoading }: SuccessThemeProps) {
  const downloadUrl = receipt?.status === 'paid' ? receipt.downloadUrl : undefined;
  const pending = receiptLoading || receipt?.status === 'pending';

  return (
    <div className="container narrow-shell">
      <section className="download-panel download-panel-ember">
        <span className="eyebrow">Order confirmed</span>
        <h1>{downloadUrl ? 'Your download is ready.' : pending ? 'Confirming payment…' : 'Your purchase is secured.'}</h1>
        <p>
          {downloadUrl
            ? `Your purchase of ${receipt?.productTitle || 'your product'} is ready. We also sent a secure link from ${settings.supportEmail}.`
            : pending
              ? `We are confirming your payment. A download link will appear here and arrive by email from ${settings.supportEmail}.`
              : `We're sending the download link from ${settings.supportEmail}. Keep the confirmation email for access and support.`}
        </p>
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
            Open secure download
          </a>
        ) : null}
      </section>
    </div>
  );
}

function EmberCancelPage({ productSlug }: CancelThemeProps) {
  return (
    <div className="container narrow-shell">
      <section className="download-panel download-panel-ember">
        <span className="eyebrow">Checkout canceled</span>
        <h1>The purchase flow was interrupted.</h1>
        <p>No charge went through. You can jump back in whenever you are ready.</p>
        {productSlug ? (
          <Link className="secondary-link" to={`/product/${productSlug}`}>
            Return to product
          </Link>
        ) : null}
      </section>
    </div>
  );
}

function EmberDownloadPage({ payload, token, settings }: DownloadThemeProps) {
  return (
    <div className="container narrow-shell">
      <section className="download-panel download-panel-ember">
        <span className="eyebrow">Download unlocked</span>
        <h1>{payload.productTitle}</h1>
        <p>{payload.fileName || 'Private digital file'}</p>

        <div className="paper-stat-row">
          <div>
            <strong>Attempts</strong>
            <span>
              {payload.downloadCount} / {payload.downloadLimit}
            </span>
          </div>
          <div>
            <strong>Recipient</strong>
            <span>{payload.customerEmail}</span>
          </div>
          <div>
            <strong>Support</strong>
            <span>{settings.supportEmail}</span>
          </div>
        </div>

        {payload.canDownload ? (
          <a className="primary-link wide-link" href={`${API_ROOT}/downloads/${token}/file`}>
            <Download size={18} />
            <span>Download now</span>
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

export const emberTheme: StoreThemeDefinition = {
  id: 'ember',
  title: 'Ember',
  description: 'High-energy merchandising theme with warm contrast and punchier call-to-actions.',
  HomePage: EmberHomePage,
  ProductPage: EmberProductPage,
  SuccessPage: EmberSuccessPage,
  CancelPage: EmberCancelPage,
  DownloadPage: EmberDownloadPage,
};
