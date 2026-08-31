import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;

  // لو الآي دي بتاع المونجو دي بي غلط
  if (err.name === 'CastError') {
    const message = `العنصر غير موجود`;
    error = new AppError(message, 404);
  }

  // لو في حاجة متكررة (زي إيميل متسجل قبل كده)
  if (err.code === 11000) {
    const message = 'هذه البيانات مسجلة بالفعل';
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'خطأ داخلي في الخادم'
  });
};