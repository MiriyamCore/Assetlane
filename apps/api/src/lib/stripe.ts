import Stripe from 'stripe';
import { getSettingsMap } from './settings';

export const getStripeSecretKey = async () => {
  const settings = await getSettingsMap();
  return process.env.STRIPE_SECRET_KEY?.trim() || settings.stripeSecretKey?.trim() || '';
};

export const getStripeWebhookSecret = async () => {
  const settings = await getSettingsMap();
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || settings.stripeWebhookSecret?.trim() || '';
};

export const getStripeClient = async () => {
  const secretKey = await getStripeSecretKey();
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia' as any,
  });
};
