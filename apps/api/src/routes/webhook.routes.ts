import { Router } from 'express';
import {
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  listWebhookEndpoints,
  rotateWebhookSecret,
  updateWebhookEndpoint,
} from '../controllers/webhook.controller';
import { authenticate, requireWriteAccess } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, listWebhookEndpoints);
router.post('/', authenticate, requireWriteAccess, createWebhookEndpoint);
router.put('/:id', authenticate, requireWriteAccess, updateWebhookEndpoint);
router.delete('/:id', authenticate, requireWriteAccess, deleteWebhookEndpoint);
router.post('/:id/rotate-secret', authenticate, requireWriteAccess, rotateWebhookSecret);

export default router;
