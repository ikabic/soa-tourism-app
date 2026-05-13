import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Btn, ErrBanner } from '../components';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tourist');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  if (user) {
    navigate(user.role === 'guide' ? '/my-tours' : '/browse', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim()) return setErr('Enter your username.');
    if (!email.trim()) return setErr('Enter your email.');
    if (!password.trim()) return setErr('Enter your password.');

    setErr(null);
    setLoading(true);

    try {
      await api.register({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });

      const { token } = await api.login(username.trim(), password);

      login(token);

      navigate(role === 'guide' ? '/my-tours' : '/browse', {
        replace: true,
      });
    } catch (e) {
      setErr(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32 }}>
      <div className="card fade-up" style={{ width: 420, padding: 36 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="leaf"
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: 'var(--sage-soft)',
                display: 'grid',
                placeItems: 'center',
                border: '1px solid var(--sage-line)',
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ✈
            </span>
          </div>

          <h1 style={{ fontSize: 32, marginTop: 4 }}>
            Create account
          </h1>

          <p className="muted" style={{ fontSize: 14, textAlign: 'center' }}>
            Join Wayfare and start exploring walking tours.
          </p>

          <span className="hand" style={{ marginTop: -2 }}>
            since 2026
          </span>
        </div>

        <form className="col gap-12" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">Role</label>

            <select
              className="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="tourist">Tourist</option>
              <option value="guide">Guide</option>
            </select>
          </div>

          {err && (
            <ErrBanner onClose={() => setErr(null)}>
              {err}
            </ErrBanner>
          )}

          <Btn
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Btn>

          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--ink-faint)',
              marginTop: 6,
            }}
          >
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}