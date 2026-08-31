import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ComponentType, ElectricalNodeData } from '../../types';

const ICONS: Partial<Record<ComponentType, string>> = {
  isolatorSwitch: '🔌',
  circuitBreaker: '⛔',
  fuse: '🧯',
  overloadRelay: '♨️',
};

const PIN_IDS: Partial<Record<ComponentType, [string, string]>> = {
  overloadRelay: ['95', '96'],
};

export default function ToggleDeviceNode({ id, data }: NodeProps<ElectricalNodeData>) {
  const tripped = data.pressed === true; // pressed === true means OPEN (off / tripped / blown)
  const [leftId, rightId] = PIN_IDS[data.componentType] ?? ['IN', 'OUT'];

  return (
    <div className="bg-white border-2 border-gray-800 rounded shadow-md p-3 text-center min-w-[130px] relative">
      <div className="font-bold text-xs text-gray-800 mb-1">
        {ICONS[data.componentType] ?? '🔧'} {data.label}
      </div>
      <button
        type="button"
        onClick={() => data.onTogglePress?.(id)}
        className={`w-full text-[11px] font-semibold py-1 rounded transition ${
          tripped ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}
      >
        {tripped ? 'مفصول / معطوب' : 'موصّل'}
      </button>

      <Handle type="target" position={Position.Left} id={leftId} style={{ top: '50%', background: '#334155' }} />
      <Handle type="source" position={Position.Right} id={rightId} style={{ top: '50%', background: '#334155' }} />
      <div className="absolute left-[-18px] top-[42%] text-[10px] font-bold">{leftId}</div>
      <div className="absolute right-[-24px] top-[42%] text-[10px] font-bold">{rightId}</div>
    </div>
  );
}
