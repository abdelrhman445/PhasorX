import { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import axios from 'axios';
import 'reactflow/dist/style.css';

// ==========================================
// 1. تصميم العناصر الكهربية (Custom Nodes)
// ==========================================
const ElectricalNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-white border-2 border-gray-800 rounded shadow-md p-3 text-center min-w-[120px] relative">
      <div className="font-bold text-sm text-gray-800">{data.label}</div>
      
      {/* أطراف مصدر الطاقة (3-Phase) بتخرج من اليمين */}
      {data.type === 'power' && (
        <>
          <Handle type="source" position={Position.Right} id="L1" style={{ top: '25%', background: '#ef4444' }} />
          <Handle type="source" position={Position.Right} id="L2" style={{ top: '50%', background: '#eab308' }} />
          <Handle type="source" position={Position.Right} id="L3" style={{ top: '75%', background: '#3b82f6' }} />
          <div className="absolute right-[-20px] top-[15%] text-[10px] font-bold">L1</div>
          <div className="absolute right-[-20px] top-[40%] text-[10px] font-bold">L2</div>
          <div className="absolute right-[-20px] top-[65%] text-[10px] font-bold">L3</div>
        </>
      )}

      {/* أطراف الموتور بتدخل من الشمال */}
      {data.type === 'motor' && (
        <>
          <Handle type="target" position={Position.Left} id="U1" style={{ top: '25%', background: '#ef4444' }} />
          <Handle type="target" position={Position.Left} id="V1" style={{ top: '50%', background: '#eab308' }} />
          <Handle type="target" position={Position.Left} id="W1" style={{ top: '75%', background: '#3b82f6' }} />
          <div className="absolute left-[-22px] top-[15%] text-[10px] font-bold">U1</div>
          <div className="absolute left-[-22px] top-[40%] text-[10px] font-bold">V1</div>
          <div className="absolute left-[-22px] top-[65%] text-[10px] font-bold">W1</div>
        </>
      )}
    </div>
  );
};

// ==========================================
// 2. مساحة العمل الأساسية
// ==========================================
let id = 0;
const getId = () => `node_${id++}`;

const Workspace = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { screenToFlowPosition } = useReactFlow();

  // حل تحذير React Flow باستخدام useMemo لمنع إعادة التعريف
  const nodeTypes = useMemo(() => ({ electrical: ElectricalNode }), []);

  // تحديثات الحركة والتوصيل
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)), []);

  // بداية السحب من القائمة الجانبية
  const onDragStart = (event: any, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', nodeLabel);
    event.dataTransfer.effectAllowed = 'move';
  };

  // الإفلات في مساحة العمل
  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (!type) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      
      const newNode: Node = {
        id: getId(),
        type: 'electrical',
        position,
        data: { label, type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition]
  );

  // ==========================================
  // 3. الربط مع الباك إند (API Integration)
  // ==========================================
  
  // التوكن الخاص بك تم وضعه هنا بنجاح
  const USER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOTRmYWU2Y2Y4NDRjMGQ0NmFlY2Y3ZCIsInJvbGUiOiJlbmdpbmVlciIsImlhdCI6MTc4ODE0ODQ1NCwiZXhwIjoxNzkwNzQwNDU0fQ.EEaEQhJ6BcLFri-USUs4FV4Kn7HdXnyqljT5OAV6IHU"; 
  
const handleSaveCircuit = async () => {
    try {
      const payload = {
        title: "دائرة تجريبية من الواجهة",
        ownerId: "6a94f5bcf22498248b80d772", // الـ ID الخاص بك
        isPublic: true,
        // 🔴 التعديل هنا: بنفلتر الداتا عشان تناسب الـ Schema بتاعت الموديل في الباك إند
        nodes: nodes.map(node => ({
          nodeId: node.id,
          // استخدمنا الـ ID بتاع الموتور اللي عملناه في بوستمان كـ ID افتراضي مؤقتاً
          componentId: "6a94f619f22498248b80d773", 
          position: node.position,
          paramsOverride: {}
        })),
        wires: edges.map(edge => ({
          wireId: edge.id,
          sourceNodeId: edge.source,
          sourcePin: edge.sourceHandle || "unknown",
          targetNodeId: edge.target,
          targetPin: edge.targetHandle || "unknown",
        }))
      };

      await axios.post('http://localhost:5000/api/circuits', payload, {
        headers: { Authorization: `Bearer ${USER_TOKEN}` }
      });
      
      alert('✅ تم حفظ الدائرة بنجاح في قاعدة البيانات!');
    } catch (error) {
      console.error(error);
      alert('❌ خطأ في الحفظ، تأكد إن سيرفر الباك إند شغال!');
    }
  };

  const handleRunSimulation = async () => {
    try {
      // 🔴 فلترة مشابهة عشان المحاكي ميستقبلش داتا زيادة
      const payload = {
        nodes: nodes.map(n => ({ nodeId: n.id, type: n.data.type })),
        wires: edges
      };

      const res = await axios.post('http://localhost:5000/api/simulation/run', payload, {
        headers: { Authorization: `Bearer ${USER_TOKEN}` }
      });
      alert(`⚡️ نتيجة المحاكاة: ${res.data.data.message}`);
    } catch (error) {
      console.error(error);
      alert('❌ خطأ في تشغيل المحاكاة، تأكد إن سيرفر الباك إند شغال');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-72 bg-white border-l border-gray-200 p-5 shadow-lg flex flex-col z-10">
        <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-2">مكتبة العناصر</h2>
        
        <div className="space-y-3">
          <div 
            onDragStart={(e) => onDragStart(e, 'power', '⚡️ مصدر طاقة (3-Phase)')} 
            draggable 
            className="p-3 bg-gray-50 rounded cursor-grab border border-gray-300 hover:bg-blue-50 transition shadow-sm text-center font-medium"
          >
            ⚡️ مصدر طاقة (3-Phase)
          </div>
          <div 
            onDragStart={(e) => onDragStart(e, 'motor', '⚙️ موتور حثي')} 
            draggable 
            className="p-3 bg-gray-50 rounded cursor-grab border border-gray-300 hover:bg-blue-50 transition shadow-sm text-center font-medium"
          >
            ⚙️ موتور حثي
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="mt-auto space-y-2">
          <button onClick={handleSaveCircuit} className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition shadow-md">
            💾 حفظ الدائرة
          </button>
          <button onClick={handleRunSimulation} className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition shadow-md">
            ▶️ تشغيل المحاكاة
          </button>
        </div>
      </aside>

      {/* مساحة العمل */}
      <main className="flex-1 h-full relative" dir="ltr" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
    </div>
  );
};

// ==========================================
// التغليف بالـ Provider
// ==========================================
export default function App() {
  return (
    <ReactFlowProvider>
      <Workspace />
    </ReactFlowProvider>
  );
}