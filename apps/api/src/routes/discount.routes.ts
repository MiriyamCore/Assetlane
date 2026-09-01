import { Router } from 'express';
import { createDiscountCode, deleteDiscountCode, listDiscountCodes, updateDiscountCode } from '../controllers/discount.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, listDiscountCodes);
router.post('/', authenticate, createDiscountCode);
router.put('/:id', authenticate, updateDiscountCode);
router.delete('/:id', authenticate, deleteDiscountCode);

export default router;
