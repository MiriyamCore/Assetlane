import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getStats = async (_req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      revenue,
      totalPurchases,
      totalProducts,
      publishedProducts,
      draftProducts,
      pendingOrders,
      downloadTotals,
      revenueLast30Days,
      ordersLast30Days,
      recentPurchases,
      topSellingProducts,
    ] = await Promise.all([
      prisma.purchase.aggregate({
        where: { status: 'paid' },
        _sum: { amountCents: true },
      }),
      prisma.purchase.count({
        where: { status: 'paid' },
      }),
      prisma.product.count(),
      prisma.product.count({
        where: { status: 'published' },
      }),
      prisma.product.count({
        where: { status: 'draft' },
      }),
      prisma.purchase.count({
        where: { status: 'pending' },
      }),
      prisma.purchase.aggregate({
        where: { status: 'paid' },
        _sum: { downloadCount: true },
      }),
      prisma.purchase.aggregate({
        where: {
          status: 'paid',
          purchasedAt: { gte: thirtyDaysAgo },
        },
        _sum: { amountCents: true },
      }),
      prisma.purchase.count({
        where: {
          status: 'paid',
          purchasedAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.purchase.findMany({
        where: { status: 'paid' },
        include: {
          product: {
            select: { title: true },
          },
        },
        orderBy: { purchasedAt: 'desc' },
        take: 5,
      }),
      prisma.purchase.groupBy({
        by: ['productId'],
        where: { status: 'paid' },
        _sum: { amountCents: true },
        _count: { _all: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      }),
    ]);

    const totalRevenueCents = revenue._sum.amountCents || 0;

    const products = topSellingProducts.length
      ? await prisma.product.findMany({
          where: { id: { in: topSellingProducts.map((item) => item.productId) } },
          select: { id: true, title: true },
        })
      : [];

    const titleById = new Map(products.map((product) => [product.id, product.title]));

    return res.json({
      totalRevenueCents,
      totalPurchases,
      totalProducts,
      publishedProducts,
      draftProducts,
      pendingOrders,
      averageOrderValueCents: totalPurchases > 0 ? Math.round(totalRevenueCents / totalPurchases) : 0,
      totalDownloads: downloadTotals._sum.downloadCount || 0,
      revenueLast30DaysCents: revenueLast30Days._sum.amountCents || 0,
      ordersLast30Days,
      recentPurchases: recentPurchases.map((purchase) => ({
        ...purchase,
        amount: purchase.amountCents / 100,
      })),
      topSellingProducts: topSellingProducts.map((item) => ({
        productId: item.productId,
        title: titleById.get(item.productId) || 'Unknown product',
        salesCount: item._count._all,
        revenueCents: item._sum.amountCents || 0,
      })),
    });
  } catch (error) {
    console.error('getStats error', error);
    return res.status(500).json({ message: 'Unable to fetch dashboard stats.' });
  }
};
