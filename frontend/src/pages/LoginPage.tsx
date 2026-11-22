import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { BoltIcon, CircuitIcon, PlayIcon, SaveIcon } from '../components/icons';
import WaveBackground from '../components/WaveBackground';

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
    <div className="auth-screen bg-blueprint">
      <div className="auth-glow" aria-hidden="true" />
      <WaveBackground />

      <div className="auth-card glass animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="logo-badge animate-float">
            <BoltIcon />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Phasor<span className="text-accent">X</span></h1>
            <p className="text-xs text-slate-400">محاكي دوائر التحكم الكلاسيك</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-400">
          سجّل الدخول للوصول إلى دوائرك المحفوظة ومتابعة المحاكاة.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && <div className="alert-error animate-fade-in">{error}</div>}

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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
            {loading ? 'جاري الدخول…' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="link-accent">
            أنشئ حسابًا جديدًا
          </Link>
        </p>

        <div className="auth-feats">
          <span className="feat"><CircuitIcon /> كانفاس تفاعلي</span>
          <span className="feat"><PlayIcon /> محاكاة لحظية</span>
          <span className="feat"><SaveIcon /> حفظ سحابي</span>
        </div>
      </div>

      <p className="auth-foot">PhasorX — منصة تصميم ومحاكاة دوائر التحكم الكهربائية</p>
    </div>
  );
}
