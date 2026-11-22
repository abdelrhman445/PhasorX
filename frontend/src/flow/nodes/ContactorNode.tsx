import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';
import PinPair from './PinPair';

export default function ContactorNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="node-shell p-3 text-center min-w-[150px] min-h-[220px] relative">
      <div className="node-label">🧲 {data.label}</div>
      <div className="node-sub mb-2">Coil A1-A2</div>

      <PinPair top="14%" leftId="A1" rightId="A2" leftType="target" rightType="target" color="#7c3aed" />
      <PinPair top="34%" leftId="L1" rightId="T1" leftType="target" rightType="source" color="#ef4444" />
      <PinPair top="50%" leftId="L2" rightId="T2" leftType="target" rightType="source" color="#eab308" />
      <PinPair top="66%" leftId="L3" rightId="T3" leftType="target" rightType="source" color="#3b82f6" />
      <PinPair top="83%" leftId="13" rightId="14" leftType="target" rightType="source" color="#16a34a" />
      <PinPair top="95%" leftId="21" rightId="22" leftType="target" rightType="source" color="#dc2626" />
    </div>
  );
}
