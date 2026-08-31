import type { NodeProps } from 'reactflow';
import type { ElectricalNodeData } from '../../types';
import PinPair from './PinPair';

export default function TerminalBlockNode({ data }: NodeProps<ElectricalNodeData>) {
  return (
    <div className="bg-amber-50 border-2 border-amber-800 rounded shadow-md p-3 text-center min-w-[150px] min-h-[110px] relative">
      <div className="font-bold text-xs text-amber-900 mb-1">🟧 {data.label}</div>
      <div className="text-[9px] text-amber-700 mb-2">بلوك توصيل (Bus)</div>

      <PinPair top="35%" leftId="T1" rightId="T2" leftType="target" rightType="source" color="#b45309" />
      <PinPair top="70%" leftId="T3" rightId="T4" leftType="target" rightType="source" color="#b45309" />
    </div>
  );
}
