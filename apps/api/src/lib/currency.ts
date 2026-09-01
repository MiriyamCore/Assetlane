export const STORE_CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP'] as const;

export type StoreCurrency = (typeof STORE_CURRENCIES)[number];

export const DEFAULT_STORE_CURRENCY: StoreCurrency = 'BDT';

export const STORE_CURRENCY_LABELS: Record<StoreCurrency, string> = {
  BDT: 'Bangladeshi Taka (BDT)',
  USD: 'US Dollar (USD)',
  EUR: 'Euro (EUR)',
  GBP: 'British Pound (GBP)',
};

export const normalizeStoreCurrency = (value: string | undefined | null): StoreCurrency => {
  const normalized = (value || '').trim().toUpperCase();
  if (STORE_CURRENCIES.includes(normalized as StoreCurrency)) {
    return normalized as StoreCurrency;
  }

  return DEFAULT_STORE_CURRENCY;
};

export const isStoreCurrency = (value: string): value is StoreCurrency =>
  STORE_CURRENCIES.includes(value.trim().toUpperCase() as StoreCurrency);
