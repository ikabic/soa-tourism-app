import { api } from '../api/stakeholdersApi';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon, ICONS, Btn, ErrBanner } from '../components';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  if (user) {
    navigate(user.role === 'guide' ? '/my-tours' : user.role === 'admin' ? '/admin/users' : '/browse', { replace: true });
  }
}, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return setErr('Enter your username.');
    if (!password.trim()) return setErr('Enter your password.');
    setErr(null);
    setLoading(true);
    try {
      const { token } = await api.login(username.trim(), password);
      login(token);
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      navigate(payload.role === 'guide' ? '/my-tours' : payload.role === 'admin' ? '/admin/users' : '/browse', { replace: true });
    } catch (e) {
      setErr(e.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32 }}>
      <div className="card fade-up" style={{ width: 420, padding: 36 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="leaf" style={{
              width: 40, height: 40, borderRadius: 8,
              background: 'var(--sage-soft)', display: 'grid', placeItems: 'center',
              border: '1px solid var(--sage-line)', fontSize: 20, lineHeight: 1,
            }}>✈</span>
          </div>
          <h1 style={{ fontSize: 32, marginTop: 4 }}>Welcome back</h1>
          <p className="muted" style={{ fontSize: 14, textAlign: 'center' }}>
            Sign in to plan, share, and join walking tours.
          </p>
          <span className="hand" style={{ marginTop: -2 }}>since 2026</span>
        </div>

        <form className="col gap-12" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Username</label>
            <input className="input" value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username" />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" />
          </div>

          {err && <ErrBanner onClose={() => setErr(null)}>{err}</ErrBanner>}

          <Btn type="submit" variant="primary" size="lg" iconRight="arrow"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Btn>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-faint)', marginTop: 6 }}>
            New here? <Link to="/register"> Create an account </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
