import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authLogger, mongoLogger } from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      authLogger.tokenInvalid('No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    authLogger.tokenVerify(token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    mongoLogger.query('findById', 'users', { _id: decoded.userId });
    const user = await User.findById(decoded.userId).select('-password');
    mongoLogger.queryResult('findById', user ? 1 : 0);
    
    if (!user) {
      authLogger.tokenInvalid('User not found');
      return res.status(401).json({ error: 'User not found' });
    }
    
    authLogger.tokenValid(user._id.toString());
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    authLogger.tokenInvalid(error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

