import fs from 'fs';
import { Request, Response } from 'express';
import { ProductStatus, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { getAbsoluteStoragePath, inferImageMimeType, sanitizeFilename } from '../lib/storage';
import { serializeProduct } from '../lib/serializers';

const toSlug = (value: string) =>
  sanitizeFilename(value)
    .replace(/\.[^.]+$/, '')
    .replace(/^-|-$/g, '');

const productSelection = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  description: true,
  tags: true,
  priceCents: true,
  currency: true,
  status: true,
  version: true,
  changelog: true,
  seoTitle: true,
  metaDescription: true,
  featuredImagePath: true,
  galleryImagePaths: true,
  digitalFileName: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
} satisfies Prisma.ProductSelect;

const parseGalleryPaths = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

const parseStoredTags = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const parseTags = (value: string | undefined) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const adminView = req.query.admin === 'true';
    const where: Prisma.ProductWhereInput = {};

    if (status) {
      where.status = status as ProductStatus;
    } else if (!adminView) {
      where.status = ProductStatus.published;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: productSelection,
    });

    return res.json(products.map(serializeProduct));
  } catch (error) {
    console.error('getAllProducts error', error);
    return res.status(500).json({ message: 'Unable to fetch products.' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelection,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(serializeProduct(product));
  } catch (error) {
    console.error('getProductById error', error);
    return res.status(500).json({ message: 'Unable to fetch product.' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const product = await prisma.product.findUnique({
      where: { slug },
      select: productSelection,
    });

    if (!product || product.status !== ProductStatus.published) {
      return res.status(404).json({ message: 'Published product not found.' });
    }

    return res.json(serializeProduct(product));
  } catch (error) {
    console.error('getProductBySlug error', error);
    return res.status(500).json({ message: 'Unable to fetch product.' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const featuredImage = files?.featuredImage?.[0] ?? null;
    const galleryImages = files?.galleryImages ?? [];
    const digitalFile = files?.digitalFile?.[0] ?? null;
    const {
      title,
      slug,
      summary,
      description,
      tags,
      priceCents,
      currency,
      status,
      version,
      changelog,
      seoTitle,
      metaDescription,
    } = req.body as Record<string, string | undefined>;

    if (!title || !summary || !description || !priceCents || !currency) {
      return res.status(400).json({ message: 'Title, summary, description, priceCents, and currency are required.' });
    }

    const normalizedSlug = toSlug(slug || title);
    const parsedPriceCents = Number.parseInt(priceCents, 10);
    if (!Number.isFinite(parsedPriceCents) || parsedPriceCents <= 0) {
      return res.status(400).json({ message: 'priceCents must be a positive integer.' });
    }

    const normalizedStatus = (status as ProductStatus | undefined) ?? ProductStatus.draft;
    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        summary: summary.trim(),
        description: description.trim(),
        tags: parseTags(tags),
        priceCents: parsedPriceCents,
        currency: currency.trim().toUpperCase(),
        status: normalizedStatus,
        version: version?.trim() || null,
        changelog: changelog?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        featuredImagePath: featuredImage ? `images/${featuredImage.filename}` : null,
        galleryImagePaths: galleryImages.map((file) => `images/${file.filename}`),
        digitalFilePath: digitalFile ? `digital/${digitalFile.filename}` : null,
        digitalFileName: digitalFile?.originalname || null,
        publishedAt: normalizedStatus === ProductStatus.published ? new Date() : null,
      },
      select: productSelection,
    });

    return res.status(201).json(serializeProduct(product));
  } catch (error) {
    console.error('createProduct error', error);
    return res.status(500).json({ message: 'Unable to create product.' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const featuredImage = files?.featuredImage?.[0] ?? null;
    const galleryImages = files?.galleryImages ?? [];
    const digitalFile = files?.digitalFile?.[0] ?? null;
    const {
      title,
      slug,
      summary,
      description,
      tags,
      priceCents,
      currency,
      status,
      version,
      changelog,
      seoTitle,
      metaDescription,
    } = req.body as Record<string, string | undefined>;

    const nextStatus = (status as ProductStatus | undefined) ?? existing.status;
    const data: Prisma.ProductUpdateInput = {
      title: title?.trim() || existing.title,
      slug: slug ? toSlug(slug) : existing.slug,
      summary: summary?.trim() || existing.summary,
      description: description?.trim() || existing.description,
      tags: tags ? parseTags(tags) : parseStoredTags(existing.tags),
      currency: currency?.trim().toUpperCase() || existing.currency,
      status: nextStatus,
      version: version?.trim() || null,
      changelog: changelog?.trim() || null,
      seoTitle: seoTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
    };

    if (priceCents) {
      const parsedPrice = Number.parseInt(priceCents, 10);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: 'priceCents must be a positive integer.' });
      }

      data.priceCents = parsedPrice;
    }

    if (nextStatus === ProductStatus.published && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    if (nextStatus !== ProductStatus.published) {
      data.publishedAt = null;
    }

    if (featuredImage) {
      data.featuredImagePath = `images/${featuredImage.filename}`;
    }

    if (galleryImages.length > 0) {
      data.galleryImagePaths = galleryImages.map((file) => `images/${file.filename}`);
    }

    if (digitalFile) {
      data.digitalFilePath = `digital/${digitalFile.filename}`;
      data.digitalFileName = digitalFile.originalname;
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      select: productSelection,
    });

    return res.json(serializeProduct(updated));
  } catch (error) {
    console.error('updateProduct error', error);
    return res.status(500).json({ message: 'Unable to update product.' });
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body as { status?: ProductStatus };
    if (!status || !Object.values(ProductStatus).includes(status)) {
      return res.status(400).json({ message: 'A valid status is required.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ProductStatus.published ? new Date() : null,
      },
      select: productSelection,
    });

    return res.json(serializeProduct(updated));
  } catch (error) {
    console.error('updateProductStatus error', error);
    return res.status(500).json({ message: 'Unable to update product status.' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    return res.json({ success: true });
  } catch (error) {
    console.error('deleteProduct error', error);
    return res.status(500).json({ message: 'Unable to delete product.' });
  }
};

export const streamFeaturedImage = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      select: { featuredImagePath: true },
    });

    if (!product?.featuredImagePath) {
      return res.status(404).json({ message: 'Featured image not found.' });
    }

    const absolutePath = getAbsoluteStoragePath(product.featuredImagePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Featured image file missing.' });
    }

    res.setHeader('Content-Type', inferImageMimeType(absolutePath));
    return res.sendFile(absolutePath);
  } catch (error) {
    console.error('streamFeaturedImage error', error);
    return res.status(500).json({ message: 'Unable to serve featured image.' });
  }
};

export const streamGalleryImage = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const requestedPath = req.query.path;
    if (typeof requestedPath !== 'string') {
      return res.status(400).json({ message: 'Image path is required.' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { galleryImagePaths: true },
    });

    const galleryPaths = parseGalleryPaths(product?.galleryImagePaths);
    if (!galleryPaths.includes(requestedPath)) {
      return res.status(404).json({ message: 'Gallery image not found.' });
    }

    const absolutePath = getAbsoluteStoragePath(requestedPath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Gallery image file missing.' });
    }

    res.setHeader('Content-Type', inferImageMimeType(absolutePath));
    return res.sendFile(absolutePath);
  } catch (error) {
    console.error('streamGalleryImage error', error);
    return res.status(500).json({ message: 'Unable to serve gallery image.' });
  }
};
