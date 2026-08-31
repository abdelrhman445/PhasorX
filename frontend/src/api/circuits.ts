import { apiClient } from './client';
import type {
  Circuit,
  CircuitNodeDTO,
  CircuitWireDTO,
  SimulationResult,
} from '../types';

export async function fetchMyCircuits(): Promise<Circuit[]> {
  const res = await apiClient.get('/circuits/mine');
  return res.data.data;
}

export async function fetchCircuit(id: string): Promise<Circuit> {
  const res = await apiClient.get(`/circuits/${id}`);
  return res.data.data;
}

export async function createCircuit(payload: {
  title: string;
  isPublic: boolean;
  nodes: CircuitNodeDTO[];
  wires: CircuitWireDTO[];
}): Promise<Circuit> {
  const res = await apiClient.post('/circuits', payload);
  return res.data.data;
}

export async function updateCircuit(
  id: string,
  payload: { title: string; isPublic: boolean; nodes: CircuitNodeDTO[]; wires: CircuitWireDTO[] }
): Promise<Circuit> {
  const res = await apiClient.put(`/circuits/${id}`, payload);
  return res.data.data;
}

export async function deleteCircuit(id: string): Promise<void> {
  await apiClient.delete(`/circuits/${id}`);
}

export async function runSimulation(
  nodes: { nodeId: string; type: string; data: Record<string, unknown> }[],
  wires: CircuitWireDTO[]
): Promise<SimulationResult> {
  const res = await apiClient.post('/simulation/run', { nodes, wires });
  return res.data.data;
}
