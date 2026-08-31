// ==========================================================
// Component Pin & Behavior Definitions
// ==========================================================
// This is the "physics rulebook" the simulation engine uses to know,
// for every component type, which of its pins are power sources,
// which are plain terminals, and which internal pin-pairs are
// electrically bridged (closed) under what conditions.
//
// Assumptions made explicit here (industrial control-circuit style):
// - A contactor / relay / timer coil is considered energized when its
//   A1 terminal is reachable from a live source. A2 is treated as the
//   common return path (as it almost always is, wired back to N /
//   the control-circuit common rail), so we don't require a separate
//   neutral network to be modeled for coil energization.
// - Timer (TON - on delay) contacts are evaluated at steady state,
//   i.e. "after the configured delay has elapsed". This engine
//   performs a static (snapshot) analysis, not a real-time tick
//   simulation, so the delay value is informational only and is
//   echoed back in the result for the UI to display.

export type ComponentType =
  | 'power'
  | 'motor'
  | 'pushButtonNO'
  | 'pushButtonNC'
  | 'contactor'
  | 'relay'
  | 'timer';

export interface SimNodeInput {
  nodeId: string;
  type: ComponentType;
  data?: {
    pressed?: boolean; // push buttons: is the operator holding it actuated?
    delaySeconds?: number; // timer: configured TON delay
    label?: string;
  };
}

export interface SimWireInput {
  wireId?: string;
  sourceNodeId: string;
  sourcePin: string;
  targetNodeId: string;
  targetPin: string;
}

/** A pin-pair inside a single component that may or may not conduct. */
export interface InternalBridge {
  pinA: string;
  pinB: string;
  /** Returns true if this bridge currently conducts (is "closed"). */
  isClosed: (ctx: { pressed?: boolean; coilEnergized: boolean }) => boolean;
  /** Human label for reporting, e.g. "NO contact 13-14". */
  label: string;
}

export interface ComponentDefinition {
  type: ComponentType;
  /** Pins that are always energized sources (e.g. a supply's L1/L2/L3). */
  sourcePins: string[];
  /** All pins this component exposes (for validation / reporting). */
  pins: string[];
  /** Pins that belong to a coil circuit, e.g. ['A1', 'A2']. Empty if none. */
  coilPins: string[];
  /** Internal pin-to-pin bridges, some of which depend on coil state / pressed state. */
  internalBridges: InternalBridge[];
}

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  power: {
    type: 'power',
    sourcePins: ['L1', 'L2', 'L3'],
    pins: ['L1', 'L2', 'L3'],
    coilPins: [],
    internalBridges: [],
  },
  motor: {
    type: 'motor',
    sourcePins: [],
    pins: ['U1', 'V1', 'W1'],
    coilPins: [],
    internalBridges: [],
  },
  pushButtonNO: {
    type: 'pushButtonNO',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      {
        pinA: 'IN',
        pinB: 'OUT',
        label: 'NO contact (IN-OUT)',
        isClosed: ({ pressed }) => pressed === true,
      },
    ],
  },
  pushButtonNC: {
    type: 'pushButtonNC',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      {
        pinA: 'IN',
        pinB: 'OUT',
        label: 'NC contact (IN-OUT)',
        isClosed: ({ pressed }) => pressed !== true,
      },
    ],
  },
  contactor: {
    type: 'contactor',
    sourcePins: [],
    pins: ['A1', 'A2', 'L1', 'L2', 'L3', 'T1', 'T2', 'T3', '13', '14', '21', '22'],
    coilPins: ['A1', 'A2'],
    internalBridges: [
      { pinA: 'L1', pinB: 'T1', label: 'Main pole 1 (L1-T1)', isClosed: ({ coilEnergized }) => coilEnergized },
      { pinA: 'L2', pinB: 'T2', label: 'Main pole 2 (L2-T2)', isClosed: ({ coilEnergized }) => coilEnergized },
      { pinA: 'L3', pinB: 'T3', label: 'Main pole 3 (L3-T3)', isClosed: ({ coilEnergized }) => coilEnergized },
      { pinA: '13', pinB: '14', label: 'Aux NO (13-14)', isClosed: ({ coilEnergized }) => coilEnergized },
      { pinA: '21', pinB: '22', label: 'Aux NC (21-22)', isClosed: ({ coilEnergized }) => !coilEnergized },
    ],
  },
  relay: {
    type: 'relay',
    sourcePins: [],
    pins: ['A1', 'A2', '13', '14', '21', '22'],
    coilPins: ['A1', 'A2'],
    internalBridges: [
      { pinA: '13', pinB: '14', label: 'NO contact (13-14)', isClosed: ({ coilEnergized }) => coilEnergized },
      { pinA: '21', pinB: '22', label: 'NC contact (21-22)', isClosed: ({ coilEnergized }) => !coilEnergized },
    ],
  },
  timer: {
    type: 'timer',
    sourcePins: [],
    pins: ['A1', 'A2', '15', '16', '17', '18'],
    coilPins: ['A1', 'A2'],
    internalBridges: [
      // On-delay (TON): NO closes once the delay has elapsed (steady-state assumption).
      { pinA: '15', pinB: '16', label: 'Delayed NO (15-16)', isClosed: ({ coilEnergized }) => coilEnergized },
      { pinA: '17', pinB: '18', label: 'Delayed NC (17-18)', isClosed: ({ coilEnergized }) => !coilEnergized },
    ],
  },
};
