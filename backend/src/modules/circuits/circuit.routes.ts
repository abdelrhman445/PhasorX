import { Router } from 'express';
import { 
  createCircuit, 
  getUserCircuits, 
  getCircuitById, 
  updateCircuit, 
  deleteCircuit 
} from './circuit.controller';

const router = Router();

// الروابط الخاصة بالدوائر
router.post('/', createCircuit);                        // إنشاء دائرة جديدة
router.get('/user/:ownerId', getUserCircuits);          // جلب كل دوائر مستخدم معين
router.get('/:id', getCircuitById);                     // جلب دائرة محددة بالـ ID
router.put('/:id', updateCircuit);                      // تحديث دائرة
router.delete('/:id', deleteCircuit);                   // حذف دائرة

export default router;