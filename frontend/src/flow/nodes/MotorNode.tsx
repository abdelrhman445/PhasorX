import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';

export default function MotorNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="node-shell p-3 text-center min-w-[140px] relative">
      <div className="node-label text-sm">⚙️ {data.label}</div>

      <Handle type="target" position={Position.Left} id="U1" style={{ top: '25%', background: '#ef4444' }} />
      <Handle type="target" position={Position.Left} id="V1" style={{ top: '50%', background: '#eab308' }} />
      <Handle type="target" position={Position.Left} id="W1" style={{ top: '75%', background: '#3b82f6' }} />
      <div className="absolute left-[-22px] top-[15%] text-[10px] font-bold">U1</div>
      <div className="absolute left-[-22px] top-[40%] text-[10px] font-bold">V1</div>
      <div className="absolute left-[-22px] top-[65%] text-[10px] font-bold">W1</div>
    </div>
  );
}
