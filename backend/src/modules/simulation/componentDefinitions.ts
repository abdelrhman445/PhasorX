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
// - resistor / capacitor / inductor: this engine reasons about
//   topology and energization (a node is "live" or it isn't), not
//   about impedance, phasors, or voltage/current magnitudes. These
//   three are therefore modeled as always-conducting pass-throughs
//   so they can sit in series in a rung without breaking continuity,
//   and their value (Ω / F / H) is carried purely as a label for the
//   diagram. Real AC impedance analysis is a different, much larger
//   engine and is intentionally not claimed here.

export type ComponentType =
  | 'power'
  | 'motor'
  | 'pushButtonNO'
  | 'pushButtonNC'
  | 'contactor'
  | 'relay'
  | 'timer'
  // ---- protective / manual switching gear (toggle: data.pressed === true => OPEN) ----
  | 'isolatorSwitch'
  | 'circuitBreaker'
  | 'fuse'
  | 'overloadRelay'
  // ---- mechanically actuated switches (momentary: reuse pushButton bridge semantics) ----
  | 'emergencyStop'
  | 'limitSwitchNO'
  | 'limitSwitchNC'
  // ---- selector ----
  | 'selectorSwitch'
  // ---- basic passive components (modeled as always-conducting pass-throughs; see note below) ----
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  // ---- indicator / bus ----
  | 'pilotLamp'
  | 'terminalBlock';

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

  // ==========================================================
  // Protective / manual switching gear.
  // All four share the same shape: normally CLOSED (conducting),
  // and `data.pressed === true` flips them OPEN — i.e. "pressed"
  // here means "switched off / tripped / blown", reusing the same
  // pressed/onTogglePress plumbing the UI already has for buttons.
  // ==========================================================
  isolatorSwitch: {
    type: 'isolatorSwitch',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      { pinA: 'IN', pinB: 'OUT', label: 'Isolator (IN-OUT)', isClosed: ({ pressed }) => pressed !== true },
    ],
  },
  circuitBreaker: {
    type: 'circuitBreaker',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      { pinA: 'IN', pinB: 'OUT', label: 'MCB (IN-OUT)', isClosed: ({ pressed }) => pressed !== true },
    ],
  },
  fuse: {
    type: 'fuse',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      { pinA: 'IN', pinB: 'OUT', label: 'Fuse (IN-OUT)', isClosed: ({ pressed }) => pressed !== true },
    ],
  },
  overloadRelay: {
    type: 'overloadRelay',
    sourcePins: [],
    pins: ['95', '96'],
    coilPins: [],
    internalBridges: [
      { pinA: '95', pinB: '96', label: 'Thermal OL NC (95-96)', isClosed: ({ pressed }) => pressed !== true },
    ],
  },

  // ==========================================================
  // Mechanically actuated switches — identical bridge semantics
  // to pushButtonNO/NC, kept as distinct types for correct
  // labeling/iconography in the diagram.
  // ==========================================================
  emergencyStop: {
    type: 'emergencyStop',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      { pinA: 'IN', pinB: 'OUT', label: 'E-STOP NC (IN-OUT)', isClosed: ({ pressed }) => pressed !== true },
    ],
  },
  limitSwitchNO: {
    type: 'limitSwitchNO',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      { pinA: 'IN', pinB: 'OUT', label: 'Limit switch NO (IN-OUT)', isClosed: ({ pressed }) => pressed === true },
    ],
  },
  limitSwitchNC: {
    type: 'limitSwitchNC',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [
      { pinA: 'IN', pinB: 'OUT', label: 'Limit switch NC (IN-OUT)', isClosed: ({ pressed }) => pressed !== true },
    ],
  },

  // 2-position selector: pressed === false -> COM routed to OUT1, pressed === true -> COM routed to OUT2.
  selectorSwitch: {
    type: 'selectorSwitch',
    sourcePins: [],
    pins: ['COM', 'OUT1', 'OUT2'],
    coilPins: [],
    internalBridges: [
      { pinA: 'COM', pinB: 'OUT1', label: 'Position 1 (COM-OUT1)', isClosed: ({ pressed }) => pressed !== true },
      { pinA: 'COM', pinB: 'OUT2', label: 'Position 2 (COM-OUT2)', isClosed: ({ pressed }) => pressed === true },
    ],
  },

  // ==========================================================
  // Basic passives — always-conducting pass-throughs (see note above).
  // ==========================================================
  resistor: {
    type: 'resistor',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [{ pinA: 'IN', pinB: 'OUT', label: 'Resistor (IN-OUT)', isClosed: () => true }],
  },
  capacitor: {
    type: 'capacitor',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [{ pinA: 'IN', pinB: 'OUT', label: 'Capacitor (IN-OUT)', isClosed: () => true }],
  },
  inductor: {
    type: 'inductor',
    sourcePins: [],
    pins: ['IN', 'OUT'],
    coilPins: [],
    internalBridges: [{ pinA: 'IN', pinB: 'OUT', label: 'Inductor (IN-OUT)', isClosed: () => true }],
  },

  // Indicator lamp: a load, not a bridge — just reports whether its single pin is live.
  pilotLamp: {
    type: 'pilotLamp',
    sourcePins: [],
    pins: ['L'],
    coilPins: [],
    internalBridges: [],
  },

  // Terminal block / busbar: N pins permanently bonded together.
  terminalBlock: {
    type: 'terminalBlock',
    sourcePins: [],
    pins: ['T1', 'T2', 'T3', 'T4'],
    coilPins: [],
    internalBridges: [
      { pinA: 'T1', pinB: 'T2', label: 'Bus (T1-T2)', isClosed: () => true },
      { pinA: 'T1', pinB: 'T3', label: 'Bus (T1-T3)', isClosed: () => true },
      { pinA: 'T1', pinB: 'T4', label: 'Bus (T1-T4)', isClosed: () => true },
    ],
  },
};
