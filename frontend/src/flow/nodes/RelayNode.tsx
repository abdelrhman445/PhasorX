import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';
import PinPair from './PinPair';

export default function RelayNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="bg-white border-2 border-gray-800 rounded shadow-md p-3 text-center min-w-[150px] min-h-[140px] relative">
      <div className="font-bold text-xs text-gray-800 mb-1">🔁 {data.label}</div>
      <div className="text-[9px] text-gray-500 mb-2">Coil A1-A2</div>

      <PinPair top="20%" leftId="A1" rightId="A2" leftType="target" rightType="target" color="#7c3aed" />
      <PinPair top="55%" leftId="13" rightId="14" leftType="target" rightType="source" color="#16a34a" />
      <PinPair top="85%" leftId="21" rightId="22" leftType="target" rightType="source" color="#dc2626" />
    </div>
  );
}
