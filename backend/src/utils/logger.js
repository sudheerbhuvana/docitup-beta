// Raw Logger - No formatting, just complete logs

const getTimestamp = () => new Date().toISOString();

const log = (level, category, data) => {
  const entry = {
    timestamp: getTimestamp(),
    level,
    category,
    ...data
  };
  console.log(JSON.stringify(entry));
};

// MongoDB Logger
export const mongoLogger = {
  connect: (uri) => {
    log('INFO', 'MONGODB', {
      event: 'CONNECTION_INITIATED',
      uri: uri.replace(/\/\/.*@/, '//***:***@')
    });
  },
  
  connected: (dbName, host) => {
    log('INFO', 'MONGODB', {
      event: 'CONNECTION_ESTABLISHED',
      database: dbName,
      host,
      state: 'CONNECTED'
    });
  },
  
  error: (error) => {
    log('ERROR', 'MONGODB', {
      event: 'CONNECTION_ERROR',
      error: error.message,
      code: error.code || 'UNKNOWN',
      stack: error.stack
    });
  },
  
  disconnected: () => {
    log('WARN', 'MONGODB', {
      event: 'CONNECTION_LOST',
      state: 'DISCONNECTED'
    });
  },
  
  reconnected: () => {
    log('INFO', 'MONGODB', {
      event: 'RECONNECTION_SUCCESSFUL',
      state: 'RECONNECTED'
    });
  },
  
  query: (operation, collection, query = {}, options = {}) => {
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    log('INFO', 'MONGODB', {
      event: 'QUERY_EXECUTION',
      queryId,
      operation: operation.toUpperCase(),
      collection,
      filter: query,
      options
    });
    return queryId;
  },
  
  queryResult: (operation, count, duration, queryId = null) => {
    log('INFO', 'MONGODB', {
      event: 'QUERY_COMPLETED',
      queryId,
      operation: operation.toUpperCase(),
      documentsReturned: count,
      executionTimeMs: duration
    });
  },
  
  queryError: (operation, error, queryId = null) => {
    log('ERROR', 'MONGODB', {
      event: 'QUERY_FAILED',
      queryId,
      operation: operation.toUpperCase(),
      error: error.message,
      code: error.code || 'UNKNOWN',
      name: error.name,
      stack: error.stack
    });
  },
};

