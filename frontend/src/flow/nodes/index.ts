import PowerSourceNode from './PowerSourceNode';
import MotorNode from './MotorNode';
import PushButtonNode from './PushButtonNode';
import ContactorNode from './ContactorNode';
import RelayNode from './RelayNode';
import TimerNode from './TimerNode';

export const nodeTypes = {
  power: PowerSourceNode,
  motor: MotorNode,
  pushButtonNO: PushButtonNode,
  pushButtonNC: PushButtonNode,
  contactor: ContactorNode,
  relay: RelayNode,
  timer: TimerNode,
};
