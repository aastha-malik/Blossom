import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../api/client';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();

  // Fetch user XP when authenticated
  const { data: userXP } = useQuery({
    queryKey: ['userXP'],
    queryFn: () => userAPI.getXP(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-dark-card border-b border-dark-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={isAuthenticated ? "/tasks" : "/"} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-soft-100 rounded flex items-center justify-center">
            <span className="text-white text-xl">🌸</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">BLOSSOM</h1>
            <p className="text-xs text-text-muted">Tech-Girly Edition</p>
          </div>
        </Link>
        <nav className="flex gap-2">
          <Link
            to="/tasks"
            className={`px-4 py-2 rounded-lg transition-all ${isActive('/tasks')
              ? 'bg-dark-elevated text-text-primary font-bold'
              : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface'
              }`}
          >
            Task & Focus
          </Link>
          <Link
            to="/pets"
            className={`px-4 py-2 rounded-lg transition-all ${isActive('/pets')
              ? 'bg-dark-elevated text-text-primary font-bold'
              : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface'
              }`}
          >
            My Pets
          </Link>
          <Link
            to="/analytics"
            className={`px-4 py-2 rounded-lg transition-all ${isActive('/analytics')
              ? 'bg-dark-elevated text-text-primary font-bold'
              : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface'
              }`}
          >
            Analytics
          </Link>
          <Link
            to="/settings"
            className={`px-4 py-2 rounded-lg transition-all ${isActive('/settings')
              ? 'bg-dark-elevated text-text-primary font-bold'
              : 'text-text-secondary hover:text-text-primary hover:bg-dark-surface'
              }`}
          >
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-text-secondary">
            XP: {isAuthenticated ? (userXP?.xp ?? 0) : 0}
          </span>
          <span className="text-text-secondary">🔥 Streak: 0 days</span>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-text-secondary">Hi, {username}!</span>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

