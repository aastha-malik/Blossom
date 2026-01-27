import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { API_URL } from '../utils/constants';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long!', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username,
        email,
        password,
      });

      showToast('Account created! Please verify your email. 📧', 'success');
      // Navigate to verify email page with the email pre-filled along with username and password for auto-login
      setTimeout(() => {
        navigate('/verify-email', { state: { email, username, password } });
      }, 500);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Sign up failed. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint (browser redirect, not API call)
    window.location.href = `${API_URL}/auth/google/login`;
  };

  return (
    <div className="min-h-screen page-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card relative p-8">
          <Link
            to="/"
            className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Join Blossom</h2>
            <p className="text-text-secondary">
              Create an account to start your focus journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-text-secondary text-sm mb-3">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="input-field w-full py-3"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-3">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field w-full py-3"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-3">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field w-full py-3"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-3">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="input-field w-full py-3"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-dark-border"></div>
              <span className="text-text-muted text-sm">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-dark-border"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-dark-border bg-dark-surface hover:bg-dark-border transition-colors text-text-primary"
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
              Continue with Google
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-soft-100 hover:text-pink-soft-200 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

