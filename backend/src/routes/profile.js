import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  followUser,
  unfollowUser,
  sendFriendRequest,
  removeFriend,
  getFriends,
  getFollowers,
  getFollowing,
} from '../controllers/profile.js';

const router = express.Router();

// Current user's profile
router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfile);

// Public profile by username
router.get('/user/:username', getPublicProfile);

// Friends and followers
router.get('/me/friends', authenticate, getFriends);
router.get('/me/followers', authenticate, getFollowers);
router.get('/me/following', authenticate, getFollowing);

// Follow/unfollow
router.post('/follow/:userId', authenticate, followUser);
router.delete('/follow/:userId', authenticate, unfollowUser);

// Friend requests
router.post('/friend/:userId', authenticate, sendFriendRequest);
router.delete('/friend/:userId', authenticate, removeFriend);

export default router;

