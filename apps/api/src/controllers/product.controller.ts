import fs from 'fs';
import { Request, Response } from 'express';
import { ProductStatus, Prisma } from '@prisma/client';
import { normalizeStoreCurrency } from '../lib/currency';
import prisma from '../lib/prisma';
import { getSettingsMap } from '../lib/settings';
import { getAbsoluteStoragePath, inferImageMimeType, sanitizeFilename } from '../lib/storage';
import { serializeProduct } from '../lib/serializers';
import { parseProductAttributes } from '../lib/product-attributes';

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
  attributes: true,
  priceCents: true,
  currency: true,
  status: true,
  version: true,
  changelog: true,
  seoTitle: true,
  metaDescription: true,
  featuredImagePath: true,
  galleryImagePaths: true,
  digitalFilePath: true,
  digitalFileName: true,
  files: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      id: true,
      fileName: true,
      label: true,
      sortOrder: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
} satisfies Prisma.ProductSelect;

const collectDigitalUploads = (files: Record<string, Express.Multer.File[]> | undefined) => {
  const uploads = [...(files?.digitalFiles || [])];
  if (files?.digitalFile?.[0]) {
    uploads.unshift(files.digitalFile[0]);
  }
  return uploads;
};

const persistDigitalUploads = async (productId: string, uploads: Express.Multer.File[], hasPrimary: boolean) => {
  if (uploads.length === 0) {
    return;
  }

  const [primaryUpload, ...additionalUploads] = uploads;

  if (!hasPrimary && primaryUpload) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        digitalFilePath: `digital/${primaryUpload.filename}`,
        digitalFileName: primaryUpload.originalname,
      },
    });
  } else if (primaryUpload) {
    additionalUploads.unshift(primaryUpload);
  }

  if (additionalUploads.length > 0) {
    const existingCount = await prisma.productFile.count({ where: { productId } });
    await prisma.productFile.createMany({
      data: additionalUploads.map((file, index) => ({
        productId,
        filePath: `digital/${file.filename}`,
        fileName: file.originalname,
        sortOrder: existingCount + index,
      })),
    });
  }
};

const parseFileLabels = (value: string | undefined) => {
  if (!value?.trim()) {
    return {} as Record<string, string>;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, label]) => typeof label === 'string' && label.trim())
        .map(([fileId, label]) => [fileId, (label as string).trim()]),
    );
  } catch {
    return {};
  }
};

const applyFileLabels = async (productId: string, fileLabels: Record<string, string>) => {
  const entries = Object.entries(fileLabels);
  if (entries.length === 0) {
    return;
  }

  await Promise.all(
    entries.map(([fileId, label]) => {
      if (fileId === 'primary') {
        return Promise.resolve();
      }

      return prisma.productFile.updateMany({
        where: { id: fileId, productId },
        data: { label },
      });
    }),
  );
};

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
    const digitalUploads = collectDigitalUploads(files);
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
      attributes,
      fileLabels,
    } = req.body as Record<string, string | undefined>;

    if (!title || !summary || !description || !priceCents) {
      return res.status(400).json({ message: 'Title, summary, description, and priceCents are required.' });
    }

    const settings = await getSettingsMap();
    const storeCurrency = normalizeStoreCurrency(settings.defaultCurrency);

    const normalizedSlug = toSlug(slug || title);
    const parsedPriceCents = Number.parseInt(priceCents, 10);
    if (!Number.isFinite(parsedPriceCents) || parsedPriceCents < 0) {
      return res.status(400).json({ message: 'priceCents must be zero or a positive integer.' });
    }

    const normalizedStatus = (status as ProductStatus | undefined) ?? ProductStatus.draft;
    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        summary: summary.trim(),
        description: description.trim(),
        tags: parseTags(tags),
        attributes: parseProductAttributes(attributes),
        priceCents: parsedPriceCents,
        currency: storeCurrency,
        status: normalizedStatus,
        version: version?.trim() || null,
        changelog: changelog?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        featuredImagePath: featuredImage ? `images/${featuredImage.filename}` : null,
        galleryImagePaths: galleryImages.map((file) => `images/${file.filename}`),
        digitalFilePath: digitalUploads[0] ? `digital/${digitalUploads[0].filename}` : null,
        digitalFileName: digitalUploads[0]?.originalname || null,
        publishedAt: normalizedStatus === ProductStatus.published ? new Date() : null,
      },
      select: productSelection,
    });

    if (digitalUploads.length > 1) {
      await prisma.productFile.createMany({
        data: digitalUploads.slice(1).map((file, index) => ({
          productId: product.id,
          filePath: `digital/${file.filename}`,
          fileName: file.originalname,
          sortOrder: index,
        })),
      });
    }

    await applyFileLabels(product.id, parseFileLabels(fileLabels));

    const hydrated = await prisma.product.findUnique({
      where: { id: product.id },
      select: productSelection,
    });

    return res.status(201).json(serializeProduct(hydrated || product));
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
    const digitalUploads = collectDigitalUploads(files);
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
      attributes,
      fileLabels,
    } = req.body as Record<string, string | undefined>;

    const settings = await getSettingsMap();
    const storeCurrency = normalizeStoreCurrency(settings.defaultCurrency);
    const nextStatus = (status as ProductStatus | undefined) ?? existing.status;
    const data: Prisma.ProductUpdateInput = {
      title: title?.trim() || existing.title,
      slug: slug ? toSlug(slug) : existing.slug,
      summary: summary?.trim() || existing.summary,
      description: description?.trim() || existing.description,
      tags: tags ? parseTags(tags) : parseStoredTags(existing.tags),
      attributes: attributes !== undefined ? parseProductAttributes(attributes) : parseProductAttributes(existing.attributes),
      currency: storeCurrency,
      status: nextStatus,
      version: version?.trim() || null,
      changelog: changelog?.trim() || null,
      seoTitle: seoTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
    };

    if (priceCents) {
      const parsedPrice = Number.parseInt(priceCents, 10);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'priceCents must be zero or a positive integer.' });
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

    if (digitalUploads.length > 0) {
      if (!existing.digitalFilePath && digitalUploads[0]) {
        data.digitalFilePath = `digital/${digitalUploads[0].filename}`;
        data.digitalFileName = digitalUploads[0].originalname;
        await persistDigitalUploads(existing.id, digitalUploads.slice(1), true);
      } else {
        await persistDigitalUploads(existing.id, digitalUploads, Boolean(existing.digitalFilePath));
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      select: productSelection,
    });

    await applyFileLabels(id, parseFileLabels(fileLabels));

    const hydrated = await prisma.product.findUnique({
      where: { id },
      select: productSelection,
    });

    return res.json(serializeProduct(hydrated || updated));
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
