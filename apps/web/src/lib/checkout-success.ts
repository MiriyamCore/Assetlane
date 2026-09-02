import { useTranslation } from '../i18n/LocaleProvider';

export function useCheckoutSuccessCopy({
  supportEmail,
  productTitle,
  downloadUrl,
  pending,
}: {
  supportEmail: string;
  productTitle?: string | null | undefined;
  downloadUrl?: string | undefined;
  pending?: boolean | undefined;
}) {
  const { t } = useTranslation();

  if (downloadUrl) {
    return {
      title: t('checkout.paymentCompleted'),
      message: t('checkout.successReady', {
        product: productTitle || t('checkout.yourProduct'),
        email: supportEmail,
      }),
    };
  }

  if (pending) {
    return {
      title: t('checkout.paymentCompleted'),
      message: t('checkout.successPending', { email: supportEmail }),
    };
  }

  return {
    title: t('checkout.paymentCompleted'),
    message: t('checkout.successCaptured', { email: supportEmail }),
  };
}
