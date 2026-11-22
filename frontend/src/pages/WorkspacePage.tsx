import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import WorkspaceCanvas from '../flow/WorkspaceCanvas';
import { ArrowBackIcon, BoltIcon } from '../components/icons';

export default function WorkspacePage() {
  const { circuitId } = useParams<{ circuitId?: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex h-dvh w-full flex-col bg-ink">
      <header className="topbar-line z-20 flex items-center justify-between gap-3 border-b border-line bg-panel/80 px-3 py-2 backdrop-blur sm:px-4">
        <button className="btn-ghost py-1.5! text-xs" onClick={() => navigate('/dashboard')}>
          <ArrowBackIcon className="h-3.5 w-3.5" />
          لوحة التحكم
        </button>
        <div className="flex items-center gap-2">
          <span className="logo-badge h-7! w-7! rounded-md!">
            <BoltIcon />
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-white">
            Phasor<span className="text-accent">X</span>{' '}
            <span className="hidden font-sans font-semibold text-slate-400 sm:inline">— مساحة العمل</span>
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <ReactFlowProvider>
          <WorkspaceCanvas circuitId={circuitId} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
