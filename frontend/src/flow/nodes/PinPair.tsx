import { Handle, Position } from 'reactflow';

interface PinPairProps {
  top: string; // e.g. '25%'
  leftId: string;
  rightId: string;
  leftType: 'source' | 'target';
  rightType: 'source' | 'target';
  color?: string;
}

/** Renders one horizontal row: a labeled handle on the left and one on the right. */
export default function PinPair({ top, leftId, rightId, leftType, rightType, color = '#334155' }: PinPairProps) {
  return (
    <>
      <Handle type={leftType} position={Position.Left} id={leftId} style={{ top, background: color }} />
      <Handle type={rightType} position={Position.Right} id={rightId} style={{ top, background: color }} />
      <div className="absolute left-[-20px] text-[9px] font-bold" style={{ top: `calc(${top} - 6px)` }}>
        {leftId}
      </div>
      <div className="absolute right-[-20px] text-[9px] font-bold" style={{ top: `calc(${top} - 6px)` }}>
        {rightId}
      </div>
    </>
  );
}
