import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAdminSettings, getAvailableThemes, getPublicSettings, updateBrandingAssets, updateSettings } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireSetupComplete } from '../middleware/setup.middleware';
import { brandingStorageRoot, ensureStorageDirectories, sanitizeFilename } from '../lib/storage';

const router = Router();
ensureStorageDirectories();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, brandingStorageRoot);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension);
    callback(null, `${Date.now()}-${sanitizeFilename(baseName)}${extension}`);
  },
});

const upload = multer({ storage });

router.get('/', getPublicSettings);
router.get('/themes', getAvailableThemes);
router.get('/admin', authenticate, requireSetupComplete, getAdminSettings);
router.put('/', authenticate, requireSetupComplete, updateSettings);
router.put('/branding', authenticate, requireSetupComplete, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), updateBrandingAssets);

export default router;
