import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { BoltIcon } from '../components/icons';

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
    <div className="auth-screen bg-blueprint">
      <div className="auth-glow" aria-hidden="true" />

      <div className="auth-card glass animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="logo-badge animate-float">
            <BoltIcon />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">PhasorX</h1>
            <p className="text-xs text-slate-400">محاكي دوائر التحكم الكلاسيك</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-400">
          أنشئ حسابك وابدأ بتصميم دوائر التحكم ومحاكاتها في دقائق.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && <div className="alert-error animate-fade-in">{error}</div>}

          <label className="field-label">
            الاسم
            <input
              className="field"
              value={name}
              placeholder="اسم المهندس"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="field-label">
            البريد الإلكتروني
            <input
              className="field"
              dir="ltr"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field-label">
            كلمة المرور
            <input
              className="field"
              dir="ltr"
              type="password"
              placeholder="6 أحرف على الأقل"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
            {loading ? 'جاري الإنشاء…' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="link-accent">
            سجّل الدخول
          </Link>
        </p>
      </div>

      <p className="auth-foot">PhasorX — منصة تصميم ومحاكاة دوائر التحكم الكهربائية</p>
    </div>
  );
        }
