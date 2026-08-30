import { getStripeClient } from './stripe';
import { isBkashConfigured } from './bkash';
import { getSettingsMap } from './settings';

export type PaymentMethod = 'stripe' | 'bkash';

export const getEnabledPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const settings = await getSettingsMap();
  const mode = settings.paymentProviderMode || 'stripe';
  const methods: PaymentMethod[] = [];

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() || settings.stripeSecretKey?.trim(),
  );
  const bkashConfigured = await isBkashConfigured();

  if (mode === 'stripe' || mode === 'both') {
    if (stripeConfigured) methods.push('stripe');
  }

  if (mode === 'bkash' || mode === 'both') {
    if (bkashConfigured) methods.push('bkash');
  }

  if (methods.length === 0 && stripeConfigured) {
    methods.push('stripe');
  }

  return methods;
};

export const resolvePaymentMethod = async (requested?: string): Promise<PaymentMethod> => {
  const enabled = await getEnabledPaymentMethods();
  if (enabled.length === 0) {
    throw new Error('No payment provider is configured.');
  }

  if (requested === 'bkash' && enabled.includes('bkash')) {
    return 'bkash';
  }

  if (requested === 'stripe' && enabled.includes('stripe')) {
    return 'stripe';
  }

  return enabled[0]!;
};

export const isStripeConfigured = async () => {
  const settings = await getSettingsMap();
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() || settings.stripeSecretKey?.trim());
};

export const assertStripeReady = async () => {
  if (!(await isStripeConfigured())) {
    throw new Error('Stripe is not configured.');
  }
  await getStripeClient();
};
