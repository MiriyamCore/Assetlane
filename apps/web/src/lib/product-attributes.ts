export type ProductAttribute = {
  label: string;
  value: string;
};

export const emptyProductAttribute = (): ProductAttribute => ({
  label: '',
  value: '',
});
