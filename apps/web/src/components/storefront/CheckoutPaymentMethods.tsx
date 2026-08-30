import type { PaymentMethod } from '../../types/store';

const labels: Record<PaymentMethod, string> = {
  stripe: 'Card (Stripe)',
  bkash: 'bKash',
};

type CheckoutPaymentMethodsProps = {
  methods: PaymentMethod[];
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export function CheckoutPaymentMethods({ methods, value, onChange }: CheckoutPaymentMethodsProps) {
  if (methods.length <= 1) {
    return null;
  }

  return (
    <fieldset className="checkout-payment-methods">
      <legend>Payment method</legend>
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
