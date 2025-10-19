import mongoose from 'mongoose';

const { Schema } = mongoose;

const TaskSchema = new Schema({
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
  date: {
    type: Date,
    required: true,
    index: true,
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Format: HH:MM (24-hour format)
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format (24-hour)'
    },
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Format: HH:MM (24-hour format)
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format (24-hour)'
    },
  },
  completed: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#6366f1', // Default indigo color
    validate: {
      validator: function(v) {
        // Hex color format
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    },
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
TaskSchema.index({ userId: 1, date: 1, startTime: 1 });
TaskSchema.index({ userId: 1, date: 1 });
TaskSchema.index({ userId: 1, completed: 1 });

export const Task = mongoose.model('Task', TaskSchema);

