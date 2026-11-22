import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';

export default function PowerSourceNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="node-shell p-3 text-center min-w-[140px] relative">
      <div className="node-label text-sm">⚡️ {data.label}</div>

      <Handle type="source" position={Position.Right} id="L1" style={{ top: '25%', background: '#ef4444' }} />
      <Handle type="source" position={Position.Right} id="L2" style={{ top: '50%', background: '#eab308' }} />
      <Handle type="source" position={Position.Right} id="L3" style={{ top: '75%', background: '#3b82f6' }} />
      <div className="absolute right-[-20px] top-[15%] text-[10px] font-bold">L1</div>
      <div className="absolute right-[-20px] top-[40%] text-[10px] font-bold">L2</div>
      <div className="absolute right-[-20px] top-[65%] text-[10px] font-bold">L3</div>
    </div>
  );
}
