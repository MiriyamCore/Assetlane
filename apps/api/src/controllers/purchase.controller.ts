import crypto from 'crypto';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getSettingsMap, toIntSetting } from '../lib/settings';
import { serializePurchase } from '../lib/serializers';

export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const { productId, status } = req.query as { productId?: string; status?: string };
    const where = {
      ...(productId ? { productId } : {}),
      ...(status ? { status: status as 'pending' | 'paid' | 'refunded' | 'expired' } : {}),
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
