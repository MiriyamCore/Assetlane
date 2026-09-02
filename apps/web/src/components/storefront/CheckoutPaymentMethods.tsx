import type { PaymentMethod } from '../../types/store';
import { useTranslation } from '../../i18n/LocaleProvider';

type CheckoutPaymentMethodsProps = {
  methods: PaymentMethod[];
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export function CheckoutPaymentMethods({ methods, value, onChange }: CheckoutPaymentMethodsProps) {
  const { t } = useTranslation();

  const labels: Record<PaymentMethod, string> = {
    stripe: t('checkout.cardStripe'),
    bkash: t('checkout.bkash'),
    free: t('common.free'),
  };

  if (methods.length <= 1) {
    return null;
  }

  return (
    <fieldset className="checkout-payment-methods">
      <legend>{t('checkout.paymentMethod')}</legend>
      <div className="checkout-payment-options">
        {methods.map((method) => (
          <label key={method} className={value === method ? 'checkout-payment-option active' : 'checkout-payment-option'}>
            <input
              checked={value === method}
              name="paymentMethod"
              onChange={() => onChange(method)}
              type="radio"
              value={method}
            />
            <span>{labels[method]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
