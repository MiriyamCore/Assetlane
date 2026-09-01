import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { getStoreTheme } from '../../storefront/catalog';
import type { CheckoutReceipt } from '../../storefront/types';
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
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(Boolean(sessionId || purchaseId));

  useEffect(() => {
    if (!sessionId && !purchaseId) {
      setReceiptLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const loadReceipt = async () => {
      const params = new URLSearchParams();
      if (purchaseId) params.set('purchase_id', purchaseId);
      if (sessionId) params.set('session_id', sessionId);

      try {
        const payload = await apiFetch<CheckoutReceipt>(`/checkout/receipt?${params.toString()}`);
        if (cancelled) return;

        setReceipt(payload);
        setReceiptLoading(false);

        if (payload.status === 'pending' && attempts < 15) {
          attempts += 1;
          window.setTimeout(loadReceipt, 2000);
        }
      } catch {
        if (!cancelled) {
          setReceiptLoading(false);
        }
      }
    };

    void loadReceipt();

    return () => {
      cancelled = true;
    };
  }, [purchaseId, sessionId]);

  const orderReference = receipt?.orderReference || sessionId || purchaseId || null;

  return (
    <ThemePage
      orderReference={orderReference}
      receipt={receipt}
      receiptLoading={receiptLoading}
      settings={settings}
    />
  );
}
