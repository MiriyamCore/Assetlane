import type { CheckoutExtrasProps } from '../../storefront/types';
import { formatMoney } from '../../lib/format';
import { useTranslation } from '../../i18n/LocaleProvider';

export function CheckoutExtras({
  product,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  discountMessage,
  finalPriceCents,
  isFreeProduct,
}: CheckoutExtrasProps) {
  const { t } = useTranslation();
  const displayCents = finalPriceCents ?? product.priceCents;

  return (
    <div className="checkout-extras">
      <p className="checkout-price-line">
        {displayCents === product.priceCents ? (
          <strong>{isFreeProduct ? t('common.free') : formatMoney(product.price, product.currency)}</strong>
        ) : (
          <>
            <span className="checkout-price-original">{formatMoney(product.price, product.currency)}</span>
            <strong>{displayCents === 0 ? t('common.free') : formatMoney(displayCents / 100, product.currency)}</strong>
          </>
        )}
      </p>

      {!isFreeProduct ? (
        <div className="checkout-discount-row">
          <label>
            {t('checkout.discountCode')}
            <input
              value={discountCode}
              onChange={(event) => onDiscountCodeChange(event.target.value.toUpperCase())}
              placeholder={t('checkout.discountPlaceholder')}
            />
          </label>
          <button className="secondary-button" type="button" onClick={onApplyDiscount}>
            {t('common.apply')}
          </button>
        </div>
      ) : null}

      {discountMessage ? <small>{discountMessage}</small> : null}
    </div>
  );
}
