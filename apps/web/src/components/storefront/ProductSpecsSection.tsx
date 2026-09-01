import type { ProductAttribute } from '../../lib/product-attributes';

export function ProductSpecsSection({
  attributes,
  title = 'Specifications',
}: {
  attributes: ProductAttribute[];
  title?: string;
}) {
  const rows = attributes.filter((item) => item.label.trim() && item.value.trim());
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="product-specs">
      <h2>{title}</h2>
      <dl className="product-specs-list">
        {rows.map((attribute) => (
          <div key={`${attribute.label}-${attribute.value}`} className="product-specs-row">
            <dt>{attribute.label}</dt>
            <dd>{attribute.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
