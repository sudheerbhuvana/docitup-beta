import { S3Client } from '@aws-sdk/client-s3';
import { r2Logger } from '../utils/logger.js';

// Validate R2 credentials
const validateR2Credentials = () => {
  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
  const missing = required.filter(key => !process.env[key] || !process.env[key].trim());
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required R2 environment variables: ${missing.join(', ')}\n` +
      'Please set these in your .env file:\n' +
      '- R2_ACCOUNT_ID\n' +
      '- R2_ACCESS_KEY_ID\n' +
      '- R2_SECRET_ACCESS_KEY\n' +
      '- R2_BUCKET_NAME'
    );
  }
  
  // Validate credentials are not empty
  if (!process.env.R2_ACCOUNT_ID?.trim() || 
      !process.env.R2_ACCESS_KEY_ID?.trim() || 
      !process.env.R2_SECRET_ACCESS_KEY?.trim()) {
    throw new Error('R2 credentials cannot be empty');
  }
};

// Lazy initialization - validate and create client when first accessed
let _r2Client = null;
let _r2BucketName = null;
let _initialized = false;

const initializeR2 = () => {
  if (_initialized) {
    return;
  }
  
  try {
    validateR2Credentials();
  } catch (error) {
    console.error('\n❌ R2 Configuration Error:', error.message);
    console.error('   Make sure your .env file is in the backend/ directory and contains all R2 credentials.');
    process.exit(1);
  }

  const endpoint = `https://${process.env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`;
  _r2Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
    },
  });

  _r2BucketName = process.env.R2_BUCKET_NAME.trim();
  _initialized = true;

  // Log R2 configuration
  r2Logger.config(_r2BucketName, endpoint);
};

// Initialize on module load (after dotenv.config() has been called in index.js)
// Use setTimeout to ensure dotenv.config() has run first
if (typeof process !== 'undefined' && process.env) {
  // Check if we're in Node.js environment
  // Use setImmediate to defer initialization until after all imports are processed
  setImmediate(() => {
    // Only initialize if credentials are available (dotenv has loaded)
    if (process.env.R2_ACCOUNT_ID || process.env.R2_ACCESS_KEY_ID) {
      try {
        initializeR2();
      } catch (error) {
        // Error already logged in initializeR2
      }
    }
  });
}

// Export getters that initialize on first access (fallback)
export const getR2Client = () => {
  if (!_initialized) {
    initializeR2();
  }
  return _r2Client;
};

export const getR2BucketName = () => {
  if (!_initialized) {
    initializeR2();
  }
  return _r2BucketName;
};

// For ES modules, export as Proxy for r2Client
export const r2Client = new Proxy({}, {
  get(target, prop) {
    const client = getR2Client();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
  ownKeys() {
    return Object.keys(getR2Client());
  },
  getOwnPropertyDescriptor(target, prop) {
    return Object.getOwnPropertyDescriptor(getR2Client(), prop);
  },
  has(target, prop) {
    return prop in getR2Client();
  },
});

// Export R2_BUCKET_NAME as a getter function for backward compatibility
// Note: Use getR2BucketName() directly in new code
export const R2_BUCKET_NAME = getR2BucketName;

