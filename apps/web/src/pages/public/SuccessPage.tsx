import { getStoreTheme } from '../../storefront/catalog';
import type { PublicSettings } from '../../types/store';

export function SuccessPage({
  settings,
  sessionId,
  purchaseId,
}: {
  settings: PublicSettings;
  sessionId?: string | null;
  purchaseId?: string | null;
}) {
  const theme = getStoreTheme(settings);
  const ThemePage = theme.SuccessPage;
  const orderReference = sessionId || purchaseId || null;

  return <ThemePage orderReference={orderReference} settings={settings} />;
}
