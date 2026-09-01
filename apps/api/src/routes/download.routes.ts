import { Router } from 'express';
import { downloadProduct, getDownloadInfo } from '../controllers/download.controller';

const router = Router();

router.get('/:token', getDownloadInfo);
router.get('/:token/file/:fileId', downloadProduct);
router.get('/:token/file', downloadProduct);

export default router;
