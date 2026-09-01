import { ProductStatus, PurchaseStatus } from '@prisma/client';
import { listProductDownloadFiles } from './product-files';

export const serializeProduct = (product: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  tags: unknown;
  priceCents: number;
  currency: string;
  status: ProductStatus;
  version: string | null;
  changelog: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  featuredImagePath: string | null;
  galleryImagePaths: unknown;
  digitalFilePath?: string | null;
  digitalFileName: string | null;
  files?: Array<{ id: string; fileName: string; sortOrder: number; filePath?: string }>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}) => ({
  ...product,
  price: product.priceCents / 100,
  tags: Array.isArray(product.tags) ? product.tags : [],
  galleryImagePaths: Array.isArray(product.galleryImagePaths) ? product.galleryImagePaths : [],
  featuredImageUrl: product.featuredImagePath ? `/api/products/${product.id}/featured-image` : null,
  galleryImageUrls: Array.isArray(product.galleryImagePaths)
    ? (product.galleryImagePaths as string[]).map((imagePath) => `/api/products/${product.id}/gallery-image?path=${encodeURIComponent(imagePath)}`)
    : [],
  files: listProductDownloadFiles({
    id: product.id,
    digitalFilePath: product.digitalFilePath || null,
    digitalFileName: product.digitalFileName,
    files: product.files as Array<{ id: string; fileName: string; sortOrder: number }> | undefined,
  }),
});

export const serializePurchase = (purchase: {
  id: string;
  productId: string;
  customerEmail: string;
  customerName: string | null;
  amountCents: number;
  originalAmountCents?: number | null;
  discountAmountCents?: number;
  currency: string;
  status: PurchaseStatus;
  paymentProvider: string;
  externalCheckoutId: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  bkashTrxId: string | null;
  downloadToken: string;
  downloadExpiresAt: Date | null;
  downloadCount: number;
  downloadLimit: number;
  purchasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...purchase,
  amount: purchase.amountCents / 100,
  originalAmount: purchase.originalAmountCents != null ? purchase.originalAmountCents / 100 : null,
  discountAmount: (purchase.discountAmountCents || 0) / 100,
  stripeCheckoutSessionId: purchase.externalCheckoutId,
});
