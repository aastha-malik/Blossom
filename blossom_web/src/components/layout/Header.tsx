import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-dark-card border-b border-dark-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-soft-100 rounded flex items-center justify-center">
            <span className="text-white text-xl">🌸</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">BLOSSOM</h1>
            <p className="text-xs text-text-muted">Tech-Girly Edition</p>
          </div>
        </Link>
        <nav className="flex gap-6">
          <Link
            to="/"
            className={`transition-colors ${
              isActive('/')
                ? 'text-text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Task & Focus
          </Link>
          <Link
            to="/pets"
            className={`transition-colors ${
              isActive('/pets')
                ? 'text-text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            My Pets
          </Link>
          <Link
            to="/analytics"
            className={`transition-colors ${
              isActive('/analytics')
                ? 'text-text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Analytics
          </Link>
          <Link
            to="/settings"
            className={`transition-colors ${
              isActive('/settings')
                ? 'text-text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-text-secondary">XP: 0</span>
          <span className="text-text-secondary">🔥 Streak: 0 days</span>
          <button className="btn-primary">Login / Sign Up</button>
        </div>
      </div>
    </header>
  );
}

