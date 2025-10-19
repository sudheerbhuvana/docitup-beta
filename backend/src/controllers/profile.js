import { User } from '../models/User.js';
import { Entry } from '../models/Entry.js';
import { mongoLogger, logger } from '../utils/logger.js';
import { generatePresignedUrl } from '../utils/r2-presigned.js';
import { isValidR2Key } from '../utils/r2-validator.js';

// Get current user's profile
export const getMyProfile = async (req, res, next) => {
  try {
    mongoLogger.query('findById', 'users', { _id: req.userId });
    const startTime = Date.now();
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('friends', 'username fullName profileImage')
      .populate('followers', 'username fullName profileImage')
      .populate('following', 'username fullName profileImage');
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findById', user ? 1 : 0, duration);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate presigned URL for profile image if it exists
    const userObj = user.toObject();
    if (userObj.profileImage) {
      userObj.profileImage = await generatePresignedUrl(userObj.profileImage);
    }

    res.json({
      success: true,
      data: { user: userObj },
    });
  } catch (error) {
    next(error);
  }
};

// Update current user's profile
export const updateMyProfile = async (req, res, next) => {
  try {
    const {
      username,
      fullName,
      bio,
      profileImage,
      isPublicProfile,
      location,
      website,
      socialLinks,
    } = req.body;

    // Check if username is being changed and if it's already taken
    if (username) {
      mongoLogger.query('findOne', 'users', { username, _id: { $ne: req.userId } });
      const existingUser = await User.findOne({ username, _id: { $ne: req.userId } });
      mongoLogger.queryResult('findOne', existingUser ? 1 : 0);
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Validate profileImage - must be an R2 key, not a URL or base64
    if (profileImage !== undefined && profileImage !== null && profileImage !== '') {
      if (!isValidR2Key(profileImage)) {
        return res.status(400).json({ 
          error: 'Invalid profile image. Must be an R2 storage key.',
          details: 'Upload the image first using /api/media/upload to get an R2 key.'
        });
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage || null; // Store only R2 key or null
    if (isPublicProfile !== undefined) updateData.isPublicProfile = isPublicProfile;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    mongoLogger.query('findByIdAndUpdate', 'users', { _id: req.userId }, updateData);
    const startTime = Date.now();
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findByIdAndUpdate', user ? 1 : 0, duration);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.success(`Profile updated for user: ${user.email}`);

    // Generate presigned URL for profile image if it exists
    const userObj = user.toObject();
    if (userObj.profileImage) {
      userObj.profileImage = await generatePresignedUrl(userObj.profileImage);
    }

    res.json({
      success: true,
      data: { user: userObj },
    });
  } catch (error) {
    next(error);
  }
};

// Get public profile by username
export const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    mongoLogger.query('findOne', 'users', { username, isPublicProfile: true });
    const startTime = Date.now();
    const user = await User.findOne({ username, isPublicProfile: true })
      .select('username fullName profileImage bio location website socialLinks createdAt')
      .populate('followers', 'username fullName profileImage')
      .populate('following', 'username fullName profileImage');
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', user ? 1 : 0, duration);

    if (!user) {
      return res.status(404).json({ error: 'Profile not found or not public' });
    }

    // Get public entries count
    const publicEntriesCount = await Entry.countDocuments({
      userId: user._id,
      privacy: 'public',
      isDraft: false,
    });

    // Generate presigned URL for profile image if it exists
    const userObj = user.toObject();
    if (userObj.profileImage) {
      userObj.profileImage = await generatePresignedUrl(userObj.profileImage);
    }

    res.json({
      success: true,
      data: {
        user: {
          ...userObj,
          publicEntriesCount,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Follow a user
export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    mongoLogger.query('findById', 'users', { _id: userId });
    const targetUser = await User.findById(userId);
    mongoLogger.queryResult('findById', targetUser ? 1 : 0);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following list
    currentUser.following.push(userId);
    await currentUser.save();

    // Add to target user's followers list
    if (!targetUser.followers.includes(req.userId)) {
      targetUser.followers.push(req.userId);
      await targetUser.save();
    }

    logger.success(`User ${currentUser.email} followed ${targetUser.email}`);

    res.json({
      success: true,
      message: 'User followed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Unfollow a user
export const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    await currentUser.save();

    // Remove from target user's followers list
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== req.userId.toString()
    );
    await targetUser.save();

    logger.success(`User ${currentUser.email} unfollowed ${targetUser.email}`);

    res.json({
      success: true,
      message: 'User unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Send friend request
export const sendFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already friends
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }

    // For now, we'll auto-accept friend requests (mutual friendship)
    // In a more complex system, you'd have a friendRequests array
    if (!currentUser.friends.includes(userId)) {
      currentUser.friends.push(userId);
      await currentUser.save();
    }

    if (!targetUser.friends.includes(req.userId)) {
      targetUser.friends.push(req.userId);
      await targetUser.save();
    }

    logger.success(`User ${currentUser.email} became friends with ${targetUser.email}`);

    res.json({
      success: true,
      message: 'Friend request accepted',
    });
  } catch (error) {
    next(error);
  }
};

// Remove friend
export const removeFriend = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from both users' friends lists
    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== userId
    );
    await currentUser.save();

    targetUser.friends = targetUser.friends.filter(
      id => id.toString() !== req.userId.toString()
    );
    await targetUser.save();

    logger.success(`User ${currentUser.email} removed ${targetUser.email} as friend`);

    res.json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get user's friends
export const getFriends = async (req, res, next) => {
  try {
    mongoLogger.query('findById', 'users', { _id: req.userId });
    const startTime = Date.now();
    const user = await User.findById(req.userId)
      .populate('friends', 'username fullName profileImage bio')
      .select('friends');
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findById', user ? 1 : 0, duration);

    // Generate presigned URLs for friends' profile images
    const friendsWithPresignedUrls = await Promise.all(
      (user.friends || []).map(async (friend) => {
        const friendObj = friend.toObject();
        if (friendObj.profileImage) {
          friendObj.profileImage = await generatePresignedUrl(friendObj.profileImage);
        }
        return friendObj;
      })
    );

    res.json({
      success: true,
      data: {
        friends: friendsWithPresignedUrls,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's followers
export const getFollowers = async (req, res, next) => {
  try {
    mongoLogger.query('findById', 'users', { _id: req.userId });
    const startTime = Date.now();
    const user = await User.findById(req.userId)
      .populate('followers', 'username fullName profileImage bio')
      .select('followers');
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findById', user ? 1 : 0, duration);

    // Generate presigned URLs for followers' profile images
    const followersWithPresignedUrls = await Promise.all(
      (user.followers || []).map(async (follower) => {
        const followerObj = follower.toObject();
        if (followerObj.profileImage) {
          followerObj.profileImage = await generatePresignedUrl(followerObj.profileImage);
        }
        return followerObj;
      })
    );

    res.json({
      success: true,
      data: {
        followers: followersWithPresignedUrls,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's following
export const getFollowing = async (req, res, next) => {
  try {
    mongoLogger.query('findById', 'users', { _id: req.userId });
    const startTime = Date.now();
    const user = await User.findById(req.userId)
      .populate('following', 'username fullName profileImage bio')
      .select('following');
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findById', user ? 1 : 0, duration);

    // Generate presigned URLs for following users' profile images
    const followingWithPresignedUrls = await Promise.all(
      (user.following || []).map(async (followed) => {
        const followedObj = followed.toObject();
        if (followedObj.profileImage) {
          followedObj.profileImage = await generatePresignedUrl(followedObj.profileImage);
        }
        return followedObj;
      })
    );

    res.json({
      success: true,
      data: {
        following: followingWithPresignedUrls,
      },
    });
  } catch (error) {
    next(error);
  }
};

