import { useEffect, useState } from 'react';
import { Filter, Package, RefreshCcw } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import type { Product, Purchase } from '../../types/store';
import { DetailPair, EmptyPanel, InlineError } from '../../components/ui/States';

export function PurchaseManager({ products }: { products: Product[] }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState('');

  const loadPurchases = async (nextStatus = statusFilter, nextProduct = productFilter) => {
    const search = new URLSearchParams();
    if (nextStatus) search.set('status', nextStatus);
    if (nextProduct) search.set('productId', nextProduct);

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

  return (
    <section className="purchases-grid">
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Filters</span>
            <h3>Purchases</h3>
          </div>
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
                await loadPurchases(next, productFilter);
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
                await loadPurchases(statusFilter, next);
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
              </div>
              <div>
                <strong>{formatMoney(purchase.amount, purchase.currency)}</strong>
                <span>
                  {purchase.status} · {purchase.downloadCount}/{purchase.downloadLimit}
                </span>
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
            <button className="secondary-button" onClick={() => regenerateLink(selectedPurchase.id)}>
              <RefreshCcw size={16} />
              <span>Regenerate link</span>
            </button>
          ) : null}
        </div>
        {selectedPurchase ? (
          <div className="detail-stack">
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
