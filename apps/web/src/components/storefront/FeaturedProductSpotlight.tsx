import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../lib/format';
import type { Product } from '../../types/store';

export function FeaturedProductSpotlight({
  product,
  eyebrow,
  title,
  body,
  variant,
}: {
  product: Product;
  eyebrow: string;
  title: string;
  body: string;
  variant?: 'atelier' | 'paper' | 'ember';
}) {
  return (
    <section className={variant ? `featured-spotlight ${variant}` : 'featured-spotlight'}>
      <div className="featured-spotlight-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="featured-spotlight-meta">
          <strong>{product.title}</strong>
          <span>{formatMoney(product.price, product.currency)}</span>
          {product.version ? <span>v{product.version}</span> : null}
        </div>
        {product.tags.length > 0 ? (
          <div className="tag-row">
            {product.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <Link className="primary-link" to={`/product/${product.slug}`}>
          <span>View featured product</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="featured-spotlight-card">
        {product.featuredImageUrl ? <img src={product.featuredImageUrl} alt={product.title} /> : null}
        <div className="featured-spotlight-body">
          <h3>{product.title}</h3>
          <p>{product.summary}</p>
        </div>
      </div>
    </section>
  );
}
