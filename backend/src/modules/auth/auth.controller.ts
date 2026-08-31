import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../users/user.model';
import { validateAuthInput } from './auth.validation';
import { ENV } from '../../config/env.config';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, ENV.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبين' });
      return;
    }

    const validation = validateAuthInput({ email, password, name });
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل' });
      return;
    }

    // تشفير الباسورد
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash, role });

    res.status(201).json({
      success: true,
      token: generateToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبين' });
      return;
    }

    const validation = validateAuthInput({ email, password });
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    res.status(200).json({
      success: true,
      token: generateToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
