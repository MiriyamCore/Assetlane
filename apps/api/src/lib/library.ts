import crypto from 'crypto';
import prisma from './prisma';
import { getSettingsMap } from './settings';
import { PRODUCT_NAME } from './platform';
import { sendLibraryAccessEmail } from '../services/email.service';

const SESSION_TTL_HOURS = 24;

export const createLibrarySession = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_TTL_HOURS);

  const session = await prisma.librarySession.create({
    data: {
      email: normalizedEmail,
      accessToken: crypto.randomUUID(),
      expiresAt,
    },
  });

  const settings = await getSettingsMap();
  const storeUrl = settings.storeUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const libraryLink = `${storeUrl}/library?token=${session.accessToken}`;

  await sendLibraryAccessEmail({
    to: normalizedEmail,
    libraryLink,
    storeName: settings.storeName || PRODUCT_NAME,
    supportEmail: settings.supportEmail || 'support@example.com',
  });

  return session;
};

export const getLibrarySession = async (accessToken: string) => {
  const session = await prisma.librarySession.findUnique({
    where: { accessToken },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
};

export const listLibraryPurchases = async (email: string) =>
  prisma.purchase.findMany({
    where: {
      customerEmail: email,
      status: 'paid',
    },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { purchasedAt: 'desc' },
  });
