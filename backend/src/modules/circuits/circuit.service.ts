import Circuit, { ICircuit } from './circuit.model';

export class CircuitService {
  static async createCircuit(data: Partial<ICircuit>) {
    const circuit = new Circuit(data);
    return await circuit.save();
  }

  static async getCircuitsByOwner(ownerId: string) {
    return await Circuit.find({ ownerId }).sort({ createdAt: -1 });
  }

  static async getCircuitDetails(circuitId: string) {
    return await Circuit.findById(circuitId).populate('ownerId', 'name email');
  }

  static async updateCircuit(circuitId: string, data: Partial<ICircuit>) {
    return await Circuit.findByIdAndUpdate(circuitId, data, { new: true, runValidators: true });
  }

  static async deleteCircuit(circuitId: string) {
    return await Circuit.findByIdAndDelete(circuitId);
  }
}
