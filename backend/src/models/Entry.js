import mongoose from 'mongoose';

const { Schema } = mongoose;

const EntrySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'terrible'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  media: [{
    type: String,
  }],
  isDraft: {
    type: Boolean,
    default: false,
  },
  privacy: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private',
  },
  // Instagram-style post features
  visibility: {
    type: String,
    enum: ['private', 'followers', 'public'],
    default: 'private',
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
EntrySchema.index({ userId: 1, createdAt: -1 });
EntrySchema.index({ userId: 1, tags: 1 });
EntrySchema.index({ userId: 1, mood: 1 });
EntrySchema.index({ visibility: 1, createdAt: -1 });
EntrySchema.index({ tags: 1 });

export const Entry = mongoose.model('Entry', EntrySchema);

