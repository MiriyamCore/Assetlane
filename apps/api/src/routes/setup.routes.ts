import { Router } from 'express';
import { getSetup, postSetup } from '../controllers/setup.controller';
import { setupRateLimiter } from '../middleware/security';
import { requireSetupIncomplete } from '../middleware/setup.middleware';

const router = Router();

router.get('/status', getSetup);
router.post('/', setupRateLimiter, requireSetupIncomplete, postSetup);

export default router;
