import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { ErrorPanel, LoadingPanel } from '../../components/ui/States';
import { getStoreTheme } from '../../storefront/catalog';
import type { DownloadPayload, PublicSettings } from '../../types/store';

export function DownloadPage({ settings, token }: { settings: PublicSettings; token: string | undefined }) {
  const [payload, setPayload] = useState<DownloadPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<DownloadPayload>(`/downloads/${token}`)
      .then(setPayload)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <ErrorPanel message="Download token not provided." />;
  if (loading) return <LoadingPanel label="Validating secure download token" />;
  if (!payload) return <ErrorPanel message={error || 'Download not available.'} />;

  const theme = getStoreTheme(settings);
  const ThemePage = theme.DownloadPage;

  return <ThemePage payload={payload} settings={settings} token={token} />;
}
