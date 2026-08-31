import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ComponentType, ElectricalNodeData } from '../../types';

const ICONS: Partial<Record<ComponentType, string>> = {
  resistor: '🟫',
  capacitor: '🔵',
  inductor: '🌀',
};

const DEFAULT_UNIT: Partial<Record<ComponentType, string>> = {
  resistor: 'Ω',
  capacitor: 'F',
  inductor: 'H',
};

export default function PassiveComponentNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="bg-white border-2 border-gray-800 rounded shadow-md p-3 text-center min-w-[120px] relative">
      <div className="font-bold text-xs text-gray-800 mb-1">
        {ICONS[data.componentType] ?? '🔩'} {data.label}
      </div>
      {data.value && <div className="text-[10px] text-gray-500">{data.value}</div>}
      {!data.value && DEFAULT_UNIT[data.componentType] && (
        <div className="text-[9px] text-gray-400">قيمة غير محددة ({DEFAULT_UNIT[data.componentType]})</div>
      )}

      <Handle type="target" position={Position.Left} id="IN" style={{ top: '50%', background: '#334155' }} />
      <Handle type="source" position={Position.Right} id="OUT" style={{ top: '50%', background: '#334155' }} />
      <div className="absolute left-[-18px] top-[42%] text-[10px] font-bold">IN</div>
      <div className="absolute right-[-24px] top-[42%] text-[10px] font-bold">OUT</div>
    </div>
  );
}
