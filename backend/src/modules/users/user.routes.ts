import { Router } from 'express';
import { getMyProfile } from './user.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/profile', protect as any, getMyProfile as any);

export default router;