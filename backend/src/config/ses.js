import { SESClient } from '@aws-sdk/client-ses';
import { sesLogger, logger } from '../utils/logger.js';

// Amazon SES Configuration
const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_SES_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY;

// Validate AWS SES credentials
export const validateSESCredentials = () => {
  const missing = [];
  if (!accessKeyId || (typeof accessKeyId === 'string' && !accessKeyId.trim())) {
    missing.push('AWS_SES_ACCESS_KEY_ID');
  }
  if (!secretAccessKey || (typeof secretAccessKey === 'string' && !secretAccessKey.trim())) {
    missing.push('AWS_SES_SECRET_ACCESS_KEY');
  }
  
  if (missing.length > 0) {
    logger.warn('AWS SES credentials missing', {
      missing: missing.join(', '),
      message: 'Email sending will fail. Please set the required environment variables.'
    });
    return false;
  }
  return true;
};

// Function to get or create SES client dynamically
let _sesClient = null;

const createSESClient = () => {
  const currentAccessKey = process.env.AWS_SES_ACCESS_KEY_ID?.trim();
  const currentSecretKey = process.env.AWS_SES_SECRET_ACCESS_KEY?.trim();
  const currentRegion = process.env.AWS_REGION || 'us-east-1';
  
  if (currentAccessKey && currentSecretKey) {
    return new SESClient({
      region: currentRegion,
      credentials: {
        accessKeyId: currentAccessKey,
        secretAccessKey: currentSecretKey,
      }
    });
  }
  return null;
};

// Get SES client - creates it dynamically if credentials are available
export const getSESClient = () => {
  // Always check current env vars in case they were added after module load
  const currentAccessKey = process.env.AWS_SES_ACCESS_KEY_ID?.trim();
  const currentSecretKey = process.env.AWS_SES_SECRET_ACCESS_KEY?.trim();
  
  // If credentials are available, create or return client
  if (currentAccessKey && currentSecretKey) {
    // If client doesn't exist yet, create it
    if (!_sesClient) {
      _sesClient = createSESClient();
    }
    return _sesClient;
  }
  
  // No credentials available
  return null;
};

// For backward compatibility, export sesClient as a getter
export const sesClient = getSESClient();

export const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@docitup.in';

// Log SES configuration on module load
const hasCredentials = validateSESCredentials();
sesLogger.config(region, FROM_EMAIL);

if (!hasCredentials) {
  logger.warn('SES client initialized without credentials - email sending will fail');
}

