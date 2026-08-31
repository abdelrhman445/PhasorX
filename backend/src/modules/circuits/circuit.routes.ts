import { Router } from 'express';
import {
  createCircuit,
  getMyCircuits,
  getCircuitById,
  updateCircuit,
  deleteCircuit,
} from './circuit.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

// كل الروابط الخاصة بالدوائر لازم المستخدم يكون مسجل دخول
router.use(protect as any);

router.post('/', createCircuit as any); // إنشاء دائرة جديدة
router.get('/mine', getMyCircuits as any); // جلب كل دوائر المستخدم الحالي
router.get('/:id', getCircuitById as any); // جلب دائرة محددة بالـ ID
router.put('/:id', updateCircuit as any); // تحديث دائرة
router.delete('/:id', deleteCircuit as any); // حذف دائرة

export default router;
