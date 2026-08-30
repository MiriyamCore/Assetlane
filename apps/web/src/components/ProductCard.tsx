import { motion } from 'framer-motion';
import { ArrowRight, Download, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { StoreThemeBase } from '../lib/storefront-theme';

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    price: number;
    currency: string;
    version: string | null;
    featuredImageUrl: string | null;
    tags: string[];
  };
  variant?: StoreThemeBase;
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);

const ProductCard = ({ product, variant = 'atelier' }: ProductCardProps) => {
  const image = product.featuredImageUrl ? (
    <img className="product-card-image" src={product.featuredImageUrl} alt={product.title} />
  ) : (
    <div className="product-card-image product-card-placeholder">
      <Package size={34} />
    </div>
  );

  if (variant === 'paper') {
    return (
      <motion.article whileHover={{ y: -4 }} className="product-card product-card-paper">
        {image}
        <div className="product-card-paper-content">
          <div className="product-card-body">
            <div className="eyebrow-row">
              <span className="eyebrow">Release</span>
              {product.version ? <span className="subtle-chip">v{product.version}</span> : null}
            </div>
            <h3>{product.title}</h3>
            <p>{product.summary}</p>
          </div>
          <div className="product-card-paper-side">
            <div className="price-value">{formatMoney(product.price, product.currency)}</div>
            <Link className="primary-link" to={`/product/${product.slug}`}>
              <span>View release</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'ember') {
    return (
      <motion.article whileHover={{ y: -6 }} className="product-card product-card-ember">
        {image}
        <div className="product-card-body">
          <div className="eyebrow-row">
            <span className="eyebrow">Live drop</span>
            {product.version ? <span className="subtle-chip">v{product.version}</span> : null}
          </div>
          <h3>{product.title}</h3>
          <p>{product.summary}</p>
        </div>
        <div className="product-card-footer">
          <div>
            <div className="price-label">Price</div>
            <div className="price-value">{formatMoney(product.price, product.currency)}</div>
          </div>
          <Link className="primary-link" to={`/product/${product.slug}`}>
            <span>Buy now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article whileHover={{ y: -6 }} className="product-card product-card-atelier">
      {image}

      <div className="product-card-body">
        <div className="eyebrow-row">
          <span className="eyebrow">Digital Product</span>
          {product.version ? <span className="subtle-chip">v{product.version}</span> : null}
        </div>

        <h3>{product.title}</h3>
        <p>{product.summary}</p>
        {product.tags.length > 0 ? (
          <div className="tag-row compact">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="product-card-footer">
        <div>
          <div className="price-label">Price</div>
          <div className="price-value">{formatMoney(product.price, product.currency)}</div>
        </div>
        <Link className="inline-action" to={`/product/${product.slug}`}>
          <span>View</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="product-card-meta">
        <Download size={14} />
        <span>Secure delivery after payment</span>
      </div>
    </motion.article>
  );
};

export default ProductCard;
