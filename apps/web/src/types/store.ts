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
  heroImagePath: string;
  logoUrl: string;
  faviconUrl: string;
  heroImageUrl: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  bodyFontPreset: string;
  headingFontPreset: string;
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
  faqTitle: string;
  faqBody: string;
  trustTitle: string;
  trustBlock1Title: string;
  trustBlock1Body: string;
  trustBlock2Title: string;
  trustBlock2Body: string;
  trustBlock3Title: string;
  trustBlock3Body: string;
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
  attributes: ProductAttribute[];
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
  files?: ProductFile[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PaymentMethod = 'stripe' | 'bkash' | 'free';

export type ProductFile = {
  id: string;
  fileName: string;
  label?: string | null;
  sortOrder: number;
};

export type ProductAttribute = {
  label: string;
  value: string;
};

export type Purchase = {
  id: string;
  productId: string;
  customerEmail: string;
  customerName: string | null;
  amountCents: number;
  amount: number;
  originalAmount?: number | null;
  discountAmount?: number;
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
  files?: ProductFile[];
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

export type UserRole = 'owner' | 'admin' | 'viewer';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type TeamMember = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
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
  attributes: ProductAttribute[];
  featuredImage: File | null;
  galleryImages: File[];
  digitalFile: File | null;
  digitalFiles: File[];
};
