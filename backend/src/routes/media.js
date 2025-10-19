import express from 'express';
import { uploadMiddleware, uploadFiles, deleteFile, getUploadUrl, getPresignedUrl } from '../controllers/media.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/upload', uploadMiddleware, uploadFiles);
router.delete('/delete', deleteFile);
router.post('/presigned-url', getUploadUrl);
router.get('/presigned-url/:key', getPresignedUrl);

export default router;

