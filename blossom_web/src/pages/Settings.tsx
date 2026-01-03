import { Lock, Info, LogIn, UserPlus, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { isAuthenticated, username, email, logout } = useAuth();

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'https://blossombackend-ib15.onrender.com/login/google/start';
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
        </div>
      </div>
    </div>
  );
}

