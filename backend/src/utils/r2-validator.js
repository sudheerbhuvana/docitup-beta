/**
 * Validates that a string is an R2 key (not a URL or base64)
 * R2 keys should be in format: userId/timestamp-random.extension
 */
export const isValidR2Key = (key) => {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // Must not be a URL
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return false;
  }
  
  // Must not be base64 (base64 strings are typically longer and contain specific characters)
  // Base64 strings usually start with data:image/ or data:video/ or are very long base64 encoded strings
  if (key.startsWith('data:') || key.length > 1000) {
    return false;
  }
  
  // R2 key should match pattern: userId/timestamp-random.extension
  // Basic validation: should contain at least one slash and not contain spaces
  if (!key.includes('/') || key.includes(' ')) {
    return false;
  }
  
  return true;
};

/**
 * Validates an array of R2 keys
 */
export const validateR2Keys = (keys) => {
  if (!keys || !Array.isArray(keys)) {
    return { valid: false, error: 'Media must be an array of R2 keys' };
  }
  
  const invalidKeys = keys.filter(key => !isValidR2Key(key));
  
  if (invalidKeys.length > 0) {
    return {
      valid: false,
      error: `Invalid R2 keys detected. Keys must be R2 storage keys, not URLs or base64 data. Invalid keys: ${invalidKeys.slice(0, 3).join(', ')}`,
      invalidKeys,
    };
  }
  
  return { valid: true };
};

/**
 * Sanitizes media array to ensure only valid R2 keys are stored
 */
export const sanitizeMediaArray = (media) => {
  if (!media || !Array.isArray(media)) {
    return [];
  }
  
  return media.filter(key => isValidR2Key(key));
};

