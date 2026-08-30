import crypto from 'crypto';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createBkashPayment, executeBkashPayment } from '../lib/bkash';
import { getEnabledPaymentMethods, resolvePaymentMethod } from '../lib/payments';
import { getSettingsMap, toIntSetting } from '../lib/settings';
import { getStripeClient, getStripeWebhookSecret } from '../lib/stripe';
import { finalizePaidPurchase } from '../services/purchase.service';

type CheckoutSessionInput = {
  productId: string;
  customerEmail: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
  paymentMethod?: string;
};

const createPendingPurchase = async (input: {
  productId: string;
  customerEmail: string;
  customerName?: string;
  amountCents: number;
  currency: string;
  paymentProvider: 'stripe' | 'bkash';
  externalCheckoutId: string;
}) => {
  const settings = await getSettingsMap();
  const downloadLimit = toIntSetting(settings.downloadLimit, 5);

  return prisma.purchase.create({
    data: {
      productId: input.productId,
      customerEmail: input.customerEmail,
      customerName: input.customerName || null,
      amountCents: input.amountCents,
      currency: input.currency,
      status: 'pending',
      paymentProvider: input.paymentProvider,
      externalCheckoutId: input.externalCheckoutId,
      downloadToken: crypto.randomUUID(),
      downloadLimit,
    },
  });
};

const createStripeCheckout = async ({
  productId,
  customerEmail,
  customerName,
  successUrl,
  cancelUrl,
}: CheckoutSessionInput) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== 'published') {
    throw new Error('Published product not found.');
  }

  const settings = await getSettingsMap();
  const stripe = await getStripeClient();
  const storeUrl = settings.storeUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.priceCents,
          product_data: {
            name: product.title,
            description: product.summary,
          },
        },
      },
    ],
    success_url: successUrl || `${storeUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${storeUrl}/cancel?product=${product.slug}`,
    metadata: {
      productId: product.id,
      customerName: customerName || '',
    },
  });

  await createPendingPurchase({
    productId: product.id,
    customerEmail,
    customerName,
    amountCents: product.priceCents,
    currency: product.currency,
    paymentProvider: 'stripe',
    externalCheckoutId: checkoutSession.id,
  });

  return {
    id: checkoutSession.id,
    url: checkoutSession.url,
    provider: 'stripe' as const,
  };
};

const createBkashCheckout = async ({
  productId,
  customerEmail,
  customerName,
  successUrl,
  cancelUrl,
}: CheckoutSessionInput) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== 'published') {
    throw new Error('Published product not found.');
  }

  const settings = await getSettingsMap();
  const apiUrl = process.env.API_PUBLIC_URL || `http://127.0.0.1:${process.env.PORT || 5001}`;
  const storeUrl = settings.storeUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const invoiceNumber = `mc-${product.id.slice(0, 8)}-${Date.now()}`;

  const purchase = await createPendingPurchase({
    productId: product.id,
    customerEmail,
    customerName,
    amountCents: product.priceCents,
    currency: product.currency,
    paymentProvider: 'bkash',
    externalCheckoutId: invoiceNumber,
  });

  const callbackUrl = `${apiUrl}/api/checkout/bkash/callback?purchaseId=${purchase.id}&successUrl=${encodeURIComponent(successUrl || `${storeUrl}/success?purchase_id=${purchase.id}`)}&cancelUrl=${encodeURIComponent(cancelUrl || `${storeUrl}/cancel?product=${product.slug}`)}`;

  const payment = await createBkashPayment({
    amount: product.priceCents,
    currency: product.currency,
    invoiceNumber,
    callbackUrl,
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { externalCheckoutId: payment.paymentId },
  });

  return {
    id: payment.paymentId,
    url: payment.checkoutUrl,
    provider: 'bkash' as const,
  };
};

