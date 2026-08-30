import { Router } from 'express';
import { createCheckoutSession, getCheckoutMethods, handleBkashCallback } from '../controllers/checkout.controller';

const router = Router();

router.get('/methods', getCheckoutMethods);
router.post('/sessions', createCheckoutSession);
router.get('/bkash/callback', handleBkashCallback);

export default router;
