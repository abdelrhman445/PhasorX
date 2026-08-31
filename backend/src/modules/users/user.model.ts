import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'engineer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['student', 'engineer', 'admin'], 
      default: 'student' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);