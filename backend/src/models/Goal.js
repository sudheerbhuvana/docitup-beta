import mongoose from 'mongoose';

const { Schema } = mongoose;

const GoalStepSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

const GoalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  targetDate: {
    type: Date,
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active',
    index: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  steps: [GoalStepSchema],
}, {
  timestamps: true,
});

// Indexes for efficient queries
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ isPublic: 1, status: 1 });

export const Goal = mongoose.model('Goal', GoalSchema);

