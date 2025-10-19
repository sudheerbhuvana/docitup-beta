import { apiLogger } from '../utils/logger.js';

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Prepare body for logging (censor sensitive data)
  const bodyToLog = req.method !== 'GET' && req.body ? { ...req.body } : null;
  if (bodyToLog?.password) bodyToLog.password = '********';
  
  // Store request ID for correlation
  const requestId = apiLogger.request(
    req.method,
    req.originalUrl || req.path,
    bodyToLog,
    req.userId || null,
    req
  );
  req.requestId = requestId;
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    apiLogger.response(
      req.method,
      req.originalUrl || req.path,
      res.statusCode,
      null,
      duration,
      requestId
    );
  });
  
  next();
};

// Error logger
export const errorLogger = (err, req, res, next) => {
  apiLogger.error(
    req.method,
    req.originalUrl || req.path,
    err,
    req.userId || null,
    req.requestId || null
  );
  next(err);
};

