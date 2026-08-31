import User, { IUser } from '../users/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.config';

export class AuthService {
  static generateToken(id: string, role: string) {
    return jwt.sign({ id, role }, ENV.JWT_SECRET, { expiresIn: '30d' });
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(candidatePassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hash);
  }
}