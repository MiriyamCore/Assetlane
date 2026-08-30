import { Router } from 'express';
import {
  createV1CheckoutSession,
  getV1HomeContext,
  getV1Product,
  getV1ProductContext,
  getV1PublicSettings,
  getV1Theme,
  listV1Products,
} from '../controllers/v1.controller';
import { checkoutRateLimiter } from '../middleware/security';
import { requireHeadlessSecret } from '../middleware/headless.middleware';
import { requireSetupComplete } from '../middleware/setup.middleware';

const router = Router();

router.use(requireSetupComplete);

router.get('/products', listV1Products);
router.get('/products/:slug', getV1Product);
router.get('/settings/public', getV1PublicSettings);
router.get('/theme', getV1Theme);
router.get('/contexts/home', getV1HomeContext);
router.get('/contexts/product/:slug', getV1ProductContext);
router.post('/checkout/sessions', checkoutRateLimiter, requireHeadlessSecret, createV1CheckoutSession);

export default router;
