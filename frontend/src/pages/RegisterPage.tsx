import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Paper, TextField, Typography } from '@mui/material';
import { registerRequest } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerRequest(name, email, password);
      setAuth(res.token, res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'فشل إنشاء الحساب'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen w-full flex items-center justify-center bg-gray-100 px-4">
      <Paper elevation={3} className="w-full max-w-sm p-8">
        <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary" gutterBottom>
          ⚡️ PhasorX
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          أنشئ حساب مهندس جديد
        </Typography>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="كلمة المرور"
            type="password"
            helperText="6 أحرف على الأقل"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? '... جاري الإنشاء' : 'إنشاء الحساب'}
          </Button>
        </form>

        <Typography variant="body2" className="mt-4 text-center">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-blue-600 font-semibold">
            سجّل الدخول
          </Link>
        </Typography>
      </Paper>
    </div>
  );
}
