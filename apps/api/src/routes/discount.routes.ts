import { Router } from 'express';
import { createDiscountCode, deleteDiscountCode, listDiscountCodes, updateDiscountCode } from '../controllers/discount.controller';
import { authenticate, requireWriteAccess } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, listDiscountCodes);
router.post('/', authenticate, requireWriteAccess, createDiscountCode);
router.put('/:id', authenticate, requireWriteAccess, updateDiscountCode);
router.delete('/:id', authenticate, requireWriteAccess, deleteDiscountCode);

export default router;
