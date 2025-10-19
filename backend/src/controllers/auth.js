import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { sendWelcomeEmail, sendOTPEmail } from '../utils/email.js';
import { authLogger, mongoLogger } from '../utils/logger.js';
import { generatePresignedUrl } from '../utils/r2-presigned.js';

/**
 * Generate 6-digit OTP code
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.json({ available: false, reason: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' });
    }

    mongoLogger.query('findOne', 'users', { username });
    const startTime = Date.now();
    const existingUser = await User.findOne({ username });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', existingUser ? 1 : 0, duration);

    if (existingUser) {
      return res.json({ available: false, reason: 'Username is already taken' });
    }

    res.json({ available: true });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, username, fullName } = req.body;

    authLogger.registerAttempt(email);

    // Validate required fields
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' });
    }

    // Check if user already exists
    mongoLogger.query('findOne', 'users', { email });
    const existingUser = await User.findOne({ email });
    mongoLogger.queryResult('findOne', existingUser ? 1 : 0);
    
    if (existingUser) {
      authLogger.registerError(email, 'User already exists');
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if username is taken
    mongoLogger.query('findOne', 'users', { username });
    const existingUsername = await User.findOne({ username });
    mongoLogger.queryResult('findOne', existingUsername ? 1 : 0);
    
    if (existingUsername) {
      authLogger.registerError(email, 'Username already taken');
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create unverified user (emailVerified: false)
    mongoLogger.query('create', 'users', { email, username, fullName });
    const startTime = Date.now();
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      fullName,
      emailVerified: false, // Will be set to true after OTP verification
    });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('create', 1, duration);

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, purpose: 'registration' });

    // Create OTP record
    mongoLogger.query('create', 'otps', { email, purpose: 'registration' });
    const otpStartTime = Date.now();
    await OTP.create({
      email,
      code: otpCode,
      purpose: 'registration',
      expiresAt,
    });
    const otpDuration = Date.now() - otpStartTime;
    mongoLogger.queryResult('create', 1, otpDuration);

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, user.fullName || user.username || 'there');
      authLogger.otpSent(email);
    } catch (emailError) {
      authLogger.otpError(email, emailError.message);
      // Don't fail registration if email fails, but log it
    }

    authLogger.registerSuccess(email, user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP code sent to your email.',
      data: {
        email,
        requiresVerification: true,
      },
    });
  } catch (error) {
    authLogger.registerError(req.body.email, error.message);
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    authLogger.otpVerificationFailed(email, 'Verification attempt');

    // Find OTP record
    mongoLogger.query('findOne', 'otps', { email, purpose: 'registration', verified: false });
    const startTime = Date.now();
    const otpRecord = await OTP.findOne({
      email,
      purpose: 'registration',
      verified: false,
    }).sort({ createdAt: -1 }); // Get most recent OTP
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', otpRecord ? 1 : 0, duration);

    if (!otpRecord) {
      authLogger.otpVerificationFailed(email, 'OTP not found');
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      authLogger.otpVerificationFailed(email, 'OTP expired');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      authLogger.otpVerificationFailed(email, 'Max attempts reached');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Maximum verification attempts reached. Please request a new OTP.' });
    }

    // Verify code
    if (otpRecord.code !== code) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      authLogger.otpVerificationFailed(email, `Invalid code (attempt ${otpRecord.attempts})`);
      return res.status(400).json({ 
        error: 'Invalid OTP code',
        attemptsRemaining: 5 - otpRecord.attempts,
      });
    }

    // OTP is valid - mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Find and update user
    mongoLogger.query('findOne', 'users', { email });
    const userStartTime = Date.now();
    const user = await User.findOne({ email });
    const userDuration = Date.now() - userStartTime;
    mongoLogger.queryResult('findOne', user ? 1 : 0, userDuration);

    if (!user) {
      authLogger.otpVerificationFailed(email, 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user email verification status
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.fullName || user.username || 'there');
    } catch (emailError) {
      // Don't fail verification if email fails
    }

    authLogger.otpVerified(email);
    authLogger.loginSuccess(email, user._id.toString());

    // Generate presigned URL for profile image if it exists
    let profileImageUrl = user.profileImage;
    if (profileImageUrl) {
      profileImageUrl = await generatePresignedUrl(profileImageUrl);
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          profileImage: profileImageUrl,
          emailVerified: true,
        },
        token,
      },
    });
  } catch (error) {
    authLogger.otpVerificationFailed(req.body.email, error.message);
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    mongoLogger.query('findOne', 'users', { email });
    const startTime = Date.now();
    const user = await User.findOne({ email });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', user ? 1 : 0, duration);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing unverified OTPs for this email
    await OTP.deleteMany({ email, purpose: 'registration', verified: false });

    // Create new OTP record
    mongoLogger.query('create', 'otps', { email, purpose: 'registration' });
    const otpStartTime = Date.now();
    await OTP.create({
      email,
      code: otpCode,
      purpose: 'registration',
      expiresAt,
    });
    const otpDuration = Date.now() - otpStartTime;
    mongoLogger.queryResult('create', 1, otpDuration);

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, user.fullName || user.username || 'there');
      authLogger.otpSent(email);
    } catch (emailError) {
      authLogger.otpError(email, emailError.message);
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again later.' });
    }

    res.json({
      success: true,
      message: 'OTP code has been resent to your email',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    authLogger.loginAttempt(email);

    // Find user
    mongoLogger.query('findOne', 'users', { email });
    const startTime = Date.now();
    const user = await User.findOne({ email });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', user ? 1 : 0, duration);
    
    if (!user) {
      authLogger.loginError(email, 'User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      authLogger.loginError(email, 'Email not verified');
      return res.status(403).json({ 
        error: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      authLogger.loginError(email, 'Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    authLogger.loginSuccess(email, user._id.toString());

    // Generate presigned URL for profile image if it exists
    let profileImageUrl = user.profileImage;
    if (profileImageUrl) {
      profileImageUrl = await generatePresignedUrl(profileImageUrl);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          profileImage: profileImageUrl,
        },
        token,
      },
    });
  } catch (error) {
    authLogger.loginError(req.body.email, error.message);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    mongoLogger.query('findById', 'users', { _id: req.userId });
    const startTime = Date.now();
    const user = await User.findById(req.userId).select('-password');
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

export const updateProfile = async (req, res, next) => {
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

    const updateData = {};
    // Username is immutable - cannot be changed
    if (username !== undefined) {
      return res.status(400).json({ error: 'Username cannot be changed once set' });
    }
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    mongoLogger.query('findOne', 'users', { email });
    const startTime = Date.now();
    const user = await User.findOne({ email });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', user ? 1 : 0, duration);

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing password-reset OTPs for this email
    await OTP.deleteMany({ email, purpose: 'password-reset' });

    // Create OTP record
    mongoLogger.query('create', 'otps', { email, purpose: 'password-reset' });
    const otpStartTime = Date.now();
    await OTP.create({
      email,
      code: otpCode,
      purpose: 'password-reset',
      expiresAt,
    });
    const otpDuration = Date.now() - otpStartTime;
    mongoLogger.queryResult('create', 1, otpDuration);

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, user.fullName || user.username || 'there');
      authLogger.otpSent(email);
    } catch (emailError) {
      authLogger.otpError(email, emailError.message);
      return res.status(500).json({ error: 'Failed to send password reset email. Please try again later.' });
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset code has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find OTP record
    mongoLogger.query('findOne', 'otps', { email, purpose: 'password-reset', verified: false });
    const startTime = Date.now();
    const otpRecord = await OTP.findOne({
      email,
      purpose: 'password-reset',
      verified: false,
    }).sort({ createdAt: -1 }); // Get most recent OTP
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', otpRecord ? 1 : 0, duration);

    if (!otpRecord) {
      authLogger.otpVerificationFailed(email, 'OTP not found');
      return res.status(400).json({ error: 'Invalid or expired password reset code' });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      authLogger.otpVerificationFailed(email, 'OTP expired');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Password reset code has expired. Please request a new one.' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      authLogger.otpVerificationFailed(email, 'Max attempts reached');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Maximum verification attempts reached. Please request a new code.' });
    }

    // Verify code
    if (otpRecord.code !== code) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      authLogger.otpVerificationFailed(email, `Invalid code (attempt ${otpRecord.attempts})`);
      return res.status(400).json({ 
        error: 'Invalid password reset code',
        attemptsRemaining: 5 - otpRecord.attempts,
      });
    }

    // OTP is valid - mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Find user
    mongoLogger.query('findOne', 'users', { email });
    const userStartTime = Date.now();
    const user = await User.findOne({ email });
    const userDuration = Date.now() - userStartTime;
    mongoLogger.queryResult('findOne', user ? 1 : 0, userDuration);

    if (!user) {
      authLogger.otpVerificationFailed(email, 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    authLogger.otpVerified(email);

    res.json({
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.',
    });
  } catch (error) {
    authLogger.otpVerificationFailed(req.body.email, error.message);
    next(error);
  }
};

