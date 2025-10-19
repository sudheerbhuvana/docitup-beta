import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    immutable: true, // Once set, cannot be changed
    validate: {
      validator: function(v) {
        // 3-20 characters, alphanumeric and underscore only
        return /^[a-zA-Z0-9_]{3,20}$/.test(v);
      },
      message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
    },
    index: true,
  },
  fullName: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  isPublicProfile: {
    type: Boolean,
    default: false,
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  location: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  socialLinks: {
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerifiedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Note: email and username indexes are automatically created by unique: true

export const User = mongoose.model('User', UserSchema);