// R2 Logger
export const r2Logger = {
  config: (bucket, endpoint) => {
    log('INFO', 'R2', {
      event: 'CONFIGURATION',
      bucket,
      endpoint: endpoint?.replace(/\/\/.*@/, '//***:***@') || 'N/A'
    });
  },
  
  uploadStart: (fileName, fileSize, contentType, userId) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    log('INFO', 'R2', {
      event: 'UPLOAD_INITIATED',
      uploadId,
      fileName,
      fileSize,
      contentType,
      userId
    });
    return uploadId;
  },
  
  uploadSuccess: (fileName, key, duration, uploadId = null) => {
    log('INFO', 'R2', {
      event: 'UPLOAD_COMPLETED',
      uploadId,
      fileName,
      key,
      durationMs: duration
    });
  },
  
  uploadError: (fileName, error, uploadId = null) => {
    log('ERROR', 'R2', {
      event: 'UPLOAD_FAILED',
      uploadId,
      fileName,
      error: error.message,
      code: error.code || error.$metadata?.httpStatusCode || 'UNKNOWN',
      name: error.name,
      stack: error.stack
    });
  },
  
  deleteStart: (fileKey, userId) => {
    const deleteId = `delete_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    log('INFO', 'R2', {
      event: 'DELETE_INITIATED',
      deleteId,
      fileKey,
      userId
    });
    return deleteId;
  },
  
  deleteSuccess: (fileKey, duration, deleteId = null) => {
    log('INFO', 'R2', {
      event: 'DELETE_COMPLETED',
      deleteId,
      fileKey,
      durationMs: duration
    });
  },
  
  deleteError: (fileKey, error, deleteId = null) => {
    log('ERROR', 'R2', {
      event: 'DELETE_FAILED',
      deleteId,
      fileKey,
      error: error.message,
      code: error.code || error.$metadata?.httpStatusCode || 'UNKNOWN',
      name: error.name,
      stack: error.stack
    });
  },
  
  presignedUrl: (key, expiresIn) => {
    log('INFO', 'R2', {
      event: 'PRESIGNED_URL_GENERATED',
      key,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    });
  },
};

// SES Logger
export const sesLogger = {
  config: (region, fromEmail) => {
    log('INFO', 'SES', {
      event: 'CONFIGURATION',
      region,
      fromEmail
    });
  },
  
  sendStart: (to, subject, type) => {
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    log('INFO', 'SES', {
      event: 'EMAIL_SEND_INITIATED',
      emailId,
      to,
      subject,
      type: type || 'General'
    });
    return emailId;
  },
  
  sendSuccess: (to, messageId, duration, emailId = null) => {
    log('INFO', 'SES', {
      event: 'EMAIL_SEND_SUCCESSFUL',
      emailId,
      to,
      messageId,
      durationMs: duration
    });
  },
  
  sendError: (to, error, emailId = null) => {
    const errorData = {
      event: 'EMAIL_SEND_FAILED',
      emailId,
      to,
      error: error.message || 'Unknown error',
      code: error.code || error.Code || error.$metadata?.httpStatusCode || 'UNKNOWN',
      name: error.name || 'UnknownError',
      httpStatus: error.$metadata?.httpStatusCode,
      stack: error.stack
    };
    
    // Add AWS-specific error details if available
    if (error.$metadata) {
      errorData.requestId = error.$metadata.requestId;
      errorData.retryAttempts = error.$metadata.attempts;
      errorData.cfId = error.$metadata.cfId;
    }
    
    // Add AWS error code if available
    if (error.Code) {
      errorData.awsCode = error.Code;
    }
    
    log('ERROR', 'SES', errorData);
  },
};

// API Logger
export const apiLogger = {
  request: (method, path, body = null, userId = null, req = null) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bodyToLog = body ? { ...body } : null;
    if (bodyToLog?.password) bodyToLog.password = '********';
    
    log('INFO', 'API', {
      event: 'REQUEST_RECEIVED',
      requestId,
      method,
      path,
      ip: req?.ip || req?.socket?.remoteAddress || 'N/A',
      userId: userId || null,
      userAgent: req?.get('user-agent') || 'N/A',
      body: bodyToLog
    });
    return requestId;
  },
  
  response: (method, path, status, data = null, duration = null, requestId = null) => {
    log('INFO', 'API', {
      event: 'RESPONSE_SENT',
      requestId,
      method,
      path,
      status,
      durationMs: duration,
      data
    });
  },
  
  error: (method, path, error, userId = null, requestId = null) => {
    log('ERROR', 'API', {
      event: 'REQUEST_ERROR',
      requestId,
      method,
      path,
      userId,
      error: error.message || error,
      name: error.name,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack
    });
  },
};

// Auth Logger
export const authLogger = {
  registerAttempt: (email) => {
    const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    log('INFO', 'AUTH', {
      event: 'REGISTRATION_ATTEMPT',
      authId,
      email,
      action: 'USER_REGISTRATION'
    });
    return authId;
  },
  
  registerSuccess: (email, userId, authId = null) => {
    log('INFO', 'AUTH', {
      event: 'REGISTRATION_SUCCESSFUL',
      authId,
      email,
      userId
    });
  },
  
  registerError: (email, error, authId = null) => {
    log('ERROR', 'AUTH', {
      event: 'REGISTRATION_FAILED',
      authId,
      email,
      error: error.message || error
    });
  },
  
  loginAttempt: (email) => {
    const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    log('INFO', 'AUTH', {
      event: 'LOGIN_ATTEMPT',
      authId,
      email,
      action: 'USER_LOGIN'
    });
    return authId;
  },
  
  loginSuccess: (email, userId, authId = null) => {
    log('INFO', 'AUTH', {
      event: 'LOGIN_SUCCESSFUL',
      authId,
      email,
      userId
    });
  },
  
  loginError: (email, reason, authId = null) => {
    log('ERROR', 'AUTH', {
      event: 'LOGIN_FAILED',
      authId,
      email,
      reason
    });
  },
  
  tokenVerify: (token) => {
    log('INFO', 'AUTH', {
      event: 'TOKEN_VERIFICATION',
      tokenHash: token.substring(0, 20) + '...',
      tokenLength: token.length
    });
  },
  
  tokenValid: (userId) => {
    log('INFO', 'AUTH', {
      event: 'TOKEN_VALID',
      userId
    });
  },
  
  tokenInvalid: (reason) => {
    log('ERROR', 'AUTH', {
      event: 'TOKEN_INVALID',
      reason
    });
  },
  
  otpSent: (email) => {
    log('INFO', 'AUTH', {
      event: 'OTP_SENT',
      email
    });
  },
  
  otpError: (email, reason) => {
    log('ERROR', 'AUTH', {
      event: 'OTP_SEND_FAILED',
      email,
      reason
    });
  },
  
  otpVerified: (email) => {
    log('INFO', 'AUTH', {
      event: 'OTP_VERIFIED',
      email
    });
  },
  
  otpVerificationFailed: (email, reason) => {
    log('ERROR', 'AUTH', {
      event: 'OTP_VERIFICATION_FAILED',
      email,
      reason
    });
  },
};

// General Logger
export const logger = {
  info: (message, data = {}) => {
    log('INFO', 'GENERAL', { message, ...data });
  },
  
  success: (message, data = {}) => {
    log('INFO', 'GENERAL', { message, status: 'SUCCESS', ...data });
  },
  
  warn: (message, data = {}) => {
    log('WARN', 'GENERAL', { message, ...data });
  },
  
  error: (message, error = null) => {
    log('ERROR', 'GENERAL', {
      message,
      error: error ? {
        message: error.message || error,
        stack: error.stack,
        name: error.name,
        code: error.code
      } : null
    });
  },
  
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      log('DEBUG', 'GENERAL', { message, ...data });
    }
  },
};