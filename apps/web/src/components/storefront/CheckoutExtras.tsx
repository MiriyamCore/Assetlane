import type { CheckoutExtrasProps } from '../../storefront/types';
import { formatMoney } from '../../lib/format';

export function CheckoutExtras({
  product,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  discountMessage,
  finalPriceCents,
  isFreeProduct,
}: CheckoutExtrasProps) {
  const displayCents = finalPriceCents ?? product.priceCents;

  return (
    <div className="checkout-extras">
      <p className="checkout-price-line">
        {displayCents === product.priceCents ? (
          <strong>{isFreeProduct ? 'Free' : formatMoney(product.price, product.currency)}</strong>
        ) : (
          <>
            <span className="checkout-price-original">{formatMoney(product.price, product.currency)}</span>
            <strong>{displayCents === 0 ? 'Free' : formatMoney(displayCents / 100, product.currency)}</strong>
          </>
        )}
      </p>

      {!isFreeProduct ? (
        <div className="checkout-discount-row">
          <label>
            Discount code
            <input value={discountCode} onChange={(event) => onDiscountCodeChange(event.target.value.toUpperCase())} placeholder="Optional" />
          </label>
          <button className="secondary-button" type="button" onClick={onApplyDiscount}>
            Apply
          </button>
        </div>
      ) : null}

      {discountMessage ? <small>{discountMessage}</small> : null}
    </div>
  );
}
