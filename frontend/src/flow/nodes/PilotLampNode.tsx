import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';

export default function PilotLampNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="node-shell node-shell-round p-3 text-center w-[90px] h-[90px] flex flex-col items-center justify-center relative">
      <div className="text-lg leading-none">💡</div>
      <div className="node-label text-[10px]! mt-1">{data.label}</div>

      <Handle type="target" position={Position.Left} id="L" style={{ top: '50%', background: '#eab308' }} />
      <div className="absolute left-[-14px] top-[42%] text-[9px] font-bold">L</div>
    </div>
  );
}
