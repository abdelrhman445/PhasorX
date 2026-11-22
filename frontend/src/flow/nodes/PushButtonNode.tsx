import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ComponentType, ElectricalNodeData } from '../../types';

const NO_TYPES: ComponentType[] = ['pushButtonNO', 'limitSwitchNO'];

const ICONS: Partial<Record<ComponentType, string>> = {
  pushButtonNO: '🔘',
  pushButtonNC: '🔴',
  limitSwitchNO: '📍',
  limitSwitchNC: '📍',
  emergencyStop: '🛑',
};

export default function PushButtonNode({ id, data }: NodeProps<ElectricalNodeData>) {
  const isNO = NO_TYPES.includes(data.componentType);
  const pressed = data.pressed === true;
  const isEStop = data.componentType === 'emergencyStop';

  return (
    <div className="node-shell p-3 text-center min-w-[130px] relative">
      <div className="node-label">
        {ICONS[data.componentType] ?? (isNO ? '🔘' : '🔴')} {data.label}
      </div>
      <button
        type="button"
        onClick={() => data.onTogglePress?.(id)}
        className={`w-full text-[11px] font-semibold py-1 rounded transition ${
          pressed
            ? isEStop
              ? 'bg-red-700 text-white'
              : 'bg-green-600 text-white'
            : 'bg-panel-2 text-slate-300 border border-line'
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
