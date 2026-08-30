import ProductCard from '../ProductCard';
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../ui/States';
import { catalogGridClass, type StoreThemeBase } from '../../lib/storefront-theme';
import type { Product, PublicSettings } from '../../types/store';
import { getCatalogCopy, getEmptyCatalogCopy } from '../../lib/storefront-content';

type CatalogSectionProps = {
  products: Product[];
  loading: boolean;
  error: string;
  settings: PublicSettings;
  themeBase?: StoreThemeBase;
  gridClassName?: string;
};

export function CatalogSection({ products, loading, error, settings, themeBase = 'atelier', gridClassName }: CatalogSectionProps) {
  const catalogCopy = getCatalogCopy(settings);
  const emptyCopy = getEmptyCatalogCopy(settings);
  const gridClass = gridClassName || catalogGridClass(themeBase);

  return (
    <section className={`section-heading-block section-heading-block-${themeBase}`} id="products">
      <section className="section-heading">
        <div>
          <span className="eyebrow">{catalogCopy.eyebrow}</span>
          <h2>{catalogCopy.title}</h2>
          {catalogCopy.description ? <p>{catalogCopy.description}</p> : null}
        </div>
        <div className="support-chip">{settings.supportEmail}</div>
      </section>

      {loading ? <LoadingPanel label="Loading published products" /> : null}
      {error ? <ErrorPanel message={error} /> : null}
      {!loading && !error ? (
        products.length > 0 ? (
          <div className={gridClass}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant={themeBase} />
            ))}
          </div>
        ) : (
          <EmptyPanel title={emptyCopy.title} message={emptyCopy.message} />
        )
      ) : null}
    </section>
  );
}
