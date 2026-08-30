import { ProductStatus, PurchaseStatus } from '@prisma/client';

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
  digitalFileName: string | null;
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
});

export const serializePurchase = (purchase: {
  id: string;
  productId: string;
  customerEmail: string;
  customerName: string | null;
  amountCents: number;
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
  stripeCheckoutSessionId: purchase.externalCheckoutId,
});
