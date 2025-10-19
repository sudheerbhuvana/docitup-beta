// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './db/connection.js';
import { validateSESCredentials } from './config/ses.js';
import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entries.js';
import goalRoutes from './routes/goals.js';
import communityRoutes from './routes/community.js';
import mediaRoutes from './routes/media.js';
import profileRoutes from './routes/profile.js';
import taskRoutes from './routes/tasks.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger, errorLogger } from './middleware/logger.js';

const app = express(); 
const PORT = process.env.PORT || 5001;

console.log('\n' + '🚀'.repeat(40));
console.log('🚀 DOCITUP BACKEND STARTING...');
console.log('🚀'.repeat(40) + '\n');

// Connect to MongoDB
connectDB();

// Validate AWS SES credentials on startup
const sesCredentialsValid = validateSESCredentials();
if (!sesCredentialsValid) {
  console.warn('\n⚠️  WARNING: AWS SES credentials are missing!');
  console.warn('⚠️  Email sending will fail. Please set the following environment variables:');
  console.warn('⚠️  - AWS_SES_ACCESS_KEY_ID');
  console.warn('⚠️  - AWS_SES_SECRET_ACCESS_KEY');
  console.warn('⚠️  - AWS_REGION (optional, defaults to us-east-1)');
  console.warn('⚠️  - FROM_EMAIL (optional, defaults to noreply@docitup.com)\n');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Docitup API is running' });
});

// Error handling
app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('\n' + '✅'.repeat(40));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API Base: http://localhost:${PORT}/api`);
  console.log('✅'.repeat(40) + '\n');
  console.log('📝 Logs will appear below:\n');
});

