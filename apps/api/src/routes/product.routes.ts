import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  streamFeaturedImage,
  streamGalleryImage,
  updateProduct,
  updateProductStatus,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { digitalStorageRoot, ensureStorageDirectories, imageStorageRoot, sanitizeFilename } from '../lib/storage';

ensureStorageDirectories();

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    if (file.fieldname === 'digitalFile') {
      callback(null, digitalStorageRoot);
      return;
    }

    callback(null, imageStorageRoot);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    callback(null, `${Date.now()}-${sanitizeFilename(baseName)}${extension.toLowerCase()}`);
  },
});

const upload = multer({ storage });
const router = Router();

router.get('/', getAllProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/featured-image', streamFeaturedImage);
router.get('/:id/gallery-image', streamGalleryImage);
router.get('/:id', getProductById);

router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 6 },
    { name: 'digitalFile', maxCount: 1 },
  ]),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 6 },
    { name: 'digitalFile', maxCount: 1 },
  ]),
  updateProduct
);

router.patch('/:id/status', authenticate, updateProductStatus);
router.delete('/:id', authenticate, deleteProduct);

export default router;
