import { Router } from 'express';
import { getLibrary, requestLibraryAccess } from '../controllers/library.controller';

const router = Router();

router.post('/request-access', requestLibraryAccess);
router.get('/', getLibrary);

export default router;
