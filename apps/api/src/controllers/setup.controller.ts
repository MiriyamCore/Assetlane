import { Request, Response } from 'express';
import { completeSetup, getSetupStatus } from '../lib/setup';
import { createAuthToken } from '../lib/auth';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const getSetup = async (_req: Request, res: Response) => {
  try {
    return res.json(await getSetupStatus());
  } catch (error) {
    console.error('getSetup error', error);
    return res.status(500).json({ message: 'Unable to fetch setup status.' });
  }
};

export const postSetup = async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      adminEmail?: string;
      adminPassword?: string;
      storeName?: string;
      storeDescription?: string;
      storeUrl?: string;
      supportEmail?: string;
      defaultCurrency?: string;
      stripeSecretKey?: string;
      stripePublicKey?: string;
      stripeWebhookSecret?: string;
      paymentProviderMode?: string;
      bkashAppKey?: string;
      bkashAppSecret?: string;
      bkashUsername?: string;
      bkashPassword?: string;
      bkashSandbox?: string;
      smtpHost?: string;
      smtpPort?: string;
      smtpUser?: string;
      smtpPass?: string;
      smtpFrom?: string;
    };

    const result = await completeSetup({
      adminEmail: body.adminEmail || '',
      adminPassword: body.adminPassword || '',
      storeName: body.storeName || '',
      storeDescription: body.storeDescription || '',
      storeUrl: body.storeUrl,
      supportEmail: body.supportEmail,
      defaultCurrency: body.defaultCurrency,
      stripeSecretKey: body.stripeSecretKey,
      stripePublicKey: body.stripePublicKey,
      stripeWebhookSecret: body.stripeWebhookSecret,
      paymentProviderMode: body.paymentProviderMode,
      bkashAppKey: body.bkashAppKey,
      bkashAppSecret: body.bkashAppSecret,
      bkashUsername: body.bkashUsername,
      bkashPassword: body.bkashPassword,
      bkashSandbox: body.bkashSandbox,
      smtpHost: body.smtpHost,
      smtpPort: body.smtpPort,
      smtpUser: body.smtpUser,
      smtpPass: body.smtpPass,
      smtpFrom: body.smtpFrom,
    });

    const token = createAuthToken(result.userId);
    res.cookie('assetlane_token', token, authCookieOptions);

    return res.status(201).json({
      completed: true,
      user: {
        id: result.userId,
        email: result.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete setup.';
    return res.status(400).json({ message });
  }
};