export const createCheckoutSessionInternal = async (input: CheckoutSessionInput) => {
  const paymentMethod = await resolvePaymentMethod(input.paymentMethod);

  if (paymentMethod === 'bkash') {
    return createBkashCheckout(input);
  }

  return createStripeCheckout(input);
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { productId, customerEmail, customerName, successUrl, cancelUrl, paymentMethod } = req.body as {
      productId?: string;
      customerEmail?: string;
      customerName?: string;
      successUrl?: string;
      cancelUrl?: string;
      paymentMethod?: string;
    };

    if (!productId || !customerEmail) {
      return res.status(400).json({ message: 'productId and customerEmail are required.' });
    }

    const session = await createCheckoutSessionInternal({
      productId,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      paymentMethod,
    });

    return res.json(session);
  } catch (error) {
    console.error('createCheckoutSession error', error);
    const message = error instanceof Error ? error.message : 'Unable to create checkout session.';
    const status = message.includes('not found') ? 404 : 500;
    return res.status(status).json({ message });
  }
};

export const getCheckoutMethods = async (_req: Request, res: Response) => {
  try {
    const methods = await getEnabledPaymentMethods();
    return res.json({ methods });
  } catch (error) {
    console.error('getCheckoutMethods error', error);
    return res.status(500).json({ message: 'Unable to fetch payment methods.' });
  }
};

export const handleBkashCallback = async (req: Request, res: Response) => {
  const paymentId = String(req.query.paymentID || '');
  const purchaseId = String(req.query.purchaseId || '');
  const successUrl = String(req.query.successUrl || '');
  const cancelUrl = String(req.query.cancelUrl || '');

  if (!paymentId || !purchaseId) {
    return res.status(400).send('Missing bKash callback parameters.');
  }

  try {
    const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) {
      return res.status(404).send('Purchase not found.');
    }

    if (purchase.status === 'paid') {
      return res.redirect(successUrl || '/success');
    }

    const result = await executeBkashPayment(paymentId);

    if (result.transactionStatus === 'Completed') {
      await finalizePaidPurchase(purchase.id, { bkashTrxId: result.trxID || undefined });
      return res.redirect(successUrl || '/success');
    }

    await prisma.purchase.updateMany({
      where: { id: purchase.id, status: 'pending' },
      data: { status: 'expired' },
    });

    return res.redirect(cancelUrl || '/cancel');
  } catch (error) {
    console.error('handleBkashCallback error', error);
    return res.redirect(cancelUrl || '/cancel');
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).send('Missing Stripe signature.');
  }

  const webhookSecret = await getStripeWebhookSecret();
  if (!webhookSecret) {
    return res.status(500).send('Stripe webhook secret is not configured.');
  }

  let event: any;

  try {
    const stripe = await getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error('webhook signature error', error);
    return res.status(400).send('Webhook signature verification failed.');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const stripe = await getStripeClient();
        const session = event.data.object as any;
        const purchase = await prisma.purchase.findUnique({
          where: { externalCheckoutId: session.id },
          include: { product: true },
        });

        if (!purchase) {
          break;
        }

        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
        let stripeChargeId: string | null = null;

        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['latest_charge'],
          });

          if (typeof paymentIntent.latest_charge === 'string') {
            stripeChargeId = paymentIntent.latest_charge;
          } else if (paymentIntent.latest_charge) {
            stripeChargeId = paymentIntent.latest_charge.id;
          }
        }

        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            customerName: session.customer_details?.name || purchase.customerName,
            stripePaymentIntentId: paymentIntentId,
            stripeChargeId,
          },
        });

        await finalizePaidPurchase(purchase.id, {
          customerName: session.customer_details?.name || purchase.customerName || undefined,
        });
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as any;
        await prisma.purchase.updateMany({
          where: {
            externalCheckoutId: session.id,
            status: 'pending',
          },
          data: {
            status: 'expired',
          },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        await prisma.purchase.updateMany({
          where: {
            OR: typeof charge.payment_intent === 'string'
              ? [{ stripeChargeId: charge.id }, { stripePaymentIntentId: charge.payment_intent }]
              : [{ stripeChargeId: charge.id }],
          },
          data: {
            status: 'refunded',
          },
        });
        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('handleWebhook error', error);
    return res.status(500).json({ message: 'Unable to process Stripe webhook.' });
  }
};
