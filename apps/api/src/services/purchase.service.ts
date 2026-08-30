import prisma from '../lib/prisma';
import { getSettingsMap, toIntSetting } from '../lib/settings';
import { PRODUCT_NAME } from '../lib/platform';
import { sendDownloadEmail } from './email.service';

const getDownloadExpiryDate = (downloadExpiryDays: number) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + downloadExpiryDays);
  return expiresAt;
};

export const finalizePaidPurchase = async (purchaseId: string, input?: { bkashTrxId?: string; customerName?: string }) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { product: true },
  });

  if (!purchase || purchase.status === 'paid') {
    return purchase;
  }

  const settings = await getSettingsMap();
  const downloadExpiryDays = toIntSetting(settings.downloadExpiryDays, 7);
  const storeUrl = settings.storeUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

  const updatedPurchase = await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      status: 'paid',
      customerName: input?.customerName || purchase.customerName,
      bkashTrxId: input?.bkashTrxId || purchase.bkashTrxId,
      downloadExpiresAt: getDownloadExpiryDate(downloadExpiryDays),
      purchasedAt: new Date(),
    },
    include: { product: true },
  });

  const downloadLink = `${storeUrl}/download/${updatedPurchase.downloadToken}`;

  await sendDownloadEmail({
    to: updatedPurchase.customerEmail,
    productTitle: updatedPurchase.product.title,
    downloadLink,
    downloadExpiresAt: updatedPurchase.downloadExpiresAt,
      storeName: settings.storeName || PRODUCT_NAME,
    supportEmail: settings.supportEmail || 'support@example.com',
  });

  return updatedPurchase;
};
