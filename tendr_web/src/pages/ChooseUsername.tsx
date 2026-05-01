import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/client';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

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

export default function ChooseUsername() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const token = searchParams.get('pending_token');
    if (!token) {
      navigate('/signup');
    } else {
      setPendingToken(token);
    }
  }, [searchParams, navigate]);

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return 'Username must be at least 3 characters.';
    if (value.length > 30) return 'Username must be at most 30 characters.';
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Only letters, numbers, underscores, and hyphens allowed.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    const validationError = validateUsername(trimmed);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }
    if (!pendingToken) return;

    setIsLoading(true);
    try {
      const result = await authAPI.completeGoogleRegistration(pendingToken, trimmed);
      setAuthData(result.token, result.username, result.email);
      showToast('Welcome to Tendr!', 'success');
      setTimeout(() => navigate('/today'), 500);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--rule)', padding: 32 }}>

          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            ONE LAST THING
          </div>

          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontStyle: 'italic', fontWeight: 400, color: 'var(--ink)', margin: '0 0 6px' }}>
            Pick a username.
          </h1>
          <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 28 }}>
            this is how others will see you. choose wisely.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 6 }}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. tendergarden"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                autoFocus
                required
              />
            </div>

            <p style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'var(--muted)', marginBottom: 22, letterSpacing: '0.5px' }}>
              3–30 chars · letters, numbers, _ and - only
            </p>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', padding: '13px 14px', fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14, fontWeight: 500, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? 'Creating your garden…' : 'Start tending →'}
            </button>
          </form>
        </div>
      </div>

      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
