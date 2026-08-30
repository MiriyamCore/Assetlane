import { Archive, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../lib/format';
import type { Product } from '../../types/store';

export function ProductCatalogPage({
  products,
  onDelete,
  onStatusChange,
}: {
  products: Product[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Product['status']) => void;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Catalog</span>
          <h3>{products.length} products</h3>
        </div>
        <Link className="primary-link" to="/admin/products/new">
          <Plus size={16} />
          <span>Add product</span>
        </Link>
      </div>

      <div className="table-list">
        {products.map((product) => (
          <div className="table-row product-admin-row" key={product.id}>
            <div>
              <strong>{product.title}</strong>
              <span>
                /{product.slug} · {product.tags.length ? product.tags.join(', ') : 'No tags'} ·{' '}
                {product.digitalFileName ? product.digitalFileName : 'No digital file'}
              </span>
            </div>
            <div>
              <strong>{formatMoney(product.price, product.currency)}</strong>
              <span>{product.status}</span>
            </div>
            <div className="row-actions">
              <Link className="icon-button" to={`/admin/products/${product.id}/edit`} title="Edit">
                <Pencil size={16} />
              </Link>
              {product.status !== 'published' ? (
                <button className="icon-button" onClick={() => onStatusChange(product.id, 'published')} title="Publish">
                  <Check size={16} />
                </button>
              ) : (
                <button className="icon-button" onClick={() => onStatusChange(product.id, 'draft')} title="Unpublish">
                  <Archive size={16} />
                </button>
              )}
              <button className="icon-button danger" onClick={() => onDelete(product.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
