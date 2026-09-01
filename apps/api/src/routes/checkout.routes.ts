import { Router } from 'express';
import { createCheckoutSession, getCheckoutMethods, getCheckoutReceipt, handleBkashCallback, validateCheckoutDiscount } from '../controllers/checkout.controller';

const router = Router();

router.get('/methods', getCheckoutMethods);
router.get('/receipt', getCheckoutReceipt);
router.post('/validate-discount', validateCheckoutDiscount);
router.post('/sessions', createCheckoutSession);
router.get('/bkash/callback', handleBkashCallback);

export default router;
