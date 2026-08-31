import mongoose, { Schema, Document } from 'mongoose';

// --- Interfaces ---
interface ICircuitNode {
  nodeId: string;
  componentType: string; // 'power' | 'motor' | 'pushButtonNO' | 'pushButtonNC' | 'contactor' | 'relay' | 'timer'
  position: { x: number; y: number };
  data: Record<string, any>; // label, pressed, delaySeconds, etc. — whatever the node needs to re-render/simulate
}

interface ICircuitWire {
  wireId: string;
  sourceNodeId: string;
  sourcePin: string;
  targetNodeId: string;
  targetPin: string;
  color: string;
}

export interface ICircuit extends Document {
  title: string;
  ownerId: mongoose.Types.ObjectId;
  isPublic: boolean;
  nodes: ICircuitNode[];
  wires: ICircuitWire[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Schemas ---
const NodeSchema = new Schema<ICircuitNode>(
  {
    nodeId: { type: String, required: true },
    componentType: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const WireSchema = new Schema<ICircuitWire>(
  {
    wireId: { type: String, required: true },
    sourceNodeId: { type: String, required: true },
    sourcePin: { type: String, required: true },
    targetNodeId: { type: String, required: true },
    targetPin: { type: String, required: true },
    color: { type: String, default: '#000000' },
  },
  { _id: false }
);

const CircuitSchema: Schema = new Schema(
  {
    title: { type: String, required: true, default: 'Untitled Circuit' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    nodes: [NodeSchema],
    wires: [WireSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ICircuit>('Circuit', CircuitSchema);
