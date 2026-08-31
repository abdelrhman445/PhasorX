import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/phasorx',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_phasorx_key',
  NODE_ENV: process.env.NODE_ENV || 'development',
};