import express from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, toggleTaskCompletion } from '../controllers/tasks.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', toggleTaskCompletion);

export default router;

