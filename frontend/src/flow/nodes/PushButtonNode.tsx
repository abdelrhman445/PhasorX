import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';

export default function PushButtonNode({ id, data }: NodeProps<ElectricalNodeData>) {
  const isNO = data.componentType === 'pushButtonNO';
  const pressed = data.pressed === true;

  return (
    <div className="bg-white border-2 border-gray-800 rounded shadow-md p-3 text-center min-w-[130px] relative">
      <div className="font-bold text-xs text-gray-800 mb-1">
        {isNO ? '🔘' : '🔴'} {data.label}
      </div>
      <button
        type="button"
        onClick={() => data.onTogglePress?.(id)}
        className={`w-full text-[11px] font-semibold py-1 rounded transition ${
          pressed ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-300'
        }`}
      >
        {pressed ? 'مضغوط' : 'غير مضغوط'}
      </button>

      <Handle type="target" position={Position.Left} id="IN" style={{ top: '50%', background: '#334155' }} />
      <Handle type="source" position={Position.Right} id="OUT" style={{ top: '50%', background: '#334155' }} />
      <div className="absolute left-[-18px] top-[42%] text-[10px] font-bold">IN</div>
      <div className="absolute right-[-24px] top-[42%] text-[10px] font-bold">OUT</div>
    </div>
  );
}
