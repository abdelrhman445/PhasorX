import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCircuit, fetchMyCircuits } from '../api/circuits';
import { useAuthStore } from '../store/authStore';
import type { Circuit } from '../types';
import { BoltIcon, CircuitIcon, LogoutIcon, PencilIcon, PlusIcon, TrashIcon } from '../components/icons';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCircuits = () => {
    fetchMyCircuits()
      .then(setCircuits)
      .catch(() => setError('تعذر تحميل الدوائر'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCircuits();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدائرة؟')) return;
    try {
      await deleteCircuit(id);
      setCircuits((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError('تعذر حذف الدائرة');
    }
  };

  return (
    <div className="min-h-dvh bg-blueprint">
      <header className="dash-top">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="logo-badge h-9! w-9! rounded-lg!">
              <BoltIcon />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">PhasorX</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden max-w-40 truncate rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs font-semibold text-slate-300 sm:block">
              {user?.name}
            </span>
            <button
              className="btn-ghost py-1.5! text-xs"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogoutIcon className="h-3.5 w-3.5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-up">
          <div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">دوائري</h2>
            <p className="mt-1 text-sm text-slate-400">
              {loading ? 'جاري التحميل…' : circuits.length === 0 ? 'لا توجد دوائر بعد' : `${circuits.length} دائرة محفوظة`}
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/workspace')}>
            <PlusIcon className="h-4 w-4" />
            دائرة جديدة
          </button>
        </div>

        {error && <div className="alert-error mb-6 animate-fade-in">{error}</div>}

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}

        {!loading && circuits.length === 0 && !error && (
          <button
            onClick={() => navigate('/workspace')}
            className="group flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center transition hover:border-accent/60 animate-fade-up"
          >
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-panel text-accent transition group-hover:scale-105">
              <CircuitIcon className="h-8 w-8" />
            </span>
            <span>
              <span className="block text-lg font-bold text-white">ابدأ أول دائرة لك</span>
              <span className="mt-1 block text-sm text-slate-400">
                اسحب العناصر إلى الكانفاس، وصّلها، وشغّل المحاكاة.
              </span>
            </span>
            <span className="btn-primary py-2! text-sm">
              <PlusIcon className="h-4 w-4" />
              دائرة جديدة
            </span>
          </button>
        )}

        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {circuits.map((circuit) => (
            <div key={circuit._id} className="circuit-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-white">{circuit.title}</h3>
                {circuit.isPublic && (
                  <span className="shrink-0 rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-[10px] font-bold text-mint">
                    عامة
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                آخر تعديل: {new Date(circuit.updatedAt).toLocaleString('ar-EG')}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span className="rounded-md border border-line bg-ink/60 px-2 py-1">{circuit.nodes.length} عنصر</span>
                <span className="rounded-md border border-line bg-ink/60 px-2 py-1">{circuit.wires.length} توصيلة</span>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
                <button className="icon-btn" title="تعديل" onClick={() => navigate(`/workspace/${circuit._id}`)}>
                  <PencilIcon />
                </button>
                <button className="icon-btn danger" title="حذف" onClick={() => handleDelete(circuit._id)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
