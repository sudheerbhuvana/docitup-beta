import { User } from '../models/User.js';
import { Goal } from '../models/Goal.js';
import { Entry } from '../models/Entry.js';
import { mongoLogger } from '../utils/logger.js';
import { generatePresignedUrl, generatePresignedUrls } from '../utils/r2-presigned.js';

export const getPublicProfiles = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    mongoLogger.query('find', 'users', { isPublicProfile: true }, { limit, offset });
    const startTime = Date.now();
    const users = await User.find({ isPublicProfile: true })
      .select('username fullName profileImage bio')
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const duration = Date.now() - startTime;

    const total = await User.countDocuments({ isPublicProfile: true });
    mongoLogger.queryResult('find', users.length, duration);

    // Generate presigned URLs for profile images
    const profilesWithPresignedUrls = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        if (userObj.profileImage) {
          userObj.profileImage = await generatePresignedUrl(userObj.profileImage);
        }
        return userObj;
      })
    );

    res.json({
      success: true,
      data: {
        profiles: profilesWithPresignedUrls,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicGoals = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    mongoLogger.query('find', 'goals', { isPublic: true, status: 'active' }, { limit, offset, populate: 'userId' });
    const startTime = Date.now();
    const goals = await Goal.find({ isPublic: true, status: 'active' })
      .populate('userId', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const duration = Date.now() - startTime;

    const total = await Goal.countDocuments({ isPublic: true, status: 'active' });
    mongoLogger.queryResult('find', goals.length, duration);

    // Generate presigned URLs for user profile images in populated goals
    const goalsWithPresignedUrls = await Promise.all(
      goals.map(async (goal) => {
        const goalObj = goal.toObject();
        if (goalObj.userId?.profileImage) {
          goalObj.userId.profileImage = await generatePresignedUrl(goalObj.userId.profileImage);
        }
        return goalObj;
      })
    );

    res.json({
      success: true,
      data: {
        goals: goalsWithPresignedUrls,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPublicProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      _id: userId,
      isPublicProfile: true,
    }).select('username fullName profileImage bio');

    if (!user) {
      return res.status(404).json({ error: 'Profile not found or not public' });
    }

    const publicGoals = await Goal.find({
      userId,
      isPublic: true,
      status: 'active',
    }).select('title description progressPercentage category targetDate');

    // Generate presigned URL for profile image if it exists
    const userObj = user.toObject();
    if (userObj.profileImage) {
      userObj.profileImage = await generatePresignedUrl(userObj.profileImage);
    }

    res.json({
      success: true,
      data: {
        profile: userObj,
        publicGoals,
        publicGoalsCount: publicGoals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Get feed - posts from followed users
export const getFeed = async (req, res, next) => {
  try {
    const { userId, tag, mood, limit = 20, offset = 0 } = req.query;
    
    // Get current user's following list
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingIds = currentUser.following || [];
    
    // Build query - posts from followed users with visibility 'followers' or 'public'
    const query = {
      visibility: { $in: ['followers', 'public'] },
      isDraft: false,
    };

    // Filter by specific user (must be in following list)
    if (userId) {
      const userIdStr = userId.toString();
      const followingIdsStr = followingIds.map(id => id.toString());
      if (!followingIdsStr.includes(userIdStr)) {
        return res.status(403).json({ error: 'Cannot view feed for users you are not following' });
      }
      query.userId = userId;
    } else {
      // Only show posts from followed users
      if (followingIds.length === 0) {
        return res.json({
          success: true,
          data: {
            entries: [],
            total: 0,
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
        });
      }
      query.userId = { $in: followingIds };
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Filter by mood
    if (mood) {
      query.mood = mood;
    }

    mongoLogger.query('find', 'entries', query, { limit, offset, sort: { createdAt: -1 } });
    const startTime = Date.now();
    const entries = await Entry.find(query)
      .populate('userId', 'username fullName profileImage')
      .populate('likes', 'username')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const duration = Date.now() - startTime;

    const total = await Entry.countDocuments(query);
    mongoLogger.queryResult('find', entries.length, duration);

    // Generate presigned URLs for media and profile images
    const entriesWithUrls = await Promise.all(
      entries.map(async (entry) => {
        const entryObj = entry.toObject();
        
        // Generate presigned URLs for media
        if (entryObj.media && entryObj.media.length > 0) {
          const r2Keys = entryObj.media.filter(key => {
            if (key.startsWith('data:') || key.startsWith('http://') || key.startsWith('https://')) {
              return false;
            }
            return true;
          });
          
          if (r2Keys.length > 0) {
            entryObj.mediaUrls = await generatePresignedUrls(r2Keys);
          } else {
            entryObj.mediaUrls = [];
          }
          entryObj.media = r2Keys;
        }

        // Generate presigned URL for user profile image
        if (entryObj.userId?.profileImage) {
          entryObj.userId.profileImage = await generatePresignedUrl(entryObj.userId.profileImage);
        }

        // Check if current user liked this post
        entryObj.isLiked = entryObj.likes.some(like => like._id.toString() === req.userId.toString());

        return entryObj;
      })
    );

    res.json({
      success: true,
      data: {
        entries: entriesWithUrls,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};