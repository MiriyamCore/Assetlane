import { getStoreTheme } from '../../storefront/catalog';
import type { PublicSettings } from '../../types/store';

export function CancelPage({ settings, productSlug }: { settings: PublicSettings; productSlug?: string | null }) {
  const theme = getStoreTheme(settings);
  const ThemePage = theme.CancelPage;

  return <ThemePage productSlug={productSlug} />;
}
