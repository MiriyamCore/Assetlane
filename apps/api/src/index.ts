import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import checkoutRoutes from './routes/checkout.routes';
import discountRoutes from './routes/discount.routes';
import downloadRoutes from './routes/download.routes';
import libraryRoutes from './routes/library.routes';
import productRoutes from './routes/product.routes';
import purchaseRoutes from './routes/purchase.routes';
import settingsRoutes from './routes/settings.routes';
import setupRoutes from './routes/setup.routes';
import statsRoutes from './routes/stats.routes';
import themeRoutes from './routes/theme.routes';
import v1Routes from './routes/v1.routes';
import webhookRoutes from './routes/webhook.routes';
import { brandingStorageRoot, bundledThemePreviewRoot, ensureStorageDirectories, themeInstallRoot } from './lib/storage';
import { ensureDefaultSettings } from './lib/settings';
import { handleWebhook } from './controllers/checkout.controller';
import { createCorsMiddleware } from './lib/cors';
import { authRateLimiter, checkoutRateLimiter, downloadRateLimiter } from './middleware/security';
import { requireSetupComplete } from './middleware/setup.middleware';
import { PRODUCT_NAME } from './lib/platform';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET?.trim()) {
  throw new Error('JWT_SECRET is required in production.');
}

const app = express();
const port = Number.parseInt(process.env.PORT || '5001', 10);

ensureStorageDirectories();
void ensureDefaultSettings();

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleWebhook);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(createCorsMiddleware());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/setup', setupRoutes);
app.use('/api/v1', v1Routes);

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/checkout', requireSetupComplete, checkoutRateLimiter, checkoutRoutes);
app.use('/api/discounts', requireSetupComplete, discountRoutes);
app.use('/api/downloads', requireSetupComplete, downloadRateLimiter, downloadRoutes);
app.use('/api/library', requireSetupComplete, libraryRoutes);
app.use('/api/products', requireSetupComplete, productRoutes);
app.use('/api/purchases', requireSetupComplete, purchaseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', requireSetupComplete, statsRoutes);
app.use('/api/themes', requireSetupComplete, themeRoutes);
app.use('/api/webhooks', requireSetupComplete, webhookRoutes);
app.use('/theme-assets', express.static(themeInstallRoot));
app.use('/theme-previews', express.static(bundledThemePreviewRoot));
app.use('/branding-assets', express.static(brandingStorageRoot));

app.listen(port, () => {
  console.log(`${PRODUCT_NAME} API listening on port ${port}`);
});
