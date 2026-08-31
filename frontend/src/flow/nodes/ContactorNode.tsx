import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';
import PinPair from './PinPair';

export default function ContactorNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="bg-white border-2 border-gray-800 rounded shadow-md p-3 text-center min-w-[150px] min-h-[220px] relative">
      <div className="font-bold text-xs text-gray-800 mb-1">🧲 {data.label}</div>
      <div className="text-[9px] text-gray-500 mb-2">Coil A1-A2</div>

      <PinPair top="14%" leftId="A1" rightId="A2" leftType="target" rightType="target" color="#7c3aed" />
      <PinPair top="34%" leftId="L1" rightId="T1" leftType="target" rightType="source" color="#ef4444" />
      <PinPair top="50%" leftId="L2" rightId="T2" leftType="target" rightType="source" color="#eab308" />
      <PinPair top="66%" leftId="L3" rightId="T3" leftType="target" rightType="source" color="#3b82f6" />
      <PinPair top="83%" leftId="13" rightId="14" leftType="target" rightType="source" color="#16a34a" />
      <PinPair top="95%" leftId="21" rightId="22" leftType="target" rightType="source" color="#dc2626" />
    </div>
  );
}
