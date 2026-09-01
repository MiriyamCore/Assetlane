import { Plus, Trash2 } from 'lucide-react';
import type { ProductAttribute } from '../../lib/product-attributes';
import { emptyProductAttribute } from '../../lib/product-attributes';

export function ProductAttributesEditor({
  attributes,
  onChange,
}: {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
}) {
  const updateRow = (index: number, patch: Partial<ProductAttribute>) => {
    onChange(attributes.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(attributes.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="product-attributes-editor">
      <div className="product-attributes-header">
        <div>
          <strong>Product attributes</strong>
          <span>Add custom specs buyers should see — platform, format, license, requirements, etc.</span>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onChange([...attributes, emptyProductAttribute()])}
        >
          <Plus size={14} />
          <span>Add attribute</span>
        </button>
      </div>

      {attributes.length === 0 ? (
        <p className="theme-meta">No attributes yet. Examples: WordPress version, File format, License.</p>
      ) : (
        <div className="product-attributes-rows">
          {attributes.map((attribute, index) => (
            <div key={`attribute-${index}`} className="product-attribute-row">
              <label>
                Label
                <input
                  placeholder="WordPress version"
                  value={attribute.label}
                  onChange={(event) => updateRow(index, { label: event.target.value })}
                />
              </label>
              <label>
                Value
                <input
                  placeholder="6.0+"
                  value={attribute.value}
                  onChange={(event) => updateRow(index, { value: event.target.value })}
                />
              </label>
              <button className="secondary-button danger-button" type="button" onClick={() => removeRow(index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
