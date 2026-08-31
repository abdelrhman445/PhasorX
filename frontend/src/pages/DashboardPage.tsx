import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { deleteCircuit, fetchMyCircuits } from '../api/circuits';
import { useAuthStore } from '../store/authStore';
import type { Circuit } from '../types';

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
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <AppBar position="static" color="primary">
        <Toolbar className="flex justify-between">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ⚡️ PhasorX
          </Typography>
          <div className="flex items-center gap-3">
            <Typography variant="body2">{user?.name}</Typography>
            <Button
              color="inherit"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              تسجيل الخروج
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            دوائري
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/workspace')}>
            دائرة جديدة
          </Button>
        </div>

        {loading && <Typography color="text.secondary">... جاري التحميل</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && circuits.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
            لا توجد دوائر محفوظة بعد. ابدأ بإنشاء دائرة جديدة.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {circuits.map((circuit) => (
            <div
              key={circuit._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {circuit.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(circuit.updatedAt).toLocaleString('ar-EG')}
                  </Typography>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {circuit.nodes.length} عنصر · {circuit.wires.length} توصيلة
                {circuit.isPublic && ' · 🌐 عامة'}
              </div>
              <div className="flex justify-end gap-1 mt-3">
                <IconButton size="small" color="primary" onClick={() => navigate(`/workspace/${circuit._id}`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(circuit._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
