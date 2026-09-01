import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { downloadTheme, getAdminThemes, installTheme, uninstallTheme } from '../controllers/theme.controller';
import { authenticate, requireWriteAccess } from '../middleware/auth.middleware';
import { ensureStorageDirectories, sanitizeFilename, themeUploadRoot } from '../lib/storage';

ensureStorageDirectories();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, themeUploadRoot);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname) || '.zip';
    const baseName = path.basename(file.originalname, extension);
    callback(null, `${Date.now()}-${sanitizeFilename(baseName)}${extension.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (path.extname(file.originalname).toLowerCase() !== '.zip') {
      callback(new Error('Only zip theme packages are supported.'));
      return;
    }

    callback(null, true);
  },
});

const router = Router();

router.get('/admin', authenticate, getAdminThemes);
router.post('/install', authenticate, requireWriteAccess, upload.single('themePackage'), installTheme);
router.delete('/:id', authenticate, requireWriteAccess, uninstallTheme);
router.get('/:id/download', authenticate, downloadTheme);

export default router;
