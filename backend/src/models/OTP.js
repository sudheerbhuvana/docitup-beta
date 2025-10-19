import mongoose from 'mongoose';

const { Schema } = mongoose;

const OTPSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
    length: 6,
  },
  purpose: {
    type: String,
    enum: ['registration', 'password-reset'],
    default: 'registration',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Auto-delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5, // Max 5 verification attempts
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
OTPSchema.index({ email: 1, purpose: 1, verified: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model('OTP', OTPSchema);

