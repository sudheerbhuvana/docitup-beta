import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, getR2BucketName } from '../config/r2.js';
import { r2Logger } from '../utils/logger.js';
import crypto from 'crypto';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

export const uploadMiddleware = upload.array('files', 10); // Max 10 files

export const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const startTime = Date.now();
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${req.userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;
      
      r2Logger.uploadStart(file.originalname, file.size, file.mimetype, req.userId);
      
      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: getR2BucketName(),
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      try {
        await r2Client.send(command);
        const duration = Date.now() - startTime;
        // Return only the R2 key, not a URL (bucket is private)
        r2Logger.uploadSuccess(fileName, `R2 Key: ${fileName}`, duration);
        return fileName; // Return only the key
      } catch (error) {
        r2Logger.uploadError(fileName, error);
        throw error;
      }
    });

    const fileKeys = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        files: fileKeys, // Return R2 keys only
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { fileKey } = req.body;

    if (!fileKey) {
      return res.status(400).json({ error: 'File key is required' });
    }

    // Extract key from URL if full URL is provided
    let key = fileKey;
    if (fileKey.startsWith('http')) {
      key = fileKey.split('/').slice(-2).join('/'); // Get last two parts (userId/filename)
    }

    // Verify the file belongs to the user
    if (!key.startsWith(`${req.userId}/`)) {
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }

    const startTime = Date.now();
    r2Logger.deleteStart(key, req.userId);

    const command = new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    });

    try {
      await r2Client.send(command);
      const duration = Date.now() - startTime;
      r2Logger.deleteSuccess(key, duration);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      r2Logger.deleteError(key, error);
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get JWT expiry time in seconds (default 7 days)
// This matches the JWT expiry time so presigned URLs expire with the token
const getJWTExpiry = () => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  if (expiresIn.endsWith('d')) {
    return parseInt(expiresIn) * 24 * 60 * 60; // Convert days to seconds
  } else if (expiresIn.endsWith('h')) {
    return parseInt(expiresIn) * 60 * 60; // Convert hours to seconds
  } else if (expiresIn.endsWith('m')) {
    return parseInt(expiresIn) * 60; // Convert minutes to seconds
  }
  return 7 * 24 * 60 * 60; // Default 7 days (604800 seconds)
};

// Generate presigned URL for viewing/downloading a file
export const getPresignedUrl = async (req, res, next) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'File key is required' });
    }

    // Verify the file belongs to the user (unless it's a public entry)
    if (!key.startsWith(`${req.userId}/`)) {
      return res.status(403).json({ error: 'Unauthorized to access this file' });
    }

    const command = new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    });

    // Generate presigned URL with JWT expiry time
    const expiresIn = getJWTExpiry();
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn });

    r2Logger.presignedUrl(key, expiresIn);

    res.json({
      success: true,
      data: {
        url: presignedUrl,
        key,
        expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadUrl = async (req, res, next) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and content type are required' });
    }

    const fileExtension = filename.split('.').pop();
    const key = `${req.userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL for upload (expires in 1 hour)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    r2Logger.presignedUrl(key, 3600);

    res.json({
      success: true,
      data: {
        uploadUrl,
        key, // Return only the key
      },
    });
  } catch (error) {
    next(error);
  }
};

