import prisma from '../lib/prisma';
import { dispatchWebhookEvent } from '../lib/webhooks';
import { incrementDiscountRedemption } from '../lib/discount';
import { getSettingsMap, toIntSetting } from '../lib/settings';
import { PRODUCT_NAME } from '../lib/platform';
import { sendDownloadEmail } from './email.service';

const getDownloadExpiryDate = (downloadExpiryDays: number) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + downloadExpiryDays);
  return expiresAt;
};

export const sendPurchaseDownloadEmail = async (purchaseId: string) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { product: true },
  });

  if (!purchase) {
    throw new Error('Purchase not found.');
  }

  if (purchase.status !== 'paid') {
    throw new Error('Download email can only be sent for paid orders.');
  }

  const settings = await getSettingsMap();
  const storeUrl = settings.storeUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const downloadLink = `${storeUrl}/download/${purchase.downloadToken}`;

  await sendDownloadEmail({
    to: purchase.customerEmail,
    productTitle: purchase.product.title,
    downloadLink,
    downloadExpiresAt: purchase.downloadExpiresAt,
    storeName: settings.storeName || PRODUCT_NAME,
    supportEmail: settings.supportEmail || 'support@example.com',
  });
};

export const finalizePaidPurchase = async (
  purchaseId: string,
  input?: { bkashTrxId?: string; customerName?: string },
) => {
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

  await incrementDiscountRedemption(updatedPurchase.discountCodeId);

  const downloadLink = `${storeUrl}/download/${updatedPurchase.downloadToken}`;

  await sendDownloadEmail({
    to: updatedPurchase.customerEmail,
    productTitle: updatedPurchase.product.title,
    downloadLink,
    downloadExpiresAt: updatedPurchase.downloadExpiresAt,
    storeName: settings.storeName || PRODUCT_NAME,
    supportEmail: settings.supportEmail || 'support@example.com',
  });

  await dispatchWebhookEvent('order.paid', {
    purchaseId: updatedPurchase.id,
    productId: updatedPurchase.productId,
    productTitle: updatedPurchase.product.title,
    customerEmail: updatedPurchase.customerEmail,
    amountCents: updatedPurchase.amountCents,
    currency: updatedPurchase.currency,
    paymentProvider: updatedPurchase.paymentProvider,
    purchasedAt: updatedPurchase.purchasedAt,
  });

  return updatedPurchase;
};

export const markPurchaseRefunded = async (purchaseId: string) => {
  const existing = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { product: true },
  });

  if (!existing) {
    throw new Error('Purchase not found.');
  }

  if (existing.status === 'refunded') {
    return existing;
  }

  const purchase = await prisma.purchase.update({
    where: { id: purchaseId },
    data: { status: 'refunded' },
    include: { product: true },
  });

  await dispatchWebhookEvent('order.refunded', {
    purchaseId: purchase.id,
    productId: purchase.productId,
    productTitle: purchase.product.title,
    customerEmail: purchase.customerEmail,
    amountCents: purchase.amountCents,
    currency: purchase.currency,
    paymentProvider: purchase.paymentProvider,
  });

  return purchase;
};
