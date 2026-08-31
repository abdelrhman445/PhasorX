import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// بنعمل Interface جديد عشان نضيف الـ user جوه الـ Request
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_phasorx_key') as any;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'التوكن غير صالح أو انتهت صلاحيته' });
  }
};