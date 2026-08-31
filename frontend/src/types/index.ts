// ==========================================================
// Shared types
// ==========================================================

export type ComponentType =
  | 'power'
  | 'motor'
  | 'pushButtonNO'
  | 'pushButtonNC'
  | 'contactor'
  | 'relay'
  | 'timer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'engineer' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

/** Data payload carried by every React Flow node on the canvas. */
export interface ElectricalNodeData {
  componentType: ComponentType;
  label: string;
  pressed?: boolean; // push buttons only
  delaySeconds?: number; // timer only
  onTogglePress?: (nodeId: string) => void; // push buttons only — wired in by the canvas
  onChangeDelay?: (nodeId: string, seconds: number) => void; // timer only — wired in by the canvas
}

export interface CircuitNodeDTO {
  nodeId: string;
  componentType: ComponentType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface CircuitWireDTO {
  wireId: string;
  sourceNodeId: string;
  sourcePin: string;
  targetNodeId: string;
  targetPin: string;
  color?: string;
}

export interface Circuit {
  _id: string;
  title: string;
  ownerId: string | { _id: string; name: string; email: string };
  isPublic: boolean;
  nodes: CircuitNodeDTO[];
  wires: CircuitWireDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface MotorSimResult {
  nodeId: string;
  label: string;
  running: boolean;
  energizedPins: { U1: boolean; V1: boolean; W1: boolean };
  missingPhases: string[];
}

export interface CoilSimResult {
  nodeId: string;
  type: ComponentType;
  coilEnergized: boolean;
  contacts: { label: string; pinA: string; pinB: string; closed: boolean }[];
}

export interface SwitchSimResult {
  nodeId: string;
  type: ComponentType;
  pressed: boolean;
  closed: boolean;
}

export interface SimulationResult {
  status: string;
  message: string;
  results: {
    energizedPinCount: number;
    iterationsToConverge: number;
    motors: MotorSimResult[];
    coils: CoilSimResult[];
    switches: SwitchSimResult[];
    nodesStatus: { nodeId: string; state: string }[];
  };
}
