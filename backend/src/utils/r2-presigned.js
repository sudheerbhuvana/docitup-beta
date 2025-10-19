import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, getR2BucketName } from '../config/r2.js';

// Get JWT expiry time in seconds (default 7 days)
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

/**
 * Generate presigned URLs for media keys
 * @param {string[]} mediaKeys - Array of R2 keys
 * @returns {Promise<string[]>} Array of presigned URLs
 */
export const generatePresignedUrls = async (mediaKeys) => {
  if (!mediaKeys || mediaKeys.length === 0) {
    return [];
  }

  const expiresIn = getJWTExpiry();
  
  const urlPromises = mediaKeys.map(async (key) => {
    try {
      // Skip if already a URL (for backward compatibility)
      if (key.startsWith('http://') || key.startsWith('https://')) {
        return key;
      }

      const command = new GetObjectCommand({
        Bucket: getR2BucketName(),
        Key: key,
      });

      const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      console.error(`Failed to generate presigned URL for key: ${key}`, error);
      return key; // Return original key if generation fails
    }
  });

  return Promise.all(urlPromises);
};

/**
 * Generate a single presigned URL for a media key
 * @param {string} key - R2 key
 * @returns {Promise<string>} Presigned URL
 */
export const generatePresignedUrl = async (key) => {
  if (!key) {
    return null;
  }

  // Skip if already a URL (for backward compatibility)
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  try {
    const expiresIn = getJWTExpiry();
      const command = new GetObjectCommand({
        Bucket: getR2BucketName(),
        Key: key,
      });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error(`Failed to generate presigned URL for key: ${key}`, error);
    return key; // Return original key if generation fails
  }
};

