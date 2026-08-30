import type { HomepageMode, HomeSection, HomeLayout, SettingsRecord, ThemeBase, ThemePackageLayout, ThemeProduct } from '../types';
import { isTruthySetting, readSetting } from './settings';
import { getHomepageMode } from './site';

export const resolveThemeBase = (value: string | undefined): ThemeBase => {
  if (value === 'paper' || value === 'ember' || value === 'canvas') {
    return value;
  }
  return 'atelier';
};

export const catalogGridClass = (themeBase: ThemeBase) => {
  if (themeBase === 'paper') return 'product-grid product-grid-paper';
  if (themeBase === 'ember') return 'product-grid product-grid-ember';
  if (themeBase === 'canvas') return 'product-grid product-grid-canvas';
  return 'product-grid';
};

export const resolveFeaturedProduct = (products: ThemeProduct[], settings: SettingsRecord) => {
  const featuredSlug = readSetting(settings, 'featuredProductSlug');
  if (featuredSlug) {
    const match = products.find((product) => product.slug === featuredSlug);
    if (match) {
      return match;
    }
  }

  if (getHomepageMode(settings) === 'featured-first') {
    return products[0] || null;
  }

  return null;
};

export const getProductPath = (slug: string) => `/product/${slug}`;

export const getProductUrl = (slug: string, settings: SettingsRecord) => {
  const storeUrl = readSetting(settings, 'storeUrl').replace(/\/+$/, '');
  const path = getProductPath(slug);
  return storeUrl ? `${storeUrl}${path}` : path;
};

export const getFeaturedProductLink = (products: ThemeProduct[]) => {
  const firstProduct = products[0];
  return firstProduct ? getProductPath(firstProduct.slug) : '#products';
};

export const getHomeSections = (
  settings: SettingsRecord,
  options?: { featuredProduct?: ThemeProduct | null },
): HomeSection[] => {
  const mode = getHomepageMode(settings);
  const featuredProduct = options?.featuredProduct ?? null;
  const sections: HomeSection[] = [];

  if (mode === 'catalog-first') {
    sections.push('catalog', 'hero');
  } else {
    sections.push('hero');
    if (mode === 'featured-first' && featuredProduct) {
      sections.push('featured');
    }
    sections.push('catalog');
  }

  sections.push('about');
  return sections;
};

export const resolvePackageHomeLayout = (
  layout: HomeLayout,
  packageHome?: ThemePackageLayout['home'],
): HomeLayout => {
  if (!packageHome) {
    return layout;
  }

  const sections = packageHome.sections ?? layout.sections;
  const showHeroHighlights = packageHome.showHeroHighlights ?? layout.showHeroHighlights;

  return {
    ...layout,
    sections,
    showHeroHighlights,
    showCatalogFirst: sections[0] === 'catalog',
    showFeaturedFirst: sections.includes('featured'),
  };
};

export const getHomeLayout = (
  settings: SettingsRecord,
  products: ThemeProduct[],
  featuredProduct: ThemeProduct | null,
) => {
  const homepageMode = getHomepageMode(settings) as HomepageMode;

  return {
    homepageMode,
    sections: getHomeSections(settings, { featuredProduct }),
    showCatalogFirst: homepageMode === 'catalog-first',
    showFeaturedFirst: homepageMode === 'featured-first' && Boolean(featuredProduct),
    showHeroHighlights: isTruthySetting(readSetting(settings, 'showHeroHighlights')),
    featuredProductLink: getFeaturedProductLink(products),
  };
};
