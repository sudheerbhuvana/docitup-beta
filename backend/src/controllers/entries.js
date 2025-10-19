import { Entry } from '../models/Entry.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js';
import { mongoLogger } from '../utils/logger.js';
import { generatePresignedUrls, generatePresignedUrl } from '../utils/r2-presigned.js';
import { validateR2Keys, sanitizeMediaArray } from '../utils/r2-validator.js';

export const getAllEntries = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, mood, tags, privacy, userId } = req.query;
    
    // If userId is provided, check if user can view their entries
    let query = {};
    
    if (userId) {
      // If viewing own entries, show all
      if (userId === req.userId.toString()) {
        query.userId = req.userId;
      } else {
        // Check if viewing user's entries
        const viewingUser = await User.findById(req.userId);
        const targetUser = await User.findById(userId);
        
        if (!targetUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Build privacy query
        const privacyConditions = [];
        
        // Always include public entries
        privacyConditions.push({ privacy: 'public' });
        
        // Include friends-only if they are friends
        if (targetUser.friends.includes(req.userId)) {
          privacyConditions.push({ privacy: 'friends' });
        }
        
        // Include private if viewing own entries
        if (userId === req.userId.toString()) {
          privacyConditions.push({ privacy: 'private' });
        }
        
        query = {
          userId,
          $or: privacyConditions,
          isDraft: false,
        };
      }
    } else {
      // Default: show current user's entries
      query = { userId: req.userId };
    }
    
    if (mood) query.mood = mood;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (privacy) query.privacy = privacy;

    mongoLogger.query('find', 'entries', query, { limit, offset, sort: { createdAt: -1 } });
    const startTime = Date.now();
    const entries = await Entry.find(query)
      .populate('userId', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const duration = Date.now() - startTime;

    const total = await Entry.countDocuments(query);
    mongoLogger.queryResult('find', entries.length, duration);

    // Generate presigned URLs for all media and profile images in entries
    // Only R2 keys are supported - base64 data is rejected
    const entriesWithPresignedUrls = await Promise.all(
      entries.map(async (entry) => {
        const entryObj = entry.toObject(); 
        if (entryObj.media && entryObj.media.length > 0) {
          // Filter out base64 data (legacy entries - should be migrated to R2)
          const r2Keys = entryObj.media.filter(key => {
            if (key.startsWith('data:') || key.startsWith('http://') || key.startsWith('https://')) {
              console.warn('Entry contains invalid media (base64/URL). Should be migrated to R2:', entryObj._id);
              return false;
            }
            return true;
          });
          
          // Generate presigned URLs for R2 keys only
          if (r2Keys.length > 0) {
            entryObj.mediaUrls = await generatePresignedUrls(r2Keys);
          } else {
            entryObj.mediaUrls = [];
          }
          
          // Update media array to only contain R2 keys (clean up legacy data)
          entryObj.media = r2Keys;
        }
        // Generate presigned URL for user profile image
        if (entryObj.userId?.profileImage) {
          entryObj.userId.profileImage = await generatePresignedUrl(entryObj.userId.profileImage);
        }
        return entryObj;
      })
    );

    res.json({
      success: true,
      data: {
        entries: entriesWithPresignedUrls,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEntry = async (req, res, next) => {
  try {
    mongoLogger.query('findOne', 'entries', { _id: req.params.id, userId: req.userId });
    const startTime = Date.now();
    const entry = await Entry.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', entry ? 1 : 0, duration);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Generate presigned URLs for media (for display)
    // Only R2 keys are supported - base64 data is rejected
    const entryObj = entry.toObject();
    if (entryObj.media && entryObj.media.length > 0) {
      // Filter out base64 data (legacy entries - should be migrated to R2)
      const r2Keys = entryObj.media.filter(key => {
        if (key.startsWith('data:') || key.startsWith('http://') || key.startsWith('https://')) {
          console.warn('Entry contains invalid media (base64/URL). Should be migrated to R2:', entryObj._id);
          return false;
        }
        return true;
      });
      
      // Generate presigned URLs for R2 keys only
      if (r2Keys.length > 0) {
        entryObj.mediaUrls = await generatePresignedUrls(r2Keys);
      } else {
        entryObj.mediaUrls = [];
      }
      
      // Update media array to only contain R2 keys (clean up legacy data)
      entryObj.media = r2Keys;
    }

    res.json({
      success: true,
      data: { entry: entryObj },
    });
  } catch (error) {
    next(error);
  }
};

export const createEntry = async (req, res, next) => {
  try {
    const { title, content, description, mood, tags, media, isDraft, privacy, visibility } = req.body;

    // Validate and sanitize media - ensure only R2 keys are stored
    let sanitizedMedia = [];
    if (media && Array.isArray(media)) {
      const validation = validateR2Keys(media);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: validation.error,
          details: 'Media must be an array of R2 storage keys. Upload files first using /api/media/upload to get R2 keys.'
        });
      }
      sanitizedMedia = sanitizeMediaArray(media);
    }

    mongoLogger.query('create', 'entries', { userId: req.userId, title, mood, tags: tags?.length || 0, media: sanitizedMedia.length, privacy, visibility });
    const startTime = Date.now();
    const entry = await Entry.create({
      userId: req.userId,
      title,
      content,
      description,
      mood,
      tags,
      media: sanitizedMedia, // Store only R2 keys
      isDraft: isDraft || false,
      privacy: privacy || 'private',
      visibility: visibility || 'private',
    });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('create', 1, duration);

    // Generate presigned URLs for media (for display)
    // Keep R2 keys in media array, add presigned URLs in mediaUrls field
    const entryObj = entry.toObject();
    if (entryObj.media && entryObj.media.length > 0) {
      // Generate presigned URLs for display (separate from R2 keys)
      entryObj.mediaUrls = await generatePresignedUrls(entryObj.media);
    }

    res.status(201).json({
      success: true,
      data: { entry: entryObj },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const { title, content, description, mood, tags, media, isDraft, privacy, visibility } = req.body;

    // Validate and sanitize media - ensure only R2 keys are stored
    if (media !== undefined) {
      if (media && Array.isArray(media)) {
        const validation = validateR2Keys(media);
        if (!validation.valid) {
          return res.status(400).json({ 
            error: validation.error,
            details: 'Media must be an array of R2 storage keys. Upload files first using /api/media/upload to get R2 keys.'
          });
        }
      } else if (media !== null) {
        return res.status(400).json({ 
          error: 'Media must be an array of R2 keys or null',
          details: 'Upload files first using /api/media/upload to get R2 keys.'
        });
      }
    }

    mongoLogger.query('findOneAndUpdate', 'entries', { _id: req.params.id, userId: req.userId });
    const startTime = Date.now();
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (description !== undefined) updateData.description = description;
    if (mood !== undefined) updateData.mood = mood;
    if (tags !== undefined) updateData.tags = tags;
    if (media !== undefined) updateData.media = sanitizeMediaArray(media || []); // Store only R2 keys
    if (isDraft !== undefined) updateData.isDraft = isDraft;
    if (privacy !== undefined) updateData.privacy = privacy;
    if (visibility !== undefined) updateData.visibility = visibility;
    
    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOneAndUpdate', entry ? 1 : 0, duration);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Generate presigned URLs for media (for display)
    // Only R2 keys are supported - base64 data is rejected
    const entryObj = entry.toObject();
    if (entryObj.media && entryObj.media.length > 0) {
      // Filter out base64 data (legacy entries - should be migrated to R2)
      const r2Keys = entryObj.media.filter(key => {
        if (key.startsWith('data:') || key.startsWith('http://') || key.startsWith('https://')) {
          console.warn('Entry contains invalid media (base64/URL). Should be migrated to R2:', entryObj._id);
          return false;
        }
        return true;
      });
      
      // Generate presigned URLs for R2 keys only
      if (r2Keys.length > 0) {
        entryObj.mediaUrls = await generatePresignedUrls(r2Keys);
      } else {
        entryObj.mediaUrls = [];
      }
      
      // Update media array to only contain R2 keys (clean up legacy data)
      entryObj.media = r2Keys;
    }

    res.json({
      success: true,
      data: { entry: entryObj },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    mongoLogger.query('findOneAndDelete', 'entries', { _id: req.params.id, userId: req.userId });
    const startTime = Date.now();
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOneAndDelete', entry ? 1 : 0, duration);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Delete all comments for this entry
    await Comment.deleteMany({ postId: req.params.id });

    res.json({
      success: true,
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Like/Unlike a post
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await Entry.findById(id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check visibility - can only like if post is followers or public
    if (entry.visibility === 'private' && entry.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Cannot like private posts' });
    }

    const userId = req.userId;
    const isLiked = entry.likes.includes(userId);

    if (isLiked) {
      // Unlike
      entry.likes = entry.likes.filter(id => id.toString() !== userId.toString());
      entry.likesCount = Math.max(0, entry.likesCount - 1);
    } else {
      // Like
      entry.likes.push(userId);
      entry.likesCount = entry.likes.length;
    }

    await entry.save();

    res.json({
      success: true,
      data: {
        liked: !isLiked,
        likesCount: entry.likesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get comments for a post
export const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await Entry.findById(id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check visibility - can only view comments if post is followers or public
    if (entry.visibility === 'private' && entry.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Cannot view comments on private posts' });
    }

    const comments = await Comment.find({ postId: id })
      .populate('userId', 'username fullName profileImage')
      .sort({ createdAt: -1 });

    // Generate presigned URLs for profile images
    const commentsWithUrls = await Promise.all(
      comments.map(async (comment) => {
        const commentObj = comment.toObject();
        if (commentObj.userId?.profileImage) {
          commentObj.userId.profileImage = await generatePresignedUrl(commentObj.userId.profileImage);
        }
        return commentObj;
      })
    );

    res.json({
      success: true,
      data: { comments: commentsWithUrls },
    });
  } catch (error) {
    next(error);
  }
};

// Create a comment
export const createComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
    }

    const entry = await Entry.findById(id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check visibility - can only comment if post is followers or public
    if (entry.visibility === 'private' && entry.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Cannot comment on private posts' });
    }

    const comment = await Comment.create({
      postId: id,
      userId: req.userId,
      content: content.trim(),
    });

    // Update comment count
    entry.commentsCount = (entry.commentsCount || 0) + 1;
    await entry.save();

    // Populate user data
    await comment.populate('userId', 'username fullName profileImage');
    const commentObj = comment.toObject();

    // Generate presigned URL for profile image
    if (commentObj.userId?.profileImage) {
      commentObj.userId.profileImage = await generatePresignedUrl(commentObj.userId.profileImage);
    }

    res.status(201).json({
      success: true,
      data: { comment: commentObj },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only comment owner or post owner can delete
    if (comment.userId.toString() !== req.userId.toString()) {
      const entry = await Entry.findById(postId);
      if (!entry || entry.userId.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }
    }

    await Comment.findByIdAndDelete(commentId);

    // Update comment count
    const entry = await Entry.findById(postId);
    if (entry) {
      entry.commentsCount = Math.max(0, (entry.commentsCount || 0) - 1);
      await entry.save();
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

