import mongoose from 'mongoose';
import { mongoLogger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/docitup';
    
    mongoLogger.connect(mongoURI);
    
    await mongoose.connect(mongoURI);
    
    mongoLogger.connected(mongoose.connection.name, mongoose.connection.host);
    
    mongoose.connection.on('error', (err) => {
      mongoLogger.error(err);
    });
    
    mongoose.connection.on('disconnected', () => {
      mongoLogger.disconnected();
    });

    mongoose.connection.on('reconnected', () => {
      mongoLogger.reconnected();
    });
    
  } catch (error) {
    mongoLogger.error(error);
    console.error('   Make sure MongoDB is running!');
    process.exit(1);
  }
};

export default mongoose;

