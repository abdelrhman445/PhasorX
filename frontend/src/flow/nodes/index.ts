import PowerSourceNode from './PowerSourceNode';
import MotorNode from './MotorNode';
import PushButtonNode from './PushButtonNode';
import ContactorNode from './ContactorNode';
import RelayNode from './RelayNode';
import TimerNode from './TimerNode';
import ToggleDeviceNode from './ToggleDeviceNode';
import SelectorSwitchNode from './SelectorSwitchNode';
import PassiveComponentNode from './PassiveComponentNode';
import PilotLampNode from './PilotLampNode';
import TerminalBlockNode from './TerminalBlockNode';

export const nodeTypes = {
  power: PowerSourceNode,
  motor: MotorNode,
  pushButtonNO: PushButtonNode,
  pushButtonNC: PushButtonNode,
  contactor: ContactorNode,
  relay: RelayNode,
  timer: TimerNode,

  // protective / manual switching gear
  isolatorSwitch: ToggleDeviceNode,
  circuitBreaker: ToggleDeviceNode,
  fuse: ToggleDeviceNode,
  overloadRelay: ToggleDeviceNode,

  // mechanically actuated switches
  emergencyStop: PushButtonNode,
  limitSwitchNO: PushButtonNode,
  limitSwitchNC: PushButtonNode,

  // selector
  selectorSwitch: SelectorSwitchNode,

  // basic passives
  resistor: PassiveComponentNode,
  capacitor: PassiveComponentNode,
  inductor: PassiveComponentNode,

  // indicator / bus
  pilotLamp: PilotLampNode,
  terminalBlock: TerminalBlockNode,
};
