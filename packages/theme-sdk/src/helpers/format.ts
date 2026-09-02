export const formatMoney = (amount: number, currency: string, locale = 'en-US') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
