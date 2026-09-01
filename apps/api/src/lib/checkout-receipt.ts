type PurchaseStatus = 'pending' | 'paid' | 'refunded' | 'expired';

type ReceiptPurchase = {
  id: string;
  status: PurchaseStatus;
  downloadToken: string;
  product: { title: string };
};

export type CheckoutReceiptResponse =
  | {
      status: 'paid';
      productTitle: string;
      downloadUrl: string;
      orderReference: string;
    }
  | {
      status: Exclude<PurchaseStatus, 'paid'>;
      productTitle: string;
      orderReference: string;
    };

export const buildCheckoutReceiptResponse = (
  purchase: ReceiptPurchase,
  storeUrl: string,
  orderReference: string,
): CheckoutReceiptResponse => {
  if (purchase.status !== 'paid') {
    return {
      status: purchase.status === 'pending' ? 'pending' : purchase.status,
      productTitle: purchase.product.title,
      orderReference,
    };
  }

  return {
    status: 'paid',
    productTitle: purchase.product.title,
    downloadUrl: `${storeUrl.replace(/\/+$/, '')}/download/${purchase.downloadToken}`,
    orderReference,
  };
};
