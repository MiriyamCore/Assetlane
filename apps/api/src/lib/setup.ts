import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { getSettingsMap, upsertSettings } from './settings';
import crypto from 'crypto';

export const isSetupComplete = async () => {
  const settings = await getSettingsMap();
  if (settings.setupCompleted === 'true') {
    return true;
  }

  const userCount = await prisma.user.count();
  return userCount > 0;
};

export const getSetupStatus = async () => {
  const complete = await isSetupComplete();
  return { completed: complete };
};

const generateKey = () => crypto.randomBytes(24).toString('hex');

export type SetupPayload = {
  adminEmail: string;
  adminPassword: string;
  storeName: string;
  storeDescription: string;
  storeUrl?: string;
  supportEmail?: string;
  defaultCurrency?: string;
  stripeSecretKey?: string;
  stripePublicKey?: string;
  stripeWebhookSecret?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
};

export const completeSetup = async (payload: SetupPayload) => {
  if (await isSetupComplete()) {
    throw new Error('Setup has already been completed.');
  }

  const email = payload.adminEmail.trim().toLowerCase();
  if (!email || !payload.adminPassword || payload.adminPassword.length < 8) {
    throw new Error('Admin email and an 8+ character password are required.');
  }

  if (!payload.storeName?.trim() || !payload.storeDescription?.trim()) {
    throw new Error('Store name and description are required.');
  }

  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    throw new Error('An admin account already exists.');
  }

  const passwordHash = await bcrypt.hash(payload.adminPassword, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
    },
  });

  const storeUrl = payload.storeUrl?.trim() || process.env.FRONTEND_URL || 'http://localhost:5173';
  const headlessApiKey = generateKey();
  const headlessSecretKey = generateKey();

  await upsertSettings({
    setupCompleted: 'true',
    storeName: payload.storeName.trim(),
    storeDescription: payload.storeDescription.trim(),
    storeUrl,
    supportEmail: payload.supportEmail?.trim() || email,
    defaultCurrency: payload.defaultCurrency?.trim() || 'USD',
    footerText: payload.storeDescription.trim(),
    storeMode: 'hybrid',
    headlessApiKey,
    headlessSecretKey,
    stripeSecretKey: payload.stripeSecretKey?.trim() || '',
    stripePublicKey: payload.stripePublicKey?.trim() || '',
    stripeWebhookSecret: payload.stripeWebhookSecret?.trim() || '',
    smtpHost: payload.smtpHost?.trim() || '',
    smtpPort: payload.smtpPort?.trim() || '587',
    smtpUser: payload.smtpUser?.trim() || '',
    smtpPass: payload.smtpPass?.trim() || '',
    smtpFrom: payload.smtpFrom?.trim() || `noreply@${email.split('@')[1] || 'assetlane.local'}`,
  });

  return { userId: user.id, email: user.email };
};
