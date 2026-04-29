import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.sendForgotPasswordOTP(email);
      showToast('Code sent to your email.', 'success');
      setStep(2);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(otp, username, newPassword, confirmPassword);
      showToast('Password reset. You can log in now.', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Password reset failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--rule)', padding: 32 }}>

          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            FORGOT?
          </div>

          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontStyle: 'italic', fontWeight: 400, color: 'var(--ink)', margin: '0 0 6px' }}>
            Help me in.
          </h1>
          <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 28 }}>
            {step === 1 ? "we'll send a code to your email." : "enter the code and your new password."}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOTP}>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', padding: '13px 14px', fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14, fontWeight: 500, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading ? 'Sending…' : 'Send code →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="username or your@email.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                  required
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Code (6 digits)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="______"
                  style={{ ...inputStyle, textAlign: 'center', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 22, letterSpacing: '0.3em' }}
                  onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                  required
                  maxLength={6}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="min. 6 characters"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                  required
                  minLength={6}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="confirm new password"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', padding: '13px 14px', fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14, fontWeight: 500, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, marginBottom: 10 }}
              >
                {isLoading ? 'Resetting…' : 'Reset password →'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ width: '100%', background: 'none', border: 'none', fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontStyle: 'italic', color: 'var(--muted)', cursor: 'pointer' }}
              >
                ← back to step 1
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px dashed var(--rule)', paddingTop: 20 }}>
            <Link to="/login" style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)', textDecoration: 'underline', textDecorationStyle: 'wavy', textUnderlineOffset: 3, textDecorationColor: 'var(--accent)' }}>
              remembered? welcome back.
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
