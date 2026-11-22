import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';
import PinPair from './PinPair';

export default function RelayNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="node-shell p-3 text-center min-w-[150px] min-h-[140px] relative">
      <div className="node-label">🔁 {data.label}</div>
      <div className="node-sub mb-2">Coil A1-A2</div>

      <PinPair top="20%" leftId="A1" rightId="A2" leftType="target" rightType="target" color="#7c3aed" />
      <PinPair top="55%" leftId="13" rightId="14" leftType="target" rightType="source" color="#16a34a" />
      <PinPair top="85%" leftId="21" rightId="22" leftType="target" rightType="source" color="#dc2626" />
    </div>
  );
}
