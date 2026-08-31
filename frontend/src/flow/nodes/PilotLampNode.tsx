import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';

export default function PilotLampNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="bg-white border-2 border-gray-800 rounded-full shadow-md p-3 text-center w-[90px] h-[90px] flex flex-col items-center justify-center relative">
      <div className="text-lg leading-none">💡</div>
      <div className="font-bold text-[10px] text-gray-800 mt-1">{data.label}</div>

      <Handle type="target" position={Position.Left} id="L" style={{ top: '50%', background: '#eab308' }} />
      <div className="absolute left-[-14px] top-[42%] text-[9px] font-bold">L</div>
    </div>
  );
}
