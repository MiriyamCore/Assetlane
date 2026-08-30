import { createContext, useContext } from 'react';
import type { HomePageContext, ProductPageContext } from '../types';

const HomeContext = createContext<HomePageContext | null>(null);
const ProductContext = createContext<ProductPageContext | null>(null);

export function ThemeHomeProvider({ value, children }: { value: HomePageContext; children: React.ReactNode }) {
  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function ThemeProductProvider({ value, children }: { value: ProductPageContext; children: React.ReactNode }) {
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useThemeHomeContext() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useThemeHomeContext must be used within ThemeHomeProvider');
  }
  return context;
}

export function useThemeProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useThemeProductContext must be used within ThemeProductProvider');
  }
  return context;
}

export function useSite() {
  return useThemeHomeContext().site;
}

export function useCatalogCopy() {
  const context = useThemeHomeContext();
  return {
    catalog: context.catalog,
    emptyCatalog: context.emptyCatalog,
  };
}

export function useHeroCopy() {
  return useThemeHomeContext().hero;
}

export function useProducts() {
  return useThemeHomeContext().products;
}

export function useFeaturedProduct() {
  return useThemeHomeContext().featuredProduct;
}

export function useHomeLayout() {
  return useThemeHomeContext().layout;
}

export function useThemeManifest() {
  return useThemeHomeContext().theme;
}

export function useHomeFlags() {
  return useThemeHomeContext().flags;
}

export function useProductSite() {
  return useThemeProductContext().site;
}

export function useProductThemeManifest() {
  return useThemeProductContext().theme;
}

export function useProduct() {
  return useThemeProductContext().product;
}

export function useProductUrls() {
  return useThemeProductContext().urls;
}
