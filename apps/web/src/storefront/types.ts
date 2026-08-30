import type { ComponentType, FormEvent } from 'react';
import type { DownloadPayload, PaymentMethod, Product, PublicSettings } from '../types/store';

export type StoreThemeId = string;

export type StorefrontThemeProps = {
  products: Product[];
  featuredProduct: Product | null;
  loading: boolean;
  error: string;
  settings: PublicSettings;
};

export type ProductThemeProps = {
  product: Product;
  settings: PublicSettings;
  customerEmail: string;
  customerName: string;
  submitting: boolean;
  error: string;
  paymentMethod: PaymentMethod;
  paymentMethods: PaymentMethod[];
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCustomerEmailChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onCheckout: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export type SuccessThemeProps = {
  settings: PublicSettings;
  orderReference?: string | null | undefined;
};

export type CancelThemeProps = {
  productSlug?: string | null | undefined;
};

export type DownloadThemeProps = {
  payload: DownloadPayload;
  token: string;
  settings: PublicSettings;
};

export type StoreThemeDefinition = {
  id: StoreThemeId;
  title: string;
  description: string;
  HomePage: ComponentType<StorefrontThemeProps>;
  ProductPage: ComponentType<ProductThemeProps>;
  SuccessPage: ComponentType<SuccessThemeProps>;
  CancelPage: ComponentType<CancelThemeProps>;
  DownloadPage: ComponentType<DownloadThemeProps>;
};
