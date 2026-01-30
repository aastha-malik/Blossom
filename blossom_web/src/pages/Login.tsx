import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { API_URL } from '../utils/constants';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setAuthData, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, showToast, removeToast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !searchParams.get('token')) {
      navigate('/tasks');
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Handle Google Login Redirect Token
  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const email = searchParams.get('email');

    if (token) {
      // If we have token but missing username/email (fallback)
      const finalUsername = username || 'User';
      const finalEmail = email || '';

      setAuthData(token, finalUsername, finalEmail);
      showToast('Successfully logged in with Google! 🚀', 'success');

      setTimeout(() => {
        navigate('/tasks');
      }, 500);
    }
  }, [searchParams, setAuthData, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the login function from context which handles token storage
      // Backend accepts either username or email
      await login({
        username: usernameOrEmail,
        password,
      });

      showToast('Welcome back! 🎉', 'success');
      navigate('/tasks');
    } catch (error) {
      // Check if it's an email verification error (403 status)
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      showToast(errorMessage, 'error');
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
            <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome Back!</h2>
            <p className="text-text-secondary">
              Log in to continue your productivity journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-text-secondary text-sm mb-3">Username or Email</label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="username or your@email.com"
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
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
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
              Don't have an account?{' '}
              <Link to="/signup" className="text-pink-soft-100 hover:text-pink-soft-200 font-medium">
                Sign up
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

