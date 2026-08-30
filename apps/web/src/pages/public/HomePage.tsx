import { useEffect, useMemo, useState } from 'react';
import { ThemeHomeProvider } from '@assetlane/theme-sdk/react';
import { apiFetch } from '../../lib/api';
import { buildStoreHomeContext } from '../../lib/theme-context';
import { getStoreTheme } from '../../storefront/catalog';
import type { Product, PublicSettings } from '../../types/store';

export function HomePage({ settings }: { settings: PublicSettings }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Product[]>('/products?status=published')
      .then(setProducts)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, []);

  const homeContext = useMemo(
    () =>
      buildStoreHomeContext({
        settings,
        products,
        loading,
        error,
      }),
    [settings, products, loading, error],
  );

  const theme = getStoreTheme(settings);
  const ThemePage = theme.HomePage;

  return (
    <ThemeHomeProvider value={homeContext}>
      <ThemePage
        error={error}
        featuredProduct={homeContext.featuredProduct}
        loading={loading}
        products={products}
        settings={settings}
      />
    </ThemeHomeProvider>
  );
}
