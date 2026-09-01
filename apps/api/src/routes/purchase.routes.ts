import { Router } from 'express';
import { getAllPurchases, getPurchaseById, refundPurchase, regenerateDownloadLink, resendDownloadEmail } from '../controllers/purchase.controller';
import { authenticate, requireWriteAccess } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllPurchases);
router.get('/:id', authenticate, getPurchaseById);
router.post('/:id/refund', authenticate, requireWriteAccess, refundPurchase);
router.post('/:id/regenerate-link', authenticate, requireWriteAccess, regenerateDownloadLink);
router.post('/:id/resend-email', authenticate, requireWriteAccess, resendDownloadEmail);

export default router;
