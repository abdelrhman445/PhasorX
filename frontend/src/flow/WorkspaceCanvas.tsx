import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import ReactFlow, {
  addEdge,
  Background,
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
    return <div className="flex h-full w-full items-center justify-center text-gray-500">...جاري التحميل</div>;
  }

  return (
    <div className="flex h-full w-full bg-gray-50" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-72 bg-white border-l border-gray-200 p-5 shadow-lg flex flex-col z-10 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-800 border-b pb-2">مكتبة العناصر</h2>

        <div className="space-y-2 mb-4">
          {COMPONENT_LIBRARY.map((item) => (
            <div
              key={item.componentType}
              onDragStart={(e) => onDragStart(e, item.componentType)}
              draggable
              className="p-2.5 bg-gray-50 rounded cursor-grab border border-gray-300 hover:bg-blue-50 transition shadow-sm text-center text-sm font-medium"
            >
              {item.icon} {item.label}
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-600">اسم الدائرة</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            دائرة عامة (يمكن لأي شخص رؤيتها)
          </label>
        </div>

        {errorMsg && <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{errorMsg}</div>}

        <div className="mt-auto pt-4 space-y-2">
          <button
            onClick={handleSaveCircuit}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60"
          >
            {saving ? '... جاري الحفظ' : '💾 حفظ الدائرة'}
          </button>
          <button
            onClick={handleRunSimulation}
            className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition shadow-md"
          >
            ▶️ تشغيل المحاكاة
          </button>
        </div>
      </aside>

      {/* مساحة العمل */}
      <main className="flex-1 h-full relative" dir="ltr" ref={reactFlowWrapper}>
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
          <Background color="#ccc" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </main>

      {/* نتائج المحاكاة */}
      {simResult && (
        <div dir="rtl" className="absolute top-4 left-4 w-80 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-20 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-gray-800">⚡️ نتيجة المحاكاة</h3>
            <button onClick={() => setSimResult(null)} className="text-gray-400 hover:text-gray-700 text-sm">
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">{simResult.message}</p>

          {simResult.results.motors.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">الموتورات</div>
              {simResult.results.motors.map((m) => (
                <div key={m.nodeId} className={`text-xs rounded p-2 mb-1 ${m.running ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                  {m.label}: {m.running ? '🟢 يعمل' : `⚪️ متوقف ${m.missingPhases.length ? '(ناقص: ' + m.missingPhases.join(', ') + ')' : ''}`}
                </div>
              ))}
            </div>
          )}

          {simResult.results.coils.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">الكونتاكتورات / الريلايات / التايمرات</div>
              {simResult.results.coils.map((c) => (
                <div key={c.nodeId} className={`text-xs rounded p-2 mb-1 ${c.coilEnergized ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'}`}>
                  {c.type}: {c.coilEnergized ? '🟣 ملف نشط' : '⚪️ ملف غير نشط'}
                </div>
              ))}
            </div>
          )}

          {simResult.results.switches.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">أزرار الضغط</div>
              {simResult.results.switches.map((s) => (
                <div key={s.nodeId} className="text-xs rounded p-2 mb-1 bg-gray-50 text-gray-600">
                  {s.type}: {s.closed ? '🟢 موصل' : '⚪️ مفتوح'} {s.pressed ? '(مضغوط)' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
