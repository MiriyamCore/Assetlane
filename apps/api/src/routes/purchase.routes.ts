import { Router } from 'express';
import { getAllPurchases, getPurchaseById, refundPurchase, regenerateDownloadLink, resendDownloadEmail } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllPurchases);
router.get('/:id', authenticate, getPurchaseById);
router.post('/:id/refund', authenticate, refundPurchase);
router.post('/:id/regenerate-link', authenticate, regenerateDownloadLink);
router.post('/:id/resend-email', authenticate, resendDownloadEmail);

export default router;
