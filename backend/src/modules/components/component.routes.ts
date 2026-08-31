import { Router } from 'express';
import { getAllComponents, createComponent } from './component.controller';

const router = Router();

router.get('/', getAllComponents);
router.post('/', createComponent); 

export default router;