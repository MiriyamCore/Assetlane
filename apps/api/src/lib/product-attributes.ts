export type ProductAttribute = {
  label: string;
  value: string;
};

export const parseProductAttributes = (value: unknown): ProductAttribute[] => {
  if (!value) {
    return [];
  }

  let parsed: unknown = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label = typeof record.label === 'string' ? record.label.trim() : '';
      const attrValue = typeof record.value === 'string' ? record.value.trim() : '';

      if (!label || !attrValue) {
        return null;
      }

      return { label, value: attrValue };
    })
    .filter((item): item is ProductAttribute => item !== null);
};
