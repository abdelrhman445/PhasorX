import { Request, Response } from 'express';
import Component from './component.model';

// جلب كل المكونات (عشان تتعرض في القائمة الجانبية)
export const getAllComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const components = await Component.find({});
    res.status(200).json({ success: true, count: components.length, data: components });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// إنشاء مكون جديد (فقط للـ Admin عشان يغذي الـ Database)
export const createComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const component = await Component.create(req.body);
    res.status(201).json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};