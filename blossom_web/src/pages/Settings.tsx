import { Lock, Info, LogIn, UserPlus, Settings as SettingsIcon, Trash2, KeyRound, Mail, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { authAPI } from '../api/client';

export default function Settings() {
  const navigate = useNavigate();
  const { isAuthenticated, username, email, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // UI State - Show/Hide forms
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Password Reset State (for logged-in users)
  const [resetOldPassword, setResetOldPassword] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Forgot Password State (with email verification)
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
    window.location.href = 'https://blossombackend-ib15.onrender.com/login/google/start';
  };

  // Delete Account Handler
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteSuccess('');

    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }

    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      setDeleteSuccess('Account deleted successfully. Logging out...');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Password Reset Handler (for logged-in users)
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetOldPassword || !resetNewPassword || !resetConfirmPassword) {
      setResetError('Please fill in all fields');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('New passwords do not match');
      return;
    }

    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters');
      return;
    }

    setResetLoading(true);
    try {
      await authAPI.resetPassword(username!, resetOldPassword, resetNewPassword, resetConfirmPassword);
      setResetSuccess('Password reset successfully!');
      setResetOldPassword('');
      setResetNewPassword('');
      setResetConfirmPassword('');
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  // Forgot Password - Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      setForgotError('Please enter your email');
      return;
    }

    setForgotLoading(true);
    try {
      await authAPI.sendForgotPasswordOTP(forgotEmail);
      setForgotSuccess('OTP sent to your email!');
      setForgotStep('verify');
    } catch (error) {
      setForgotError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password - Verify OTP and Reset
  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotOTP || !forgotUsername || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('Please fill in all fields');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotOTP, forgotUsername, forgotNewPassword, forgotConfirmPassword);
      setForgotSuccess('Password reset successfully! You can now login.');
      // Reset form
      setForgotEmail('');
      setForgotOTP('');
      setForgotUsername('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotStep('email');
    } catch (error) {
      setForgotError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Centered Heading */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <SettingsIcon size={40} className="text-pink-soft-100" />
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-pink-soft-100 to-purple-gentle-100 bg-clip-text text-transparent">
            SETTINGS
          </h2>
        </div>

        <div className="space-y-6">
          {/* Theme Toggle Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon size={24} className="text-purple-gentle-100" />
                ) : (
                  <Sun size={24} className="text-yellow-500" />
                )}
                <h3 className="text-2xl font-semibold text-text-primary">Theme</h3>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary font-medium mb-1">
                  {theme === 'dark' ? '🌌 Galaxy Dark Mode' : '☀️ Light Mode'}
                </p>
                <p className="text-text-muted text-sm">
                  {theme === 'dark'
                    ? 'Tech-girly vibes with deep purples and cosmic pinks'
                    : 'Soft and elegant with gentle pastels'}
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className="relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-gentle focus:ring-offset-2"
                style={{
                  backgroundColor: theme === 'dark' ? 'var(--purple-gentle)' : 'var(--pink-soft)'
                }}
              >
                <span
                  className="inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center"
                  style={{
                    transform: theme === 'dark' ? 'translateX(0.5rem)' : 'translateX(3rem)'
                  }}
                >
                  {theme === 'dark' ? (
                    <Moon size={20} className="text-purple-gentle-300" />
                  ) : (
                    <Sun size={20} className="text-yellow-500" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Authentication Card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Lock size={24} className="text-yellow-400" />
              <h3 className="text-2xl font-semibold text-text-primary">Authentication</h3>
            </div>

            {isAuthenticated ? (
              <>
                <div className="mb-4">
                  <p className="text-green-400 text-lg mb-2">✅ Logged in</p>
                  <div className="space-y-2 text-text-secondary">
                    <p>Username: <span className="text-text-primary">{username}</span></p>
                    <p>Email: <span className="text-text-primary">{email}</span></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={logout}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-red-400 text-lg mb-4">❌ Not logged in</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Lock size={18} />
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <UserPlus size={18} />
                    Sign Up
                  </button>
                  <button
                    onClick={handleGoogleLogin}
                    className="btn-primary flex items-center gap-2 bg-blue-muted-100 hover:bg-blue-muted-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google Login
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Password Reset Card - Only show when logged in */}
          {isAuthenticated && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <KeyRound size={24} className="text-purple-gentle-100" />
                <h3 className="text-2xl font-semibold text-text-primary">Reset Password</h3>
              </div>

              {!showPasswordReset ? (
                <>
                  <p className="text-text-muted mb-4">
                    Change your account password. If you logged in with Google or don't remember your current password, please use the "Forgot Password" option below.
                  </p>
                  <button
                    onClick={() => setShowPasswordReset(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <KeyRound size={18} />
                    Reset Password
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-muted-100/10 border border-blue-muted-100/30 rounded-lg">
                    <p className="text-blue-muted-100 text-sm">
                      💡 <strong>Note:</strong> If you logged in with Google or don't remember your password, please logout and use the "Forgot Password" feature instead.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                      <label className="block text-text-secondary mb-2">Current Password</label>
                      <input
                        type="password"
                        value={resetOldPassword}
                        onChange={(e) => setResetOldPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary mb-2">New Password</label>
                      <input
                        type="password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                        placeholder="Confirm new password"
                      />
                    </div>

                    {resetError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {resetError}
                      </div>
                    )}

                    {resetSuccess && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                        {resetSuccess}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordReset(false);
                          setResetError('');
                          setResetSuccess('');
                          setResetOldPassword('');
                          setResetNewPassword('');
                          setResetConfirmPassword('');
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        <KeyRound size={18} />
                        {resetLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Forgot Password Card - Only show when NOT logged in */}
          {!isAuthenticated && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Mail size={24} className="text-blue-muted-100" />
                <h3 className="text-2xl font-semibold text-text-primary">Forgot Password</h3>
              </div>

              {forgotStep === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-text-secondary mb-2">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                      placeholder="Enter your email"
                    />
                  </div>

                  {forgotError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                      {forgotError}
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                      {forgotSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Mail size={18} />
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotPasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-text-secondary mb-2">OTP Code</label>
                    <input
                      type="text"
                      value={forgotOTP}
                      onChange={(e) => setForgotOTP(e.target.value)}
                      className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                      placeholder="Enter OTP from email"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-2">Username</label>
                    <input
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-2">New Password</label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-background-secondary border border-pink-soft-100/30 rounded-lg text-text-primary focus:outline-none focus:border-pink-soft-100"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {forgotError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                      {forgotError}
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                      {forgotSuccess}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('email');
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <KeyRound size={18} />
                      {forgotLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Delete Account Card - Only show when logged in */}
          {isAuthenticated && (
            <div className="card border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 size={24} className="text-red-400" />
                <h3 className="text-2xl font-semibold text-red-400">Delete Account</h3>
              </div>

              {!showDeleteAccount ? (
                <>
                  <p className="text-text-muted mb-4">
                    ⚠️ <strong>Warning:</strong> This action is permanent and cannot be undone. All your data will be lost.
                  </p>
                  <p className="text-text-secondary mb-4 text-sm">
                    If you logged in with Google or don't remember your password, please contact support or logout and use "Forgot Password" to reset your password first.
                  </p>
                  <button
                    onClick={() => setShowDeleteAccount(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm mb-2">
                      ⚠️ <strong>Final Warning:</strong> This will permanently delete your account and all associated data.
                    </p>
                    <p className="text-red-400 text-sm">
                      💡 <strong>Note:</strong> If you logged in with Google, you may not have a password. Please logout and use "Forgot Password" to set one first, or contact support.
                    </p>
                  </div>

                  <form onSubmit={handleDeleteAccount} className="space-y-4">
                    <div>
                      <label className="block text-text-secondary mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-4 py-2 bg-background-secondary border border-red-500/30 rounded-lg text-text-primary focus:outline-none focus:border-red-500"
                        placeholder="Enter your password to confirm"
                      />
                    </div>

                    {deleteError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {deleteError}
                      </div>
                    )}

                    {deleteSuccess && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                        {deleteSuccess}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteAccount(false);
                          setDeleteError('');
                          setDeleteSuccess('');
                          setDeletePassword('');
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={deleteLoading}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                        {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* About Card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Info size={24} className="text-blue-muted-100" />
              <h3 className="text-2xl font-semibold text-text-primary">About</h3>
            </div>

            <div className="space-y-3">
              <p className="text-blue-muted-100 text-lg font-medium">
                Blossom Focus: Tech-Girly Edition v1.0
              </p>
              <p className="text-text-primary text-lg">
                A productivity app with style! 🌸✨
              </p>
              <p className="text-text-muted">
                Stay focused, care for your virtual pets, and build productive habits in a calm, cozy environment.
              </p>
            </div>
          </div>

          {/* Feedback & Contact Card */}
          <div className="card border-pink-soft-100/30">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-pink-soft-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-semibold text-text-primary">Feedback & Contact</h3>
            </div>

            <div className="space-y-4">
              <p className="text-text-muted">
                Have any advice, corrections, or suggestions? We'd love to hear from you! Your feedback helps us make Blossom better.
              </p>
              <a
                href="mailto:aasthamalik.work@gmail.com?subject=Blossom Feedback"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-soft-100 to-purple-gentle-100 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send us an email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

