import {
  COMPONENT_DEFINITIONS,
  ComponentType,
  SimNodeInput,
  SimWireInput,
} from './componentDefinitions';

// A pin is uniquely identified as "<nodeId>::<pin>"
type PinKey = string;
const pinKey = (nodeId: string, pin: string): PinKey => `${nodeId}::${pin}`;

/** Simple union-find used to compute connected components of the pin graph. */
class UnionFind {
  private parent = new Map<PinKey, PinKey>();

  find(x: PinKey): PinKey {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    // path compression
    let cur = x;
    while (this.parent.get(cur) !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: PinKey, b: PinKey): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

export interface MotorResult {
  nodeId: string;
  label: string;
  running: boolean;
  energizedPins: { U1: boolean; V1: boolean; W1: boolean };
  missingPhases: string[];
}

export interface CoilResult {
  nodeId: string;
  type: ComponentType;
  coilEnergized: boolean;
  contacts: { label: string; pinA: string; pinB: string; closed: boolean }[];
}

export interface SwitchResult {
  nodeId: string;
  type: ComponentType;
  pressed: boolean;
  closed: boolean;
}

export interface SimulationResult {
  status: 'success';
  message: string;
  results: {
    energizedPinCount: number;
    iterationsToConverge: number;
    motors: MotorResult[];
    coils: CoilResult[]; // contactors, relays, timers
    switches: SwitchResult[]; // push buttons
    nodesStatus: { nodeId: string; state: string }[];
  };
}

const MAX_ITERATIONS = 25;

export class SimulationService {
  /**
   * Traces the circuit graph to a steady-state and reports, per component,
   * whether it is energized / closed / running.
   *
   * This is a fixed-point relaxation: contactor/relay/timer contacts depend
   * on their own coil's energization, which in turn depends on the very
   * graph those contacts help form (classic ladder-logic feedback). We
   * recompute connectivity and coil states repeatedly until nothing changes.
   */
  static analyzeCircuitGraph(rawNodes: SimNodeInput[], rawWires: SimWireInput[]): SimulationResult {
    const nodes = (rawNodes || []).filter((n) => n && n.nodeId && COMPONENT_DEFINITIONS[n.type]);
    const wires = rawWires || [];

    let coilEnergized: Record<string, boolean> = {};
    for (const n of nodes) {
      const def = COMPONENT_DEFINITIONS[n.type];
      if (def.coilPins.length > 0) coilEnergized[n.nodeId] = false;
    }

    let energizedPins = new Set<PinKey>();
    let iterations = 0;
    let stable = false;

    while (!stable && iterations < MAX_ITERATIONS) {
      iterations++;
      const uf = new UnionFind();

      // 1) Static wires always conduct.
      for (const w of wires) {
        uf.union(pinKey(w.sourceNodeId, w.sourcePin), pinKey(w.targetNodeId, w.targetPin));
      }

      // 2) Internal bridges conduct depending on current pressed/coil state.
      for (const n of nodes) {
        const def = COMPONENT_DEFINITIONS[n.type];
        for (const bridge of def.internalBridges) {
          const closed = bridge.isClosed({
            pressed: n.data?.pressed,
            coilEnergized: coilEnergized[n.nodeId] === true,
          });
          if (closed) {
            uf.union(pinKey(n.nodeId, bridge.pinA), pinKey(n.nodeId, bridge.pinB));
          }
        }
      }

      // 3) Flood energization out from every source pin (power supplies).
      const newEnergized = new Set<PinKey>();
      const sourceRoots = new Set<PinKey>();
      for (const n of nodes) {
        const def = COMPONENT_DEFINITIONS[n.type];
        for (const pin of def.sourcePins) {
          sourceRoots.add(uf.find(pinKey(n.nodeId, pin)));
        }
      }
      // Any pin belonging to a source's connected component is energized.
      const allPins: PinKey[] = [];
      for (const n of nodes) {
        for (const pin of COMPONENT_DEFINITIONS[n.type].pins) allPins.push(pinKey(n.nodeId, pin));
      }
      for (const p of allPins) {
        if (sourceRoots.has(uf.find(p))) newEnergized.add(p);
      }

      // 4) Recompute coil energization: A1 reachable from a source.
      const newCoilEnergized: Record<string, boolean> = {};
      for (const n of nodes) {
        const def = COMPONENT_DEFINITIONS[n.type];
        if (def.coilPins.length === 0) continue;
        const a1 = def.coilPins[0];
        newCoilEnergized[n.nodeId] = newEnergized.has(pinKey(n.nodeId, a1));
      }

      // 5) Check for convergence.
      stable =
        setsEqual(energizedPins, newEnergized) &&
        recordsEqual(coilEnergized, newCoilEnergized);

      energizedPins = newEnergized;
      coilEnergized = newCoilEnergized;
    }

    // ---- Build the human-readable result from the converged state ----
    const motors: MotorResult[] = [];
    const coils: CoilResult[] = [];
    const switches: SwitchResult[] = [];
    const nodesStatus: { nodeId: string; state: string }[] = [];

    for (const n of nodes) {
      const def = COMPONENT_DEFINITIONS[n.type];

      if (n.type === 'motor') {
        const U1 = energizedPins.has(pinKey(n.nodeId, 'U1'));
        const V1 = energizedPins.has(pinKey(n.nodeId, 'V1'));
        const W1 = energizedPins.has(pinKey(n.nodeId, 'W1'));
        const running = U1 && V1 && W1;
        const missingPhases = (['U1', 'V1', 'W1'] as const).filter(
          (p) => !energizedPins.has(pinKey(n.nodeId, p))
        );
        motors.push({
          nodeId: n.nodeId,
          label: n.data?.label || 'Motor',
          running,
          energizedPins: { U1, V1, W1 },
          missingPhases,
        });
        nodesStatus.push({ nodeId: n.nodeId, state: running ? 'running' : 'stopped' });
        continue;
      }

      if (
        n.type === 'pushButtonNO' ||
        n.type === 'pushButtonNC' ||
        n.type === 'emergencyStop' ||
        n.type === 'limitSwitchNO' ||
        n.type === 'limitSwitchNC' ||
        n.type === 'isolatorSwitch' ||
        n.type === 'circuitBreaker' ||
        n.type === 'fuse' ||
        n.type === 'overloadRelay'
      ) {
        const bridge = def.internalBridges[0];
        const closed = bridge.isClosed({ pressed: n.data?.pressed, coilEnergized: false });
        switches.push({ nodeId: n.nodeId, type: n.type, pressed: n.data?.pressed === true, closed });
        nodesStatus.push({ nodeId: n.nodeId, state: closed ? 'closed' : 'open' });
        continue;
      }

      if (n.type === 'selectorSwitch') {
        const position2 = n.data?.pressed === true;
        nodesStatus.push({ nodeId: n.nodeId, state: position2 ? 'position-2 (OUT2)' : 'position-1 (OUT1)' });
        continue;
      }

      if (n.type === 'contactor' || n.type === 'relay' || n.type === 'timer') {
        const energized = coilEnergized[n.nodeId] === true;
        const contacts = def.internalBridges
          .filter((b) => b.pinA !== def.coilPins[0]) // exclude the coil pair itself
          .map((b) => ({
            label: b.label,
            pinA: b.pinA,
            pinB: b.pinB,
            closed: b.isClosed({ coilEnergized: energized }),
          }));
        coils.push({ nodeId: n.nodeId, type: n.type, coilEnergized: energized, contacts });
        nodesStatus.push({ nodeId: n.nodeId, state: energized ? 'energized' : 'de-energized' });
        continue;
      }

      if (n.type === 'power') {
        nodesStatus.push({ nodeId: n.nodeId, state: 'energized' });
        continue;
      }

      // Generic fallback: basic passives (resistor/capacitor/inductor — always-conducting
      // pass-throughs), the pilot lamp (a load with no bridge), and the terminal block
      // (an always-bonded bus). None of these need bespoke result shapes — just report
      // whether they're currently live.
      const anyPinEnergized = def.pins.some((p) => energizedPins.has(pinKey(n.nodeId, p)));
      nodesStatus.push({ nodeId: n.nodeId, state: anyPinEnergized ? 'energized' : 'idle' });
    }

    const runningMotors = motors.filter((m) => m.running).length;
    const message =
      motors.length === 0
        ? 'تم تحليل الدائرة بنجاح'
        : runningMotors > 0
        ? `تم تحليل الدائرة: ${runningMotors} من ${motors.length} موتور يعمل`
        : 'تم تحليل الدائرة: لا يوجد موتور يعمل حالياً';

    return {
      status: 'success',
      message,
      results: {
        energizedPinCount: energizedPins.size,
        iterationsToConverge: iterations,
        motors,
        coils,
        switches,
        nodesStatus,
      },
    };
  }
}

function setsEqual(a: Set<PinKey>, b: Set<PinKey>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function recordsEqual(a: Record<string, boolean>, b: Record<string, boolean>): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}
