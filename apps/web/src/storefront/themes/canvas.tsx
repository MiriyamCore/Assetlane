import { CreditCard, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useHeroCopy,
  useProduct,
  useProductSite,
  useProductUrls,
  useThemeHomeContext,
} from '@assetlane/theme-sdk/react';
import { ErrorPanel, InlineError, SuccessPanel } from '../../components/ui/States';
import { CheckoutPaymentMethods } from '../../components/storefront/CheckoutPaymentMethods';
import { CheckoutExtras } from '../../components/storefront/CheckoutExtras';
import { SafeMarkdown } from '../../components/ui/SafeMarkdown';
import { ProductSpecsSection } from '../../components/storefront/ProductSpecsSection';
import { DownloadFileList } from '../../components/storefront/DownloadFileList';
import { CheckoutCustomerFields, checkoutSubmitLabel } from '../../components/storefront/CheckoutCustomerFields';
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

function CanvasHomePage({ loading, error, settings }: StorefrontThemeProps) {
  const { site, catalog, emptyCatalog, products, featuredProduct, about, faq, trust, flags, announcement } = useThemeHomeContext();
  const hero = useHeroCopy();

  return (
    <div className="canvas-page">
      {announcement ? (
        <p className="canvas-banner">
          {announcement.url ? (
            <a href={announcement.url} rel="noreferrer" target="_blank">
              {announcement.text}
            </a>
          ) : (
            announcement.text
          )}
        </p>
      ) : null}

      <header className="canvas-hero">
        {settings.heroImageUrl ? (
          <div className="canvas-hero-cover">
            <img alt="" className="canvas-hero-cover-image" src={settings.heroImageUrl} />
          </div>
        ) : null}
        <p className="canvas-kicker">{site.name}</p>
        <h1>{hero.headline || site.description || site.name}</h1>
        {hero.subheadline ? <p className="canvas-lede">{hero.subheadline}</p> : null}
        <div className="canvas-actions">
          <a className="primary-link" href="#products">
            {hero.primaryCtaLabel}
          </a>
          {featuredProduct ? (
            <Link className="secondary-link" to={`/product/${featuredProduct.slug}`}>
              {hero.secondaryCtaLabel}
            </Link>
          ) : null}
        </div>
      </header>

      {loading ? <p className="canvas-status">Loading products…</p> : null}
      {error ? <ErrorPanel message={error} /> : null}

      {featuredProduct ? (
        <section className="canvas-block">
          <h2>Featured</h2>
          <Link className="canvas-product-link" to={`/product/${featuredProduct.slug}`}>
            <strong>{featuredProduct.title}</strong>
            <span>{formatMoney(featuredProduct.price, featuredProduct.currency)}</span>
          </Link>
        </section>
      ) : null}

      <section className="canvas-block" id="products">
        <h2>{catalog.title}</h2>
        {catalog.description ? <p>{catalog.description}</p> : null}
        {products.length > 0 ? (
          <ul className="canvas-product-list">
            {products.map((product) => (
              <li key={product.id}>
                <Link to={`/product/${product.slug}`}>{product.title}</Link>
                <span>{formatMoney(product.price, product.currency)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{emptyCatalog.message}</p>
        )}
      </section>

      {flags.hasAbout ? (
        <section className="canvas-block">
          <h2>{about.title}</h2>
          <SafeMarkdown content={about.body} />
        </section>
      ) : null}

      {flags.hasFaq ? (
        <section className="canvas-block">
          <h2>{faq.title}</h2>
          <SafeMarkdown content={faq.body} />
        </section>
      ) : null}

      {flags.hasTrust ? (
        <section className="canvas-block">
          <h2>{trust.title}</h2>
          <ul className="canvas-trust-list">
            {trust.blocks.map((block, index) => (
              <li key={`${block.title}-${index}`}>
                {block.title ? <strong>{block.title}</strong> : null}
                {block.body ? <span>{block.body}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CanvasProductPage({
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
  checkoutExtras,
}: ProductThemeProps) {
  const product = useProduct();
  const site = useProductSite();
  const urls = useProductUrls();
  const { t } = useTranslation();

  return (
    <div className="canvas-page canvas-product-page">
      <Link className="secondary-link" to="/">
        ← {t('checkout.backToStore')}
      </Link>
      <header className="canvas-hero">
        <h1>{product.title}</h1>
        <p className="canvas-lede">{product.summary}</p>
        <p className="canvas-price">{formatMoney(product.price, product.currency)}</p>
      </header>

      <section className="canvas-block">
        <SafeMarkdown content={product.description} />
      </section>

      <ProductSpecsSection attributes={product.attributes || []} />

      <aside className="canvas-checkout">
        {checkoutExtras ? <CheckoutExtras {...checkoutExtras} /> : null}
        <form className="checkout-form" onSubmit={onCheckout}>
          {paymentMethods.length > 0 ? (
            <CheckoutPaymentMethods methods={paymentMethods} onChange={onPaymentMethodChange} value={paymentMethod} />
          ) : null}
          <CheckoutCustomerFields
            customerEmail={customerEmail}
            customerName={customerName}
            onCustomerEmailChange={onCustomerEmailChange}
            onCustomerNameChange={onCustomerNameChange}
          />
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? <Download className="spin" size={16} /> : <CreditCard size={16} />}
            <span>
              {checkoutSubmitLabel(t, submitting, {
                isFreeProduct: checkoutExtras?.isFreeProduct,
                finalPriceCents: checkoutExtras?.finalPriceCents,
              })}
            </span>
          </button>
        </form>
        {error ? <InlineError message={error} /> : null}
        <p className="canvas-meta">
          {t('checkout.supportMeta', {
            email: site.supportEmail,
            limit: site.downloadLimit,
            days: site.downloadExpiryDays,
          })}
        </p>
        <p className="canvas-meta">{t('checkout.productUrl', { url: urls.product })}</p>
      </aside>
    </div>
  );
}

function CanvasSuccessPage({ settings, orderReference, receipt, receiptLoading }: SuccessThemeProps) {
  const downloadUrl = receipt?.status === 'paid' ? receipt.downloadUrl : undefined;
  const pending = receiptLoading || receipt?.status === 'pending';
  const copy = useCheckoutSuccessCopy({
    supportEmail: settings.supportEmail,
    productTitle: receipt?.productTitle,
    downloadUrl,
    pending,
  });

  return (
    <div className="canvas-page">
      <SuccessPanel
        title={copy.title}
        message={copy.message}
        {...(orderReference ? { detail: `Order reference: ${orderReference}` } : {})}
        {...(downloadUrl ? { downloadUrl } : {})}
        {...(pending ? { pending } : {})}
      />
    </div>
  );
}

function CanvasCancelPage({ productSlug }: CancelThemeProps) {
  const { t } = useTranslation();

  return (
    <div className="canvas-page">
      <ErrorPanel
        title={t('checkout.checkoutCanceled')}
        message={t('checkout.cancelMessage')}
        action={
          productSlug ? (
            <Link className="secondary-link" to={`/product/${productSlug}`}>
              {t('checkout.returnToProduct')}
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}

function CanvasDownloadPage({ payload, token }: DownloadThemeProps) {
  const { t } = useTranslation();

  return (
    <div className="canvas-page">
      <h1>{payload.productTitle}</h1>
      {payload.canDownload ? (
        <DownloadFileList payload={payload} token={token} />
      ) : (
        <InlineError message={t('checkout.downloadUnavailable')} />
      )}
    </div>
  );
}

export const canvasTheme: StoreThemeDefinition = {
  id: 'canvas',
  title: 'Canvas',
  description: 'Minimal starter theme with no imposed layout — helpers and contexts only.',
  HomePage: CanvasHomePage,
  ProductPage: CanvasProductPage,
  SuccessPage: CanvasSuccessPage,
  CancelPage: CanvasCancelPage,
  DownloadPage: CanvasDownloadPage,
};
