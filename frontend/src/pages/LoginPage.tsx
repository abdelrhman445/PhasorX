import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Paper, TextField, Typography } from '@mui/material';
import { loginRequest } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginRequest(email, password);
      setAuth(res.token, res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'فشل تسجيل الدخول، تأكد من البيانات'));
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
          سجّل الدخول للوصول إلى دوائرك
        </Typography>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && <Alert severity="error">{error}</Alert>}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? '... جاري الدخول' : 'تسجيل الدخول'}
          </Button>
        </form>

        <Typography variant="body2" className="mt-4 text-center">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-blue-600 font-semibold">
            أنشئ حساب جديد
          </Link>
        </Typography>
      </Paper>
    </div>
  );
}
