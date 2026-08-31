import { Router } from 'express';
import { runSimulation } from './simulation.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.post('/run', protect as any, runSimulation as any);

export default router;