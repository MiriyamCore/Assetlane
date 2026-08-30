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
