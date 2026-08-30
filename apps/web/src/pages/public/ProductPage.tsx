import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ThemeProductProvider } from '@assetlane/theme-sdk/react';
import { apiFetch } from '../../lib/api';
import { buildStoreProductContext } from '../../lib/theme-context';
import { ErrorPanel, LoadingPanel } from '../../components/ui/States';
import { getStoreTheme } from '../../storefront/catalog';
import type { PaymentMethod, Product, PublicSettings } from '../../types/store';

export function ProductPage({
  settings,
  slug,
  embed = false,
}: {
  settings: PublicSettings;
  slug: string | undefined;
  embed?: boolean;
}) {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(['stripe']);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');

  useEffect(() => {
    if (!slug) return;
    apiFetch<Product>(`/products/slug/${slug}`)
      .then(setProduct)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    apiFetch<{ methods: PaymentMethod[] }>('/checkout/methods')
      .then((response) => {
        if (response.methods.length > 0) {
          setPaymentMethods(response.methods);
          setPaymentMethod(response.methods[0]!);
        }
      })
      .catch(() => {
        setPaymentMethods(['stripe']);
        setPaymentMethod('stripe');
      });
  }, []);

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    setSubmitting(true);
    setError('');

    const successUrl = searchParams.get('successUrl') || undefined;
    const cancelUrl = searchParams.get('cancelUrl') || undefined;

    try {
      const response = await apiFetch<{ id: string; url: string; provider?: PaymentMethod }>('/checkout/sessions', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          customerEmail,
          customerName,
          successUrl,
          cancelUrl,
          paymentMethod,
        }),
      });

      if (!response.url) {
        throw new Error('Checkout URL was not returned.');
      }

      if (embed && window.parent !== window) {
        window.top!.location.href = response.url;
      } else {
        window.location.href = response.url;
      }
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout.');
      setSubmitting(false);
    }
  };

  const productContext = useMemo(
    () => (product ? buildStoreProductContext({ settings, product }) : null),
    [settings, product],
  );

  if (loading) return <LoadingPanel label="Loading product" />;
  if (!product || !productContext) return <ErrorPanel message={error || 'Product not found.'} />;

  const theme = getStoreTheme(settings);
  const ThemePage = theme.ProductPage;

  return (
    <ThemeProductProvider value={productContext}>
      <ThemePage
        customerEmail={customerEmail}
        customerName={customerName}
        error={error}
        onCheckout={handleCheckout}
        onCustomerEmailChange={setCustomerEmail}
        onCustomerNameChange={setCustomerName}
        onPaymentMethodChange={setPaymentMethod}
        paymentMethod={paymentMethod}
        paymentMethods={paymentMethods}
        product={product}
        settings={settings}
        submitting={submitting}
      />
    </ThemeProductProvider>
  );
}
