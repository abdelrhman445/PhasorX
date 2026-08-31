import { Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, data: any, message: string = 'تمت العملية بنجاح') => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};