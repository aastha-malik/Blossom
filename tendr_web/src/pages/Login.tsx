import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { API_URL } from '../utils/constants';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--rule)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
  marginBottom: 6,
};

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setAuthData, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !searchParams.get('token')) {
      navigate('/today');
    }
  }, [isAuthenticated, navigate, searchParams]);

  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    if (token) {
      setAuthData(token, username || 'User', email || '');
      showToast('Successfully logged in with Google.', 'success');
      setTimeout(() => navigate('/today'), 500);
    }
  }, [searchParams, setAuthData, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ username: usernameOrEmail, password });
      showToast('Welcome back.', 'success');
      navigate('/today');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google/login`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--rule)', padding: 32 }}>

          {/* Eyebrow */}
          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            RETURNING
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontStyle: 'italic', fontWeight: 400, color: 'var(--ink)', margin: '0 0 6px' }}>
            Welcome back.
          </h1>
          <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 28 }}>
            your pet missed you.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Username or Email</label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={e => setUsernameOrEmail(e.target.value)}
                placeholder="username or your@email.com"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                required
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="your password"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                required
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: 22 }}>
              <Link to="/forgot-password" style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)', textDecoration: 'underline', textDecorationStyle: 'wavy', textUnderlineOffset: 3, textDecorationColor: 'var(--accent)' }}>
                forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', padding: '13px 14px', fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14, fontWeight: 500, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? 'Logging in…' : 'Log in →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '11px 14px', background: 'var(--paper)', border: '1px solid var(--rule)', color: 'var(--ink)', fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14, cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Bottom link */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/signup" style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)', textDecoration: 'underline', textDecorationStyle: 'wavy', textUnderlineOffset: 3, textDecorationColor: 'var(--accent)' }}>
              new here? begin tending.
            </Link>
          </div>
        </div>
      </div>

      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
