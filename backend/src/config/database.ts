import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/phasorx';
    await mongoose.connect(mongoURI);
    console.log('⚡️ MongoDB Connected Successfully to PhasorX DB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};