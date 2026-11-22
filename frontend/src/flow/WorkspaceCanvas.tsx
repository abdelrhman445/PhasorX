import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from './nodes';
import { COMPONENT_LIBRARY, labelForComponentType } from './componentLibrary';
import type { ComponentType, ElectricalNodeData, SimulationResult } from '../types';
import { createCircuit, fetchCircuit, runSimulation, updateCircuit } from '../api/circuits';
import { BoltIcon, CloseIcon, ComponentsIcon } from '../components/icons';

let idCounter = 0;
const getId = () => `node_${Date.now()}_${idCounter++}`;

interface WorkspaceCanvasProps {
  circuitId?: string;
}

export default function WorkspaceCanvas({ circuitId }: WorkspaceCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node<ElectricalNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [title, setTitle] = useState('دائرة بدون عنوان');
  const [isPublic, setIsPublic] = useState(false);
  const [savedCircuitId, setSavedCircuitId] = useState<string | undefined>(circuitId);
  const [loading, setLoading] = useState(Boolean(circuitId));
  const [saving, setSaving] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const handleTogglePress = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, pressed: !n.data.pressed } } : n))
    );
  }, []);

  const handleChangeDelay = useCallback((nodeId: string, seconds: number) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, delaySeconds: seconds } } : n))
    );
  }, []);

  const buildNodeData = useCallback(
    (componentType: ComponentType, extra: Record<string, unknown> = {}): ElectricalNodeData => ({
      componentType,
      label: labelForComponentType(componentType),
      onTogglePress: handleTogglePress,
      onChangeDelay: handleChangeDelay,
      ...extra,
    }),
    [handleTogglePress, handleChangeDelay]
  );

  // Load an existing circuit for editing.
  useEffect(() => {
    if (!circuitId) return;
    let cancelled = false;
    fetchCircuit(circuitId)
      .then((circuit) => {
        if (cancelled) return;
        setTitle(circuit.title);
        setIsPublic(circuit.isPublic);
        setNodes(
          circuit.nodes.map((n) => ({
            id: n.nodeId,
            type: n.componentType,
            position: n.position,
            data: buildNodeData(n.componentType, n.data),
          }))
        );
        setEdges(
          circuit.wires.map((w) => ({
            id: w.wireId,
            source: w.sourceNodeId,
            sourceHandle: w.sourcePin,
            target: w.targetNodeId,
            targetHandle: w.targetPin,
            animated: true,
            style: { stroke: w.color || '#3b82f6', strokeWidth: 2 },
          }))
        );
      })
      .catch(() => setErrorMsg('تعذر تحميل الدائرة'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuitId]);

  const nodeTypesMemo = useMemo(() => nodeTypes, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
    []
  );

  const onDragStart = (event: DragEvent, componentType: ComponentType) => {
    event.dataTransfer.setData('application/reactflow/type', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const componentType = event.dataTransfer.getData('application/reactflow/type') as ComponentType;
      if (!componentType) return;

      const library = COMPONENT_LIBRARY.find((c) => c.componentType === componentType);
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const newNode: Node<ElectricalNodeData> = {
        id: getId(),
        type: componentType,
        position,
        data: buildNodeData(componentType, library?.defaultData ?? {}),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, buildNodeData]
  );

  const serializeForSave = () => ({
    title,
    isPublic,
    nodes: nodes.map((n) => ({
      nodeId: n.id,
      componentType: n.data.componentType,
      position: n.position,
      data: {
        label: n.data.label,
        pressed: n.data.pressed,
        delaySeconds: n.data.delaySeconds,
        value: n.data.value,
      },
    })),
    wires: edges.map((e) => ({
      wireId: e.id,
      sourceNodeId: e.source,
      sourcePin: e.sourceHandle || 'unknown',
      targetNodeId: e.target,
      targetPin: e.targetHandle || 'unknown',
      color: (e.style?.stroke as string) || '#000000',
    })),
  });

  const handleSaveCircuit = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = serializeForSave();
      if (savedCircuitId) {
        await updateCircuit(savedCircuitId, payload);
      } else {
        const created = await createCircuit(payload);
        setSavedCircuitId(created._id);
      }
    } catch {
      setErrorMsg('❌ خطأ في الحفظ، تأكد إن سيرفر الباك إند شغال');
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    setErrorMsg(null);
    try {
      const simNodes = nodes.map((n) => ({
        nodeId: n.id,
        type: n.data.componentType,
        data: { pressed: n.data.pressed, delaySeconds: n.data.delaySeconds, label: n.data.label },
      }));
      const simWires = edges.map((e) => ({
        wireId: e.id,
        sourceNodeId: e.source,
        sourcePin: e.sourceHandle || 'unknown',
        targetNodeId: e.target,
        targetPin: e.targetHandle || 'unknown',
      }));
      const result = await runSimulation(simNodes, simWires);
      setSimResult(result);
    } catch {
      setErrorMsg('❌ خطأ في تشغيل المحاكاة، تأكد إن سيرفر الباك إند شغال');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-3 text-sm text-slate-400" dir="rtl">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
        جاري تحميل الدائرة…
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full" dir="rtl">
      {/* زر فتح المكتبة على الموبايل */}
      <button
        className="btn-ghost absolute top-3 right-3 z-40 py-1.5! text-xs md:hidden"
        onClick={() => setPaletteOpen((o) => !o)}
      >
        {paletteOpen ? <CloseIcon className="h-3.5 w-3.5" /> : <ComponentsIcon className="h-3.5 w-3.5" />}
        العناصر
      </button>

      {paletteOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setPaletteOpen(false)} />
      )}

      {/* القائمة الجانبية */}
      <aside
        className={`palette-panel fixed inset-y-0 right-0 z-30 flex w-72 flex-col overflow-y-auto p-4 transition-transform duration-300 md:static md:z-auto md:translate-x-0 ${
          paletteOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center gap-2.5 border-b border-line pb-3">
          <span className="logo-badge h-8! w-8! rounded-lg!">
            <BoltIcon />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-white">مكتبة العناصر</h2>
            <p className="text-[10px] text-slate-500">اسحب أي عنصر إلى الكانفاس</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {COMPONENT_LIBRARY.map((item) => (
            <div
              key={item.componentType}
              onDragStart={(e) => onDragStart(e, item.componentType)}
              draggable
              className="palette-chip"
            >
              <span className="chip-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-line pt-4">
          <label className="field-label">
            اسم الدائرة
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="field" />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            دائرة عامة (يمكن لأي شخص رؤيتها)
          </label>
        </div>

        {errorMsg && <div className="alert-error mt-3 animate-fade-in">{errorMsg}</div>}

        <div className="mt-auto space-y-2 pt-4">
          <button onClick={handleSaveCircuit} disabled={saving} className="btn-primary w-full">
            {saving ? 'جاري الحفظ…' : '💾 حفظ الدائرة'}
          </button>
          <button onClick={handleRunSimulation} className="btn-sim w-full">
            ▶️ تشغيل المحاكاة
          </button>
        </div>
      </aside>

      {/* مساحة العمل */}
      <main className="relative h-full min-w-0 flex-1" dir="ltr" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypesMemo}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} color="#22304f" gap={20} size={1.4} />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>

        {/* نتائج المحاكاة */}
        {simResult && (
          <div dir="rtl" className="sim-panel absolute top-3 left-3 z-20 max-h-[80dvh] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-white">
                <BoltIcon className="h-4 w-4 text-accent" />
                نتيجة المحاكاة
              </h3>
              <button onClick={() => setSimResult(null)} className="icon-btn h-7! w-7!">
                <CloseIcon />
              </button>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-slate-400">{simResult.message}</p>

            {simResult.results.motors.length > 0 && (
              <div className="mb-3">
                <div className="mb-1.5 text-[11px] font-bold text-slate-300">الموتورات</div>
                <div className="space-y-1">
                  {simResult.results.motors.map((m) => (
                    <div key={m.nodeId} className={`sim-pill ${m.running ? 'on-green' : ''}`}>
                      {m.label}: {m.running ? '🟢 يعمل' : `⚪️ متوقف ${m.missingPhases.length ? '(ناقص: ' + m.missingPhases.join(', ') + ')' : ''}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {simResult.results.coils.length > 0 && (
              <div className="mb-3">
                <div className="mb-1.5 text-[11px] font-bold text-slate-300">الكونتاكتورات / الريلايات / التايمرات</div>
                <div className="space-y-1">
                  {simResult.results.coils.map((c) => (
                    <div key={c.nodeId} className={`sim-pill ${c.coilEnergized ? 'on-purple' : ''}`}>
                      {c.type}: {c.coilEnergized ? '🟣 ملف نشط' : '⚪️ ملف غير نشط'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {simResult.results.switches.length > 0 && (
              <div>
                <div className="mb-1.5 text-[11px] font-bold text-slate-300">أزرار الضغط</div>
                <div className="space-y-1">
                  {simResult.results.switches.map((s) => (
                    <div key={s.nodeId} className={`sim-pill ${s.closed ? 'on-green' : ''}`}>
                      {s.type}: {s.closed ? '🟢 موصل' : '⚪️ مفتوح'} {s.pressed ? '(مضغوط)' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
            }
