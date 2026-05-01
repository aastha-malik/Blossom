import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, userAPI } from '../api/client';
import { API_URL } from '../utils/constants';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
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

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--rule)',
  padding: 24,
  marginBottom: 16,
};

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
  marginBottom: 14,
};

const primaryBtn: React.CSSProperties = {
  background: 'var(--ink)',
  color: 'var(--paper)',
  padding: '11px 20px',
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 13,
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  background: 'none',
  color: 'var(--ink)',
  padding: '10px 18px',
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 13,
  border: '1px solid var(--rule)',
  cursor: 'pointer',
};

function FeedbackLine({ msg, isError }: { msg: string; isError?: boolean }) {
  return (
    <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: isError ? 'var(--accent)' : 'var(--accent-2)', margin: '8px 0 0' }}>
      {msg}
    </p>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { isAuthenticated, username, email, logout } = useAuth();

  const [isGoogleUser, setIsGoogleUser] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      userAPI.getProvider()
        .then(res => setIsGoogleUser(res.provider === 'google'))
        .catch(() => setIsGoogleUser(false));
    }
  }, [isAuthenticated]);

  // ── Regular password reset ───────────────────────────────────────────
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetOldPassword, setResetOldPassword] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // ── Google user: set/change password via OTP ─────────────────────────
  const [googlePwStep, setGooglePwStep] = useState<'idle' | 'otp_sent'>('idle');
  const [googlePwOtp, setGooglePwOtp] = useState('');
  const [googlePwNew, setGooglePwNew] = useState('');
  const [googlePwConfirm, setGooglePwConfirm] = useState('');
  const [googlePwLoading, setGooglePwLoading] = useState(false);
  const [googlePwError, setGooglePwError] = useState('');
  const [googlePwSuccess, setGooglePwSuccess] = useState('');

  // ── Regular delete account ────────────────────────────────────────────
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // ── Google user: delete account via OTP ──────────────────────────────
  const [googleDelStep, setGoogleDelStep] = useState<'idle' | 'otp_sent'>('idle');
  const [googleDelOtp, setGoogleDelOtp] = useState('');
  const [googleDelLoading, setGoogleDelLoading] = useState(false);
  const [googleDelError, setGoogleDelError] = useState('');
  const [googleDelSuccess, setGoogleDelSuccess] = useState('');

  // ── Forgot password (logged-out) ─────────────────────────────────────
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOTP, setForgotOTP] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'verify'>('email');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google/login`;
  };

  const handleGoogleSendOtp = async (onSuccess: () => void, setError: (s: string) => void, setLoading: (b: boolean) => void) => {
    setError('');
    setLoading(true);
    try {
      await authAPI.sendForgotPasswordOTP(email!);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGooglePwError(''); setGooglePwSuccess('');
    if (!googlePwOtp) { setGooglePwError('Please enter the OTP.'); return; }
    if (!googlePwNew || !googlePwConfirm) { setGooglePwError('Please fill in all fields.'); return; }
    if (googlePwNew !== googlePwConfirm) { setGooglePwError('Passwords do not match.'); return; }
    if (googlePwNew.length < 6) { setGooglePwError('Password must be at least 6 characters.'); return; }
    setGooglePwLoading(true);
    try {
      await authAPI.forgotPassword(googlePwOtp, username!, googlePwNew, googlePwConfirm);
      setGooglePwSuccess('Password set. You can now log in with email too.');
      setGooglePwOtp(''); setGooglePwNew(''); setGooglePwConfirm('');
      setGooglePwStep('idle');
      setIsGoogleUser(false);
    } catch (err) {
      setGooglePwError(err instanceof Error ? err.message : 'Failed to set password.');
    } finally {
      setGooglePwLoading(false);
    }
  };

  const handleGoogleDeleteWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleDelError(''); setGoogleDelSuccess('');
    if (!googleDelOtp) { setGoogleDelError('Please enter the OTP.'); return; }
    if (!confirm('This will permanently delete your account and all data. Continue?')) return;
    setGoogleDelLoading(true);
    try {
      await authAPI.deleteAccountWithOtp(googleDelOtp);
      setGoogleDelSuccess('Account deleted. Logging out…');
      setTimeout(() => { logout(); navigate('/'); }, 2000);
    } catch (err) {
      setGoogleDelError(err instanceof Error ? err.message : 'Failed to delete account.');
    } finally {
      setGoogleDelLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteSuccess('');
    if (!deletePassword) { setDeleteError('Please enter your password.'); return; }
    if (!confirm('This will permanently delete your account and all data. Continue?')) return;
    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      setDeleteSuccess('Account deleted. Logging out…');
      setTimeout(() => { logout(); navigate('/'); }, 2000);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!resetOldPassword || !resetNewPassword || !resetConfirmPassword) { setResetError('Please fill in all fields.'); return; }
    if (resetNewPassword !== resetConfirmPassword) { setResetError('New passwords do not match.'); return; }
    if (resetNewPassword.length < 6) { setResetError('New password must be at least 6 characters.'); return; }
    setResetLoading(true);
    try {
      await authAPI.resetPassword(username!, resetOldPassword, resetNewPassword, resetConfirmPassword);
      setResetSuccess('Password updated.');
      setResetOldPassword(''); setResetNewPassword(''); setResetConfirmPassword('');
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotSuccess('');
    if (!forgotEmail) { setForgotError('Please enter your email.'); return; }
    setForgotLoading(true);
    try {
      await authAPI.sendForgotPasswordOTP(forgotEmail);
      setForgotSuccess('Code sent to your email.');
      setForgotStep('verify');
    } catch (error) {
      setForgotError(error instanceof Error ? error.message : 'Failed to send code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotSuccess('');
    if (!forgotOTP || !forgotUsername || !forgotNewPassword || !forgotConfirmPassword) { setForgotError('Please fill in all fields.'); return; }
    if (forgotNewPassword !== forgotConfirmPassword) { setForgotError('Passwords do not match.'); return; }
    if (forgotNewPassword.length < 6) { setForgotError('Password must be at least 6 characters.'); return; }
    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotOTP, forgotUsername, forgotNewPassword, forgotConfirmPassword);
      setForgotSuccess('Password reset. You can now log in.');
      setForgotEmail(''); setForgotOTP(''); setForgotUsername(''); setForgotNewPassword(''); setForgotConfirmPassword('');
      setForgotStep('email');
    } catch (error) {
      setForgotError(error instanceof Error ? error.message : 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '36px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '3px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>ARCHIVE · SETTINGS</div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 44, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1, color: 'var(--ink)', margin: 0 }}>Account.</h1>
        </div>

        {/* Account info / auth */}
        <div style={cardStyle}>
          <div style={sectionHeadStyle}>ACCOUNT</div>
          {isAuthenticated ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 4 }}>
                  <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: 1, color: 'var(--muted)', marginRight: 8, textTransform: 'uppercase' }}>USER</span>
                  {username}
                </div>
                <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14, color: 'var(--ink-soft)' }}>
                  <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: 1, color: 'var(--muted)', marginRight: 8, textTransform: 'uppercase' }}>EMAIL</span>
                  {email}
                </div>
              </div>
              <button onClick={logout} style={ghostBtn}>Log out</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} style={primaryBtn}>Log in →</button>
              <button onClick={() => navigate('/signup')} style={ghostBtn}>Begin tending →</button>
              <button onClick={handleGoogleLogin} style={{ ...ghostBtn, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          )}
        </div>

        {/* Reset password (logged-in) */}
        {isAuthenticated && (
          <div style={cardStyle}>
            <div style={sectionHeadStyle}>RESET PASSWORD</div>

            {/* Google user: OTP-based flow */}
            {isGoogleUser && (
              googlePwStep === 'idle' ? (
                <>
                  <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>
                    You signed in with Google and don't have a password yet. We'll send a one-time code to <strong>{email}</strong> to verify it's you.
                  </p>
                  {googlePwSuccess && <FeedbackLine msg={googlePwSuccess} />}
                  {googlePwError && <FeedbackLine msg={googlePwError} isError />}
                  <button
                    onClick={() => handleGoogleSendOtp(() => setGooglePwStep('otp_sent'), setGooglePwError, setGooglePwLoading)}
                    disabled={googlePwLoading}
                    style={{ ...ghostBtn, opacity: googlePwLoading ? 0.6 : 1 }}
                  >
                    {googlePwLoading ? 'Sending…' : 'Send code to email →'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleGoogleSetPassword}>
                  <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>
                    Code sent to {email}. Enter it below along with your new password.
                  </p>
                  {[
                    { label: 'Code (6 digits)', value: googlePwOtp, setter: setGooglePwOtp, type: 'text' },
                    { label: 'New password', value: googlePwNew, setter: setGooglePwNew, type: 'password' },
                    { label: 'Confirm password', value: googlePwConfirm, setter: setGooglePwConfirm, type: 'password' },
                  ].map(({ label, value, setter, type }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        type={type}
                        value={value}
                        onChange={e => setter(e.target.value)}
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                        onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                      />
                    </div>
                  ))}
                  {googlePwError && <FeedbackLine msg={googlePwError} isError />}
                  {googlePwSuccess && <FeedbackLine msg={googlePwSuccess} />}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button type="submit" disabled={googlePwLoading} style={{ ...primaryBtn, opacity: googlePwLoading ? 0.6 : 1 }}>
                      {googlePwLoading ? 'Setting…' : 'Set password →'}
                    </button>
                    <button type="button" onClick={() => { setGooglePwStep('idle'); setGooglePwError(''); setGooglePwOtp(''); setGooglePwNew(''); setGooglePwConfirm(''); }} style={ghostBtn}>Cancel</button>
                  </div>
                </form>
              )
            )}

            {/* Regular user: current password flow */}
            {isGoogleUser === false && (
              !showPasswordReset ? (
                <>
                  <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>
                    Change your account password.
                  </p>
                  <button onClick={() => setShowPasswordReset(true)} style={ghostBtn}>Change password →</button>
                </>
              ) : (
                <form onSubmit={handlePasswordReset}>
                  {[
                    { label: 'Current password', value: resetOldPassword, setter: setResetOldPassword },
                    { label: 'New password', value: resetNewPassword, setter: setResetNewPassword },
                    { label: 'Confirm new password', value: resetConfirmPassword, setter: setResetConfirmPassword },
                  ].map(({ label, value, setter }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        type="password"
                        value={value}
                        onChange={e => setter(e.target.value)}
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                        onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                      />
                    </div>
                  ))}
                  {resetError && <FeedbackLine msg={resetError} isError />}
                  {resetSuccess && <FeedbackLine msg={resetSuccess} />}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button type="submit" disabled={resetLoading} style={{ ...primaryBtn, opacity: resetLoading ? 0.6 : 1 }}>
                      {resetLoading ? 'Saving…' : 'Save →'}
                    </button>
                    <button type="button" onClick={() => { setShowPasswordReset(false); setResetError(''); setResetSuccess(''); }} style={ghostBtn}>Cancel</button>
                  </div>
                </form>
              )
            )}
          </div>
        )}

        {/* Forgot password (not logged-in) */}
        {!isAuthenticated && (
          <div style={cardStyle}>
            <div style={sectionHeadStyle}>FORGOT PASSWORD</div>
            {forgotStep === 'email' ? (
              <form onSubmit={handleSendOTP}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                    required
                  />
                </div>
                {forgotError && <FeedbackLine msg={forgotError} isError />}
                {forgotSuccess && <FeedbackLine msg={forgotSuccess} />}
                <button type="submit" disabled={forgotLoading} style={{ ...primaryBtn, marginTop: 14, opacity: forgotLoading ? 0.6 : 1 }}>
                  {forgotLoading ? 'Sending…' : 'Send code →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPasswordReset}>
                {[
                  { label: 'Username', value: forgotUsername, setter: setForgotUsername, type: 'text' },
                  { label: 'Code (6 digits)', value: forgotOTP, setter: setForgotOTP, type: 'text' },
                  { label: 'New password', value: forgotNewPassword, setter: setForgotNewPassword, type: 'password' },
                  { label: 'Confirm password', value: forgotConfirmPassword, setter: setForgotConfirmPassword, type: 'password' },
                ].map(({ label, value, setter, type }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={e => setter(e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                      onBlur={e => { e.currentTarget.style.border = '1px solid var(--rule)'; }}
                      required
                    />
                  </div>
                ))}
                {forgotError && <FeedbackLine msg={forgotError} isError />}
                {forgotSuccess && <FeedbackLine msg={forgotSuccess} />}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button type="submit" disabled={forgotLoading} style={{ ...primaryBtn, opacity: forgotLoading ? 0.6 : 1 }}>
                    {forgotLoading ? 'Resetting…' : 'Reset →'}
                  </button>
                  <button type="button" onClick={() => { setForgotStep('email'); setForgotError(''); setForgotSuccess(''); }} style={ghostBtn}>Back</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Delete account */}
        {isAuthenticated && (
          <div style={{ ...cardStyle, borderColor: 'var(--accent)' }}>
            <div style={{ ...sectionHeadStyle, color: 'var(--accent)' }}>DELETE ACCOUNT</div>

            {/* Google user: OTP-based delete */}
            {isGoogleUser && (
              googleDelStep === 'idle' ? (
                <>
                  <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>
                    Permanent. All your tasks, pets, and history will be gone. We'll send a one-time code to <strong>{email}</strong> to confirm.
                  </p>
                  {googleDelError && <FeedbackLine msg={googleDelError} isError />}
                  {googleDelSuccess && <FeedbackLine msg={googleDelSuccess} />}
                  <button
                    onClick={() => handleGoogleSendOtp(() => setGoogleDelStep('otp_sent'), setGoogleDelError, setGoogleDelLoading)}
                    disabled={googleDelLoading}
                    style={{ ...ghostBtn, borderColor: 'var(--accent)', color: 'var(--accent)', opacity: googleDelLoading ? 0.6 : 1 }}
                  >
                    {googleDelLoading ? 'Sending…' : 'Send code to confirm →'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleGoogleDeleteWithOtp}>
                  <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>
                    Code sent to {email}. Enter it to permanently delete your account.
                  </p>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Code (6 digits)</label>
                    <input
                      type="text"
                      value={googleDelOtp}
                      onChange={e => setGoogleDelOtp(e.target.value)}
                      style={{ ...inputStyle, borderColor: 'var(--accent)' }}
                      onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                      onBlur={e => { e.currentTarget.style.border = '1px solid var(--accent)'; }}
                      required
                    />
                  </div>
                  {googleDelError && <FeedbackLine msg={googleDelError} isError />}
                  {googleDelSuccess && <FeedbackLine msg={googleDelSuccess} />}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button type="submit" disabled={googleDelLoading} style={{ ...primaryBtn, background: 'var(--accent)', opacity: googleDelLoading ? 0.6 : 1 }}>
                      {googleDelLoading ? 'Deleting…' : 'Confirm delete'}
                    </button>
                    <button type="button" onClick={() => { setGoogleDelStep('idle'); setGoogleDelError(''); setGoogleDelOtp(''); }} style={ghostBtn}>Cancel</button>
                  </div>
                </form>
              )
            )}

            {/* Regular user: password-based delete */}
            {isGoogleUser === false && (
              !showDeleteAccount ? (
                <>
                  <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>
                    Permanent. All your tasks, pets, and history will be gone.
                  </p>
                  <button onClick={() => setShowDeleteAccount(true)} style={{ ...ghostBtn, borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                    Delete account
                  </button>
                </>
              ) : (
                <form onSubmit={handleDeleteAccount}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Confirm password</label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      style={{ ...inputStyle, borderColor: 'var(--accent)' }}
                      onFocus={e => { e.currentTarget.style.border = '1.5px solid var(--accent)'; }}
                      onBlur={e => { e.currentTarget.style.border = '1px solid var(--accent)'; }}
                      required
                    />
                  </div>
                  {deleteError && <FeedbackLine msg={deleteError} isError />}
                  {deleteSuccess && <FeedbackLine msg={deleteSuccess} />}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button type="submit" disabled={deleteLoading} style={{ ...primaryBtn, background: 'var(--accent)', opacity: deleteLoading ? 0.6 : 1 }}>
                      {deleteLoading ? 'Deleting…' : 'Confirm delete'}
                    </button>
                    <button type="button" onClick={() => { setShowDeleteAccount(false); setDeleteError(''); setDeletePassword(''); }} style={ghostBtn}>Cancel</button>
                  </div>
                </form>
              )
            )}
          </div>
        )}

        {/* About + contact */}
        <div style={cardStyle}>
          <div style={sectionHeadStyle}>ABOUT</div>
          <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 12 }}>
            Tendr v1.0 — a journal-shaped productivity app.
          </p>
          <a
            href="mailto:aasthamalik.work@gmail.com?subject=Tendr Feedback"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'underline', textDecorationStyle: 'wavy', textUnderlineOffset: 3, textDecorationColor: 'var(--accent)' }}
          >
            send feedback →
          </a>
        </div>

      </div>
    </div>
  );
}
