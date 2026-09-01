import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getSettingsMap, toIntSetting } from '../lib/settings';
import { listProductDownloadFiles, resolveProductFilePath } from '../lib/product-files';
import { getAbsoluteStoragePath } from '../lib/storage';

const loadPurchaseForDownload = async (token: string) =>
  prisma.purchase.findUnique({
    where: { downloadToken: token },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          digitalFileName: true,
          digitalFilePath: true,
          files: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              filePath: true,
              fileName: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });

const getDownloadState = async (token: string) => {
  const purchase = await loadPurchaseForDownload(token);

  if (!purchase) {
    return { error: 'Invalid download token.' as const };
  }

  const settings = await getSettingsMap();
  const fallbackLimit = toIntSetting(settings.downloadLimit, 5);
  const effectiveLimit = purchase.downloadLimit || fallbackLimit;
  const isExpired = !purchase.downloadExpiresAt || new Date() > new Date(purchase.downloadExpiresAt);
  const isLimitReached = purchase.downloadCount >= effectiveLimit;

  return {
    purchase,
    effectiveLimit,
    isExpired,
    isLimitReached,
  };
};

export const getDownloadInfo = async (req: Request, res: Response) => {
  try {
    const state = await getDownloadState(String(req.params.token));
    if ('error' in state) {
      return res.status(404).json({ message: state.error });
    }

    const { purchase, effectiveLimit, isExpired, isLimitReached } = state;
    const canDownload = purchase.status === 'paid' && !isExpired && !isLimitReached;
    const files = listProductDownloadFiles(purchase.product);

    return res.json({
      productTitle: purchase.product.title,
      fileName: files[0]?.fileName || purchase.product.digitalFileName,
      files,
      customerEmail: purchase.customerEmail,
      status: purchase.status,
      downloadCount: purchase.downloadCount,
      downloadLimit: effectiveLimit,
      downloadExpiresAt: purchase.downloadExpiresAt,
      isExpired,
      isLimitReached,
      canDownload,
    });
  } catch (error) {
    console.error('getDownloadInfo error', error);
    return res.status(500).json({ message: 'Unable to load download information.' });
  }
};

export const downloadProduct = async (req: Request, res: Response) => {
  try {
    const state = await getDownloadState(String(req.params.token));
    if ('error' in state) {
      return res.status(404).json({ message: state.error });
    }

    const { purchase, isExpired, isLimitReached } = state;

    if (purchase.status !== 'paid') {
      return res.status(403).json({ message: 'This purchase is not available for download.' });
    }

    if (isExpired) {
      return res.status(403).json({ message: 'This download link has expired.' });
    }

    if (isLimitReached) {
      return res.status(403).json({ message: 'This purchase has reached its download limit.' });
    }

    const fileId = String(req.params.fileId || 'primary');
    const resolvedFile = resolveProductFilePath(purchase.product, fileId);

    if (!resolvedFile) {
      return res.status(404).json({ message: 'The digital file is missing.' });
    }

    const absolutePath = getAbsoluteStoragePath(resolvedFile.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'The digital file is missing from storage.' });
    }

    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchase.id },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.downloadEvent.create({
        data: {
          purchaseId: purchase.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || null,
        },
      }),
    ]);

    return res.download(absolutePath, resolvedFile.fileName);
  } catch (error) {
    console.error('downloadProduct error', error);
    return res.status(500).json({ message: 'Unable to stream the download.' });
  }
};
