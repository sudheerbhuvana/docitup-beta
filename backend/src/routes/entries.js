import express from 'express';
import { 
  getAllEntries, 
  getEntry, 
  createEntry, 
  updateEntry, 
  deleteEntry,
  toggleLike,
  getComments,
  createComment,
  deleteComment,
} from '../controllers/entries.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllEntries);
router.get('/:id', getEntry);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

// Like/Unlike endpoints
router.post('/:id/like', toggleLike);

// Comment endpoints
router.get('/:id/comments', getComments);
router.post('/:id/comments', createComment);
router.delete('/:postId/comments/:commentId', deleteComment);

export default router;

