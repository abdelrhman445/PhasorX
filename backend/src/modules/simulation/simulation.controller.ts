import { Response } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { SimulationService } from './simulation.service';

export const runSimulation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nodes, wires } = req.body;

    if (!nodes || !wires) {
      res.status(400).json({ success: false, message: 'بيانات الدائرة غير مكتملة للمحاكاة' });
      return;
    }

    const simulationResult = SimulationService.analyzeCircuitGraph(nodes, wires);

    res.status(200).json({ success: true, data: simulationResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};