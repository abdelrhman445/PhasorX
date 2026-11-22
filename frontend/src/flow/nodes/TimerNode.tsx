import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';
import PinPair from './PinPair';

export default function TimerNode({ id, data }: NodeProps<ElectricalNodeData>) {
  const delaySeconds = data.delaySeconds ?? 5;

  return (
    <div className="node-shell p-3 text-center min-w-[160px] min-h-[160px] relative">
      <div className="node-label">⏱️ {data.label}</div>

      <div className="node-sub flex items-center justify-center gap-1 mb-2">
        <span>TON</span>
        <input
          type="number"
          min={0}
          step={0.5}
          value={delaySeconds}
          onChange={(e) => data.onChangeDelay?.(id, Number(e.target.value))}
          className="node-input w-12 px-1 py-0.5 text-[10px] text-center"
        />
        <span>s</span>
      </div>

      <PinPair top="30%" leftId="A1" rightId="A2" leftType="target" rightType="target" color="#7c3aed" />
      <PinPair top="60%" leftId="15" rightId="16" leftType="target" rightType="source" color="#16a34a" />
      <PinPair top="88%" leftId="17" rightId="18" leftType="target" rightType="source" color="#dc2626" />
    </div>
  );
}
