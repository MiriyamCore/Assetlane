export type ThemeOption = string;
export type HomepageMode = 'hero-grid' | 'catalog-first' | 'featured-first';

export type StoreMode = 'full' | 'headless' | 'hybrid';

export type PublicSettings = {
  storeName: string;
  storeDescription: string;
  storeUrl: string;
  storeMode: StoreMode;
  supportEmail: string;
  defaultCurrency: string;
  downloadExpiryDays: string;
  downloadLimit: string;
  footerText: string;
  termsUrl: string;
  privacyUrl: string;
  logoPath: string;
  faviconPath: string;
  logoUrl: string;
  faviconUrl: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  homepageMode: HomepageMode;
  featuredProductSlug: string;
  showHeroHighlights: string;
  catalogEyebrow: string;
  catalogTitle: string;
  catalogDescription: string;
  emptyCatalogTitle: string;
  emptyCatalogMessage: string;
  aboutTitle: string;
  aboutBody: string;
  announcementText: string;
  announcementUrl: string;
  socialWebsite: string;
  socialTwitter: string;
  socialInstagram: string;
  socialYoutube: string;
  showPublicAdminLinks: string;
  storefrontTheme: ThemeOption;
  storefrontThemeBase: ThemeOption;
  storefrontThemeStylesheetUrl: string;
  storefrontThemePackageLayout: string;
};

export type StoreTheme = {
  id: string;
  title: string;
  description: string;
  version?: string;
  author?: string;
  baseTheme: string;
  source: 'bundled' | 'package';
  stylesheetUrl?: string;
  previewImageUrl?: string;
  downloadUrl?: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  tags: string[];
  priceCents: number;
  price: number;
  currency: string;
  status: 'draft' | 'published' | 'archived';
  version: string | null;
  changelog: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  featuredImageUrl: string | null;
  galleryImageUrls: string[];
  digitalFileName: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PaymentMethod = 'stripe' | 'bkash';

export type Purchase = {
  id: string;
  productId: string;
  customerEmail: string;
  customerName: string | null;
  amountCents: number;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'refunded' | 'expired';
  paymentProvider: PaymentMethod;
  externalCheckoutId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  bkashTrxId: string | null;
  downloadToken: string;
  downloadExpiresAt: string | null;
  downloadCount: number;
  downloadLimit: number;
  purchasedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title: string;
    slug: string;
  };
  downloadEvents?: Array<{
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    downloadedAt: string;
  }>;
};

export type DownloadPayload = {
  productTitle: string;
  fileName: string | null;
  customerEmail: string;
  status: string;
  downloadCount: number;
  downloadLimit: number;
  downloadExpiresAt: string | null;
  isExpired: boolean;
  isLimitReached: boolean;
  canDownload: boolean;
};

export type StatsPayload = {
  totalRevenueCents: number;
  totalPurchases: number;
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  pendingOrders: number;
  averageOrderValueCents: number;
  totalDownloads: number;
  revenueLast30DaysCents: number;
  ordersLast30Days: number;
  recentPurchases: Purchase[];
  topSellingProducts: Array<{
    productId: string;
    title: string;
    salesCount: number;
    revenueCents: number;
  }>;
};

export type AuthUser = {
  id: string;
  email: string;
};

export type SettingsMap = Record<string, string>;

export type ProductFormState = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  tags: string;
  priceCents: string;
  currency: string;
  status: 'draft' | 'published' | 'archived';
  version: string;
  changelog: string;
  seoTitle: string;
  metaDescription: string;
  featuredImage: File | null;
  galleryImages: File[];
  digitalFile: File | null;
};
