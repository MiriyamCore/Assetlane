import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getSettingsMap } from '../lib/settings';
import { serializeProduct } from '../lib/serializers';
import { getHomeContextPayload, getProductContextPayload, getThemeSdkPayload } from '../lib/theme-sdk';
import { getPublicSettings } from './settings.controller';
import { createCheckoutSessionInternal } from '../controllers/checkout.controller';

export const listV1Products = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
    });

    return res.json({
      products: products.map((product) => serializeProduct(product)),
    });
  } catch (error) {
    console.error('listV1Products error', error);
    return res.status(500).json({ message: 'Unable to fetch products.' });
  }
};

export const getV1Product = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || '');
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: 'published',
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Published product not found.' });
    }

    return res.json({ product: serializeProduct(product) });
  } catch (error) {
    console.error('getV1Product error', error);
    return res.status(500).json({ message: 'Unable to fetch product.' });
  }
};

export const getV1PublicSettings = async (req: Request, res: Response) => {
  return getPublicSettings(req, res);
};

export const getV1Theme = async (_req: Request, res: Response) => {
  try {
    const payload = await getThemeSdkPayload();
    return res.json(payload);
  } catch (error) {
    console.error('getV1Theme error', error);
    return res.status(500).json({ message: 'Unable to fetch theme SDK payload.' });
  }
};

export const getV1HomeContext = async (_req: Request, res: Response) => {
  try {
    const payload = await getHomeContextPayload();
    return res.json(payload);
  } catch (error) {
    console.error('getV1HomeContext error', error);
    return res.status(500).json({ message: 'Unable to fetch home context.' });
  }
};

export const getV1ProductContext = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || '');
    const payload = await getProductContextPayload(slug);

    if (!payload) {
      return res.status(404).json({ message: 'Published product not found.' });
    }

    return res.json(payload);
  } catch (error) {
    console.error('getV1ProductContext error', error);
    return res.status(500).json({ message: 'Unable to fetch product context.' });
  }
};

export const createV1CheckoutSession = async (req: Request, res: Response) => {
  try {
    const { productSlug, productId, customerEmail, customerName, successUrl, cancelUrl, paymentMethod, discountCode } = req.body as {
      productSlug?: string;
      productId?: string;
      customerEmail?: string;
      customerName?: string;
      successUrl?: string;
      cancelUrl?: string;
      paymentMethod?: string;
      discountCode?: string;
    };

    let resolvedProductId = productId;
    if (!resolvedProductId && productSlug) {
      const product = await prisma.product.findFirst({
        where: { slug: productSlug, status: 'published' },
      });
      resolvedProductId = product?.id;
    }

    if (!resolvedProductId || !customerEmail) {
      return res.status(400).json({ message: 'productSlug or productId and customerEmail are required.' });
    }

    const settings = await getSettingsMap();
    const allowedOrigins = (settings.embedAllowedOrigins || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (successUrl && allowedOrigins.length > 0) {
      const successOrigin = new URL(successUrl).origin;
      if (!allowedOrigins.includes(successOrigin)) {
        return res.status(400).json({ message: 'successUrl origin is not allowlisted.' });
      }
    }

    if (cancelUrl && allowedOrigins.length > 0) {
      const cancelOrigin = new URL(cancelUrl).origin;
      if (!allowedOrigins.includes(cancelOrigin)) {
        return res.status(400).json({ message: 'cancelUrl origin is not allowlisted.' });
      }
    }

    const session = await createCheckoutSessionInternal({
      productId: resolvedProductId,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      paymentMethod,
      discountCode,
    });

    return res.json(session);
  } catch (error) {
    console.error('createV1CheckoutSession error', error);
    const message = error instanceof Error ? error.message : 'Unable to create checkout session.';
    return res.status(500).json({ message });
  }
};
