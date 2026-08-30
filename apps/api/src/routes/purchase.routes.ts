import { Router } from 'express';
import { getAllPurchases, getPurchaseById, regenerateDownloadLink } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllPurchases);
router.get('/:id', authenticate, getPurchaseById);
router.post('/:id/regenerate-link', authenticate, regenerateDownloadLink);

export default router;
