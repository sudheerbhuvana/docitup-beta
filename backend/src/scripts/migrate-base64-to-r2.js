/**
 * Migration script to convert base64 media in entries to R2 storage
 * Run this once to migrate all legacy base64 data to R2
 * 
 * Usage: node src/scripts/migrate-base64-to-r2.js
 */

import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../db/connection.js';
import { Entry } from '../models/Entry.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, getR2BucketName } from '../config/r2.js';
import { logger } from '../utils/logger.js';

/**
 * Convert base64 data URL to Buffer
 */
const base64ToBuffer = (dataUrl) => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data URL');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  return { buffer, mimeType };
};

/**
 * Upload base64 data to R2 and return R2 key
 */
const uploadBase64ToR2 = async (base64Data, userId, index) => {
  try {
    const { buffer, mimeType } = base64ToBuffer(base64Data);
    
    // Determine file extension from mime type
    const extensionMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/mov': 'mov',
    };
    const extension = extensionMap[mimeType] || 'bin';
    
    // Generate R2 key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const key = `${userId}/${timestamp}-${random}-migrated-${index}.${extension}`;
    
    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });
    
    await r2Client.send(command);
    
    logger.success(`Uploaded base64 to R2: ${key}`);
    return key;
  } catch (error) {
    logger.error(`Failed to upload base64 to R2: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate all entries with base64 data to R2
 */
const migrateEntries = async () => {
  try {
    await connectDB();
    logger.info('Starting migration of base64 data to R2...');
    
    // Find all entries with base64 data
    const entries = await Entry.find({});
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const entry of entries) {
      if (!entry.media || entry.media.length === 0) {
        skippedCount++;
        continue;
      }
      
      // Check if entry has base64 data
      const hasBase64 = entry.media.some(item => typeof item === 'string' && item.startsWith('data:'));
      
      if (!hasBase64) {
        skippedCount++;
        continue;
      }
      
      try {
        const newMedia = [];
        let needsUpdate = false;
        
        for (let i = 0; i < entry.media.length; i++) {
          const mediaItem = entry.media[i];
          
          // If it's base64, upload to R2
          if (typeof mediaItem === 'string' && mediaItem.startsWith('data:')) {
            logger.info(`Migrating base64 media for entry ${entry._id} (${i + 1}/${entry.media.length})...`);
            const r2Key = await uploadBase64ToR2(mediaItem, entry.userId.toString(), i);
            newMedia.push(r2Key);
            needsUpdate = true;
          } else if (typeof mediaItem === 'string' && !mediaItem.startsWith('http://') && !mediaItem.startsWith('https://')) {
            // It's already an R2 key, keep it
            newMedia.push(mediaItem);
          } else {
            // Skip URLs or invalid data
            logger.warn(`Skipping invalid media item in entry ${entry._id}: ${mediaItem.substring(0, 50)}...`);
          }
        }
        
        if (needsUpdate) {
          entry.media = newMedia;
          await entry.save();
          migratedCount++;
          logger.success(`Migrated entry ${entry._id}: ${entry.media.length} media items`);
        }
      } catch (error) {
        errorCount++;
        logger.error(`Failed to migrate entry ${entry._id}: ${error.message}`);
      }
    }
    
    logger.success(`\nMigration complete!`);
    logger.info(`  - Migrated: ${migratedCount} entries`);
    logger.info(`  - Skipped: ${skippedCount} entries (no base64 data)`);
    logger.info(`  - Errors: ${errorCount} entries`);
    
    process.exit(0);
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

// Run migration
migrateEntries();

