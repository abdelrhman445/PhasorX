import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import { ENV } from './config/env.config';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import componentRoutes from './modules/components/component.routes';
import circuitRoutes from './modules/circuits/circuit.routes';
import simulationRoutes from './modules/simulation/simulation.routes';

import { errorHandler } from './core/middlewares/error.middleware';

const app: Application = express();

app.use(cors()); 
app.use(express.json()); 

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/circuits', circuitRoutes);
app.use('/api/simulation', simulationRoutes);

// مسار فحص حالة السيرفر
app.get('/', (req: Request, res: Response) => {
  res.send('⚡️ PhasorX API is Running Perfectly!');
});

app.use(errorHandler);

// 8. تشغيل السيرفر
const PORT = ENV.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is strictly running on port ${PORT} in ${ENV.NODE_ENV} mode`);
});

export default app;