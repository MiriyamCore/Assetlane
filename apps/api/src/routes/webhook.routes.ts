import { Router } from 'express';
import {
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  listWebhookEndpoints,
  rotateWebhookSecret,
  updateWebhookEndpoint,
} from '../controllers/webhook.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, listWebhookEndpoints);
router.post('/', authenticate, createWebhookEndpoint);
router.put('/:id', authenticate, updateWebhookEndpoint);
router.delete('/:id', authenticate, deleteWebhookEndpoint);
router.post('/:id/rotate-secret', authenticate, rotateWebhookSecret);

export default router;
