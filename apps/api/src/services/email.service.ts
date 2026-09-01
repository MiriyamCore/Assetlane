import nodemailer from 'nodemailer';
import { getSettingsMap } from '../lib/settings';

type DownloadEmailInput = {
  to: string;
  productTitle: string;
  downloadLink: string;
  downloadExpiresAt: Date | null;
  storeName: string;
  supportEmail: string;
};

export const sendDownloadEmail = async ({
  to,
  productTitle,
  downloadLink,
  downloadExpiresAt,
  storeName,
  supportEmail,
}: DownloadEmailInput) => {
  const settings = await getSettingsMap();
  const smtpHost = settings.smtpHost;
  const smtpPort = Number.parseInt(settings.smtpPort || '587', 10);
  const smtpUser = settings.smtpUser;
  const smtpPass = settings.smtpPass;
  const smtpFrom = settings.smtpFrom || 'noreply@assetlane.local';

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP settings are incomplete. Skipping buyer email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const formattedExpiry = downloadExpiresAt ? new Date(downloadExpiresAt).toLocaleString() : 'Unavailable';

  await transporter.sendMail({
    from: `"${storeName}" <${smtpFrom}>`,
    to,
    subject: `Your ${productTitle} download from ${storeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">Thanks for your purchase</h1>
        <p>You now have access to <strong>${productTitle}</strong>.</p>
        <p>
          <a href="${downloadLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">
            Open secure download
          </a>
        </p>
        <p>This link expires on <strong>${formattedExpiry}</strong>.</p>
        <p>If you need help, reply to <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      </div>
    `,
  });
};

type LibraryAccessEmailInput = {
  to: string;
  libraryLink: string;
  storeName: string;
  supportEmail: string;
};

export const sendLibraryAccessEmail = async ({
  to,
  libraryLink,
  storeName,
  supportEmail,
}: LibraryAccessEmailInput) => {
  const settings = await getSettingsMap();
  const smtpHost = settings.smtpHost;
  const smtpPort = Number.parseInt(settings.smtpPort || '587', 10);
  const smtpUser = settings.smtpUser;
  const smtpPass = settings.smtpPass;
  const smtpFrom = settings.smtpFrom || 'noreply@assetlane.local';

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP settings are incomplete. Configure email before sending library links.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"${storeName}" <${smtpFrom}>`,
    to,
    subject: `Your ${storeName} purchase library`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">Open your purchase library</h1>
        <p>Use the secure link below to view and download your purchases from <strong>${storeName}</strong>.</p>
        <p>
          <a href="${libraryLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">
            View my purchases
          </a>
        </p>
        <p>This link expires in 24 hours. You can request a new one anytime from the storefront library page.</p>
        <p>If you need help, reply to <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      </div>
    `,
  });
};

export const sendTestEmail = async (to: string) => {
  const settings = await getSettingsMap();
  const smtpHost = settings.smtpHost;
  const smtpPort = Number.parseInt(settings.smtpPort || '587', 10);
  const smtpUser = settings.smtpUser;
  const smtpPass = settings.smtpPass;
  const smtpFrom = settings.smtpFrom || 'noreply@assetlane.local';
  const storeName = settings.storeName || 'AssetLane';

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP settings are incomplete. Save host, user, and password first.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"${storeName}" <${smtpFrom}>`,
    to,
    subject: `${storeName} — SMTP test`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">SMTP is working</h1>
        <p>This is a test message from your AssetLane store. Buyer download emails will use the same configuration.</p>
      </div>
    `,
  });
};
