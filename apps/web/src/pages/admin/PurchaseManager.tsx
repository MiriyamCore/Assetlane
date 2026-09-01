import { Download, Filter, Mail, Package, RefreshCcw, Search, Undo2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import type { Product, Purchase } from '../../types/store';
import { DetailPair, EmptyPanel, InlineError } from '../../components/ui/States';

function formatPurchaseDate(purchase: Purchase) {
  const value = purchase.purchasedAt || purchase.createdAt;
  return value ? new Date(value).toLocaleString() : '—';
}

function PaymentBadge({ provider }: { provider: Purchase['paymentProvider'] }) {
  const label = provider === 'bkash' ? 'bKash' : provider === 'free' ? 'Free' : 'Stripe';
  return <span className={`payment-badge payment-badge-${provider || 'stripe'}`}>{label}</span>;
}

function StatusBadge({ status }: { status: Purchase['status'] }) {
  return <span className={`status-badge status-badge-${status}`}>{status}</span>;
}

function exportPurchasesCsv(purchases: Purchase[]) {
  const headers = ['Date', 'Email', 'Product', 'Amount', 'Currency', 'Status', 'Provider', 'Downloads'];
  const rows = purchases.map((purchase) => [
    formatPurchaseDate(purchase),
    purchase.customerEmail,
    purchase.product?.title || 'Unknown product',
    String(purchase.amount),
    purchase.currency,
    purchase.status,
    purchase.paymentProvider || 'stripe',
    `${purchase.downloadCount}/${purchase.downloadLimit}`,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `assetlane-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function PurchaseManager({ products }: { products: Product[] }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const loadPurchases = async (nextStatus = statusFilter, nextProduct = productFilter, nextEmail = emailFilter) => {
    const search = new URLSearchParams();
    if (nextStatus) search.set('status', nextStatus);
    if (nextProduct) search.set('productId', nextProduct);
    if (nextEmail.trim()) search.set('email', nextEmail.trim());

    const result = await apiFetch<Purchase[]>(`/purchases${search.toString() ? `?${search.toString()}` : ''}`);
    setPurchases(result);
    if (selectedPurchase) {
      const refreshed = result.find((item) => item.id === selectedPurchase.id);
      setSelectedPurchase(refreshed || null);
    }
  };

  useEffect(() => {
    loadPurchases().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load purchases.'));
  }, []);

  const refreshPurchaseDetail = async (purchaseId: string) => {
    const detail = await apiFetch<Purchase>(`/purchases/${purchaseId}`);
    setSelectedPurchase(detail);
  };

  const regenerateLink = async (purchaseId: string) => {
    await apiFetch(`/purchases/${purchaseId}/regenerate-link`, { method: 'POST' });
    await loadPurchases();
    await refreshPurchaseDetail(purchaseId);
  };

  const resendEmail = async (purchaseId: string) => {
    setResendingEmail(true);
    setError('');
    try {
      await apiFetch(`/purchases/${purchaseId}/resend-email`, { method: 'POST' });
      await refreshPurchaseDetail(purchaseId);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Unable to resend download email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const refundPurchase = async (purchaseId: string) => {
    if (!window.confirm('Refund this order? Stripe orders will be refunded through Stripe.')) {
      return;
    }

    setRefunding(true);
    setError('');
    try {
      await apiFetch(`/purchases/${purchaseId}/refund`, { method: 'POST' });
      await loadPurchases();
      await refreshPurchaseDetail(purchaseId);
    } catch (refundError) {
      setError(refundError instanceof Error ? refundError.message : 'Unable to refund purchase.');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <section className="purchases-grid">
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Filters</span>
            <h3>Purchases</h3>
          </div>
          <button className="secondary-button" disabled={!purchases.length} type="button" onClick={() => exportPurchasesCsv(purchases)}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
        {error ? <InlineError message={error} /> : null}
        <div className="filter-row">
          <label>
            <Filter size={14} />
            <select
              value={statusFilter}
              onChange={async (event) => {
                const next = event.target.value;
                setStatusFilter(next);
                await loadPurchases(next, productFilter, emailFilter);
              }}
            >
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="refunded">refunded</option>
              <option value="expired">expired</option>
            </select>
          </label>
          <label>
            <Package size={14} />
            <select
              value={productFilter}
              onChange={async (event) => {
                const next = event.target.value;
                setProductFilter(next);
                await loadPurchases(statusFilter, next, emailFilter);
              }}
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Search size={14} />
            <input
              placeholder="Search by email"
              type="search"
              value={emailFilter}
              onChange={(event) => setEmailFilter(event.target.value)}
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  await loadPurchases(statusFilter, productFilter, event.currentTarget.value);
                }
              }}
            />
          </label>
        </div>
        <div className="table-list">
          {purchases.map((purchase) => (
            <button
              className={selectedPurchase?.id === purchase.id ? 'table-row button-row active-row' : 'table-row button-row'}
              key={purchase.id}
              onClick={() => refreshPurchaseDetail(purchase.id)}
            >
              <div>
                <strong>{purchase.customerEmail}</strong>
                <span>{purchase.product?.title || 'Unknown product'}</span>
                <span className="theme-meta">{formatPurchaseDate(purchase)}</span>
              </div>
              <div>
                <strong>{formatMoney(purchase.amount, purchase.currency)}</strong>
                <div className="purchase-row-meta">
                  <StatusBadge status={purchase.status} />
                  <PaymentBadge provider={purchase.paymentProvider || 'stripe'} />
                  <span className="theme-meta">
                    {purchase.downloadCount}/{purchase.downloadLimit}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Purchase detail</span>
            <h3>{selectedPurchase ? selectedPurchase.customerEmail : 'Select a purchase'}</h3>
          </div>
          {selectedPurchase ? (
            <div className="admin-topbar-actions">
              {selectedPurchase.status === 'paid' ? (
                <>
                  <button className="secondary-button" disabled={resendingEmail} type="button" onClick={() => void resendEmail(selectedPurchase.id)}>
                    <Mail size={16} />
                    <span>{resendingEmail ? 'Sending…' : 'Resend email'}</span>
                  </button>
                  <button className="secondary-button danger-button" disabled={refunding} type="button" onClick={() => void refundPurchase(selectedPurchase.id)}>
                    <Undo2 size={16} />
                    <span>{refunding ? 'Refunding…' : 'Refund order'}</span>
                  </button>
                </>
              ) : null}
              <button className="secondary-button" type="button" onClick={() => regenerateLink(selectedPurchase.id)}>
                <RefreshCcw size={16} />
                <span>Regenerate link</span>
              </button>
            </div>
          ) : null}
        </div>
        {selectedPurchase ? (
          <div className="detail-stack">
            <DetailPair label="Order date" value={formatPurchaseDate(selectedPurchase)} />
            <DetailPair label="Product" value={selectedPurchase.product?.title || 'Unknown product'} />
            <DetailPair label="Customer name" value={selectedPurchase.customerName || 'Not provided'} />
            <DetailPair label="Customer email" value={selectedPurchase.customerEmail} />
            <DetailPair label="Amount" value={formatMoney(selectedPurchase.amount, selectedPurchase.currency)} />
            <DetailPair label="Status" value={selectedPurchase.status} />
            <DetailPair label="Checkout reference" value={selectedPurchase.externalCheckoutId || selectedPurchase.stripeCheckoutSessionId} />
            <DetailPair label="Payment provider" value={selectedPurchase.paymentProvider || 'stripe'} />
            {selectedPurchase.bkashTrxId ? <DetailPair label="bKash TRX ID" value={selectedPurchase.bkashTrxId} /> : null}
            <DetailPair label="Payment intent" value={selectedPurchase.stripePaymentIntentId || 'Not available'} />
            <DetailPair label="Charge ID" value={selectedPurchase.stripeChargeId || 'Not available'} />
            <DetailPair label="Download token" value={selectedPurchase.downloadToken} />
            <DetailPair label="Download window" value={selectedPurchase.downloadExpiresAt ? new Date(selectedPurchase.downloadExpiresAt).toLocaleString() : 'Unavailable'} />
            <DetailPair label="Download usage" value={`${selectedPurchase.downloadCount} / ${selectedPurchase.downloadLimit}`} />

            <div className="download-events">
              <strong>Download events</strong>
              {selectedPurchase.downloadEvents?.length ? (
                selectedPurchase.downloadEvents.map((eventItem) => (
                  <div className="event-row" key={eventItem.id}>
                    <span>{new Date(eventItem.downloadedAt).toLocaleString()}</span>
                    <span>{eventItem.ipAddress || 'Unknown IP'}</span>
                  </div>
                ))
              ) : (
                <span>No download events recorded yet.</span>
              )}
            </div>
          </div>
        ) : (
          <EmptyPanel title="No purchase selected" message="Pick a purchase from the list to inspect its download status and Stripe identifiers." />
        )}
      </div>
    </section>
  );
}
