import type { ProductAttribute } from '../../lib/product-attributes';
import { useTranslation } from '../../i18n/LocaleProvider';

export function ProductSpecsSection({
  attributes,
  title,
}: {
  attributes: ProductAttribute[];
  title?: string;
}) {
  const { t } = useTranslation();
  const rows = attributes.filter((item) => item.label.trim() && item.value.trim());
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="product-specs">
      <h2>{title || t('specs.title')}</h2>
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
