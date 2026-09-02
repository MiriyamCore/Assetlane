import { useTranslation } from '../../i18n/LocaleProvider';

export function CheckoutCustomerFields({
  customerName,
  customerEmail,
  onCustomerNameChange,
  onCustomerEmailChange,
}: {
  customerName: string;
  customerEmail: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <label>
        {t('common.name')}
        <input
          value={customerName}
          onChange={(event) => onCustomerNameChange(event.target.value)}
          placeholder={t('checkout.nameOptional')}
        />
      </label>
      <label>
        {t('common.email')}
        <input
          required
          type="email"
          value={customerEmail}
          onChange={(event) => onCustomerEmailChange(event.target.value)}
          placeholder={t('checkout.emailPlaceholder')}
        />
      </label>
    </>
  );
}

export function checkoutSubmitLabel(
  t: (key: string) => string,
  submitting: boolean,
  options?: { isFreeProduct?: boolean | undefined; finalPriceCents?: number | undefined },
) {
  if (submitting) {
    return options?.isFreeProduct || options?.finalPriceCents === 0 ? t('checkout.processing') : t('checkout.redirecting');
  }

  return options?.isFreeProduct || options?.finalPriceCents === 0 ? t('checkout.getFreeDownload') : t('checkout.checkout');
}
