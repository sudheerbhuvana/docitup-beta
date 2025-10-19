import express from 'express';
import { getPublicProfiles, getPublicGoals, getUserPublicProfile, getFeed } from '../controllers/community.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/profiles', getPublicProfiles);
router.get('/goals', getPublicGoals);
router.get('/profiles/:userId', getUserPublicProfile);
router.get('/feed', getFeed);

export default router;