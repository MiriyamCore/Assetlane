export const SDK_VERSION = '1.0.0';

export type SettingsRecord = Record<string, string | undefined>;

export type ThemeBase = 'atelier' | 'paper' | 'ember' | 'canvas';

export type HomepageMode = 'hero-grid' | 'catalog-first' | 'featured-first';

export type HomeSection = 'hero' | 'featured' | 'catalog' | 'about';

export type ThemePageContext = 'home' | 'product' | 'success' | 'cancel' | 'download';

export type ThemeProduct = {
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

export type SocialLink = {
  key: string;
  label: string;
  url: string;
};

export type SiteData = {
  name: string;
  description: string;
  url: string;
  supportEmail: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  currency: string;
  termsUrl: string;
  privacyUrl: string;
  downloadExpiryDays: string;
  downloadLimit: string;
  socialLinks: SocialLink[];
};

export type CatalogCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

export type EmptyCatalogCopy = {
  title: string;
  message: string;
};

export type HeroCopy = {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
};

export type AboutCopy = {
  title: string;
  body: string;
};

export type AnnouncementData = {
  text: string;
  url: string;
};

export type ThemeTokens = {
  base: ThemeBase;
  catalogGridClass: string;
  dataAttributes: {
    theme: ThemeBase;
    storeTheme: string;
  };
};

export type ThemeManifest = {
  id: string;
  title: string;
  description: string;
  version?: string;
  author?: string;
  base: ThemeBase;
  source: 'bundled' | 'package';
  stylesheetUrl?: string;
  previewImageUrl?: string;
  minAssetlaneVersion?: string;
  custom?: Record<string, unknown>;
  packageLayout?: ThemePackageLayout;
  tokens: ThemeTokens;
};

export type ThemePackageLayout = {
  home?: {
    sections?: HomeSection[];
    showHeroHighlights?: boolean;
  };
};

/** Admin-driven homepage hints. Themes may follow, adapt, or ignore these entirely. */
export type HomeLayout = {
  homepageMode: HomepageMode;
  sections: HomeSection[];
  showCatalogFirst: boolean;
  showFeaturedFirst: boolean;
  showHeroHighlights: boolean;
  featuredProductLink: string;
};

export type HomePageContext = {
  context: 'home';
  sdkVersion: string;
  site: SiteData;
  theme: ThemeManifest;
  hero: HeroCopy;
  catalog: CatalogCopy;
  emptyCatalog: EmptyCatalogCopy;
  about: AboutCopy;
  announcement: AnnouncementData | null;
  products: ThemeProduct[];
  featuredProduct: ThemeProduct | null;
  layout: HomeLayout;
  flags: {
    hasAbout: boolean;
    hasAnnouncement: boolean;
    hasProducts: boolean;
  };
  loading?: boolean;
  error?: string;
};

export type ProductPageContext = {
  context: 'product';
  sdkVersion: string;
  site: SiteData;
  theme: ThemeManifest;
  product: ThemeProduct;
  urls: {
    product: string;
    checkout: string;
  };
};

export type ThemeSdkResponse = {
  sdkVersion: string;
  helpers: ThemeHelperDefinition[];
  theme: ThemeManifest;
  contexts: {
    home: string;
    product: string;
  };
};

export type ThemeHelperDefinition = {
  name: string;
  kind: 'data' | 'functional' | 'format';
  description: string;
  react: string;
  headless: string;
};
