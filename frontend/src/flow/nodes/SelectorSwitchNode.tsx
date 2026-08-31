import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';

export default function SelectorSwitchNode({ id, data }: NodeProps<ElectricalNodeData>) {
  const position2 = data.pressed === true;

  return (
    <div className="bg-white border-2 border-gray-800 rounded shadow-md p-3 text-center min-w-[140px] min-h-[100px] relative">
      <div className="font-bold text-xs text-gray-800 mb-1">🎚️ {data.label}</div>
      <button
        type="button"
        onClick={() => data.onTogglePress?.(id)}
        className="w-full text-[11px] font-semibold py-1 rounded bg-blue-600 text-white transition"
      >
        {position2 ? 'الوضع 2 (OUT2)' : 'الوضع 1 (OUT1)'}
      </button>

      <Handle type="target" position={Position.Left} id="COM" style={{ top: '75%', background: '#334155' }} />
      <div className="absolute left-[-28px] top-[68%] text-[10px] font-bold">COM</div>

      <Handle type="source" position={Position.Right} id="OUT1" style={{ top: '35%', background: '#16a34a' }} />
      <div className="absolute right-[-28px] top-[27%] text-[10px] font-bold">OUT1</div>

      <Handle type="source" position={Position.Right} id="OUT2" style={{ top: '75%', background: '#dc2626' }} />
      <div className="absolute right-[-28px] top-[68%] text-[10px] font-bold">OUT2</div>
    </div>
  );
}
