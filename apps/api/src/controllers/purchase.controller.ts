import crypto from 'crypto';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getSettingsMap, toIntSetting } from '../lib/settings';
import { getStripeClient } from '../lib/stripe';
import { serializePurchase } from '../lib/serializers';
import { markPurchaseRefunded, sendPurchaseDownloadEmail } from '../services/purchase.service';

export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const { productId, status, email } = req.query as { productId?: string; status?: string; email?: string };
    const where = {
      ...(productId ? { productId } : {}),
      ...(status ? { status: status as 'pending' | 'paid' | 'refunded' | 'expired' } : {}),
      ...(email?.trim()
        ? {
            customerEmail: {
              contains: email.trim(),
            },
          }
        : {}),
    };

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        downloadEvents: {
          orderBy: { downloadedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(
      purchases.map((purchase) => ({
        ...serializePurchase(purchase),
        product: purchase.product,
        downloadEvents: purchase.downloadEvents,
      }))
    );
  } catch (error) {
    console.error('getAllPurchases error', error);
    return res.status(500).json({ message: 'Unable to fetch purchases.' });
  }
};

export const getPurchaseById = async (req: Request, res: Response) => {
  try {
    const purchase = (await prisma.purchase.findUnique({
      where: { id: String(req.params.id) },
      include: {
        product: true,
        downloadEvents: {
          orderBy: { downloadedAt: 'desc' },
        },
      },
    })) as any;

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found.' });
    }

    return res.json({
      ...serializePurchase(purchase),
      product: purchase.product,
      downloadEvents: purchase.downloadEvents,
    });
  } catch (error) {
    console.error('getPurchaseById error', error);
    return res.status(500).json({ message: 'Unable to fetch purchase.' });
  }
};

export const regenerateDownloadLink = async (req: Request, res: Response) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found.' });
    }

    const settings = await getSettingsMap();
    const downloadExpiryDays = toIntSetting(settings.downloadExpiryDays, 7);
    const downloadLimit = toIntSetting(settings.downloadLimit, 5);
    const nextExpiry = new Date();
    nextExpiry.setDate(nextExpiry.getDate() + downloadExpiryDays);

    const updated = await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        downloadToken: crypto.randomUUID(),
        downloadCount: 0,
        downloadLimit,
        downloadExpiresAt: nextExpiry,
      },
    });

    return res.json(serializePurchase(updated));
  } catch (error) {
    console.error('regenerateDownloadLink error', error);
    return res.status(500).json({ message: 'Unable to regenerate download link.' });
  }
};

export const refundPurchase = async (req: Request, res: Response) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found.' });
    }

    if (purchase.status !== 'paid') {
      return res.status(400).json({ message: 'Only paid orders can be refunded.' });
    }

    if (purchase.paymentProvider === 'stripe') {
      if (!purchase.stripePaymentIntentId) {
        return res.status(400).json({ message: 'Stripe payment intent is missing for this order.' });
      }

      const stripe = await getStripeClient();
      await stripe.refunds.create({
        payment_intent: purchase.stripePaymentIntentId,
      });
    }

    const updated = await markPurchaseRefunded(purchase.id);
    return res.json(serializePurchase(updated));
  } catch (error) {
    console.error('refundPurchase error', error);
    const message = error instanceof Error ? error.message : 'Unable to refund purchase.';
    return res.status(400).json({ message });
  }
};

export const resendDownloadEmail = async (req: Request, res: Response) => {
  try {
    await sendPurchaseDownloadEmail(String(req.params.id));
    return res.json({ success: true, message: 'Download email sent.' });
  } catch (error) {
    console.error('resendDownloadEmail error', error);
    const message = error instanceof Error ? error.message : 'Unable to resend download email.';
    return res.status(400).json({ message });
  }
};
