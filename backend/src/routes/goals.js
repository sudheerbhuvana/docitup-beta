import express from 'express';
import { getAllGoals, getGoal, createGoal, updateGoal, deleteGoal, updateGoalStep } from '../controllers/goals.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllGoals);
router.get('/:id', getGoal);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/steps/:stepId', updateGoalStep);

export default router;

