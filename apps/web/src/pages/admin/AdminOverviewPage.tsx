import { ExternalLink, Package, Plus, Settings, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../lib/format';
import type { Product, PublicSettings, StatsPayload } from '../../types/store';
import { EmptyPanel, MetricCard } from '../../components/ui/States';
import { PRODUCT_NAME } from '../../lib/platform';

export function AdminOverviewPage({
  stats,
  currency,
  products,
  settings,
}: {
  stats: StatsPayload;
  currency: string;
  products: Product[];
  settings: PublicSettings;
}) {
  const draftProducts = products.filter((product) => product.status === 'draft').slice(0, 5);

  return (
    <section className="admin-dashboard-grid">
      <div className="admin-stats-row">
        <MetricCard label="Total revenue" value={formatMoney(stats.totalRevenueCents / 100, currency)} />
        <MetricCard label="Paid orders" value={String(stats.totalPurchases)} />
        <MetricCard label="Avg order" value={formatMoney(stats.averageOrderValueCents / 100, currency)} />
        <MetricCard label="Last 30 days" value={formatMoney(stats.revenueLast30DaysCents / 100, currency)} />
      </div>

      <div className="admin-stats-row">
        <MetricCard label="Products" value={String(stats.totalProducts)} />
        <MetricCard label="Published" value={String(stats.publishedProducts)} />
        <MetricCard label="Drafts" value={String(stats.draftProducts)} />
        <MetricCard label="Pending orders" value={String(stats.pendingOrders)} />
      </div>

      <div className="admin-stats-row admin-stats-row-compact">
        <MetricCard label="30-day orders" value={String(stats.ordersLast30Days)} />
        <MetricCard label="Downloads" value={String(stats.totalDownloads)} />
      </div>

      <div className="admin-quick-actions panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Shortcuts</span>
            <h3>Quick actions</h3>
          </div>
        </div>
        <div className="admin-quick-actions-grid">
          <Link className="admin-quick-action" to="/admin/products/new">
            <Plus size={14} />
            <span>New product</span>
          </Link>
          <Link className="admin-quick-action" to="/admin/products">
            <Package size={14} />
            <span>Manage catalog</span>
          </Link>
          <Link className="admin-quick-action" to="/admin/purchases">
            <ShoppingBag size={14} />
            <span>View orders</span>
          </Link>
          <Link className="admin-quick-action" to="/admin/settings">
            <Settings size={14} />
            <span>Store settings</span>
          </Link>
          <a className="admin-quick-action" href="/" rel="noreferrer" target="_blank">
            <ExternalLink size={14} />
            <span>View storefront</span>
          </a>
        </div>
      </div>

      <div className="admin-panels-row">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Recent orders</span>
              <h3>Latest purchases</h3>
            </div>
            <Link className="secondary-link" to="/admin/purchases">
              View all
            </Link>
          </div>
          {stats.recentPurchases.length ? (
            <div className="table-list">
              {stats.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="table-row">
                  <div>
                    <strong>{purchase.product?.title || 'Unknown product'}</strong>
                    <span>{purchase.customerEmail}</span>
                  </div>
                  <div>
                    <strong>{formatMoney(purchase.amount, purchase.currency)}</strong>
                    <span>{purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleString() : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel title="No orders yet" message="Completed checkouts will appear here with customer and amount details." />
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Top products</span>
              <h3>Best sellers</h3>
            </div>
          </div>
          {stats.topSellingProducts.length ? (
            <div className="table-list">
              {stats.topSellingProducts.map((item) => (
                <div key={item.productId} className="table-row">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.salesCount} paid orders</span>
                  </div>
                  <div>
                    <strong>{formatMoney(item.revenueCents / 100, currency)}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel title="No sales data yet" message="Publish a product and complete a checkout to populate this list." />
          )}
        </div>
      </div>

      <div className="admin-panels-row">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Catalog</span>
              <h3>Draft products</h3>
            </div>
            <Link className="secondary-link" to="/admin/products">
              View catalog
            </Link>
          </div>
          {draftProducts.length ? (
            <div className="table-list">
              {draftProducts.map((product) => (
                <div key={product.id} className="table-row">
                  <div>
                    <strong>{product.title}</strong>
                    <span>/{product.slug}</span>
                  </div>
                  <div>
                    <Link className="secondary-link" to={`/admin/products/${product.id}/edit`}>
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel title="No drafts" message="All products are published or you have not created any yet." />
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Store</span>
              <h3>Snapshot</h3>
            </div>
            <Link className="secondary-link" to="/admin/settings">
              Settings
            </Link>
          </div>
          <div className="admin-snapshot-list">
            <div className="admin-snapshot-row">
              <span>Store name</span>
              <strong>{settings.storeName || PRODUCT_NAME}</strong>
            </div>
            <div className="admin-snapshot-row">
              <span>Mode</span>
              <strong>{settings.storeMode || 'hybrid'}</strong>
            </div>
            <div className="admin-snapshot-row">
              <span>Currency</span>
              <strong>{settings.defaultCurrency || currency}</strong>
            </div>
            <div className="admin-snapshot-row">
              <span>Support email</span>
              <strong>{settings.supportEmail || 'Not set'}</strong>
            </div>
            <div className="admin-snapshot-row">
              <span>Theme</span>
              <strong>{settings.storefrontTheme || 'Default'}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
