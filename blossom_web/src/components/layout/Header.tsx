// Placeholder for Header component
export default function Header() {
  return (
    <header className="bg-dark-card border-b border-dark-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-soft-100 rounded flex items-center justify-center">
            <span className="text-white text-xl">🌸</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">BLOSSOM</h1>
            <p className="text-xs text-text-muted">Tech-Girly Edition</p>
          </div>
        </div>
        <nav className="flex gap-6">
          <a href="/" className="text-text-secondary hover:text-text-primary">Task & Focus</a>
          <a href="/pets" className="text-text-secondary hover:text-text-primary">My Pets</a>
          <a href="/analytics" className="text-text-secondary hover:text-text-primary">Analytics</a>
          <a href="/settings" className="text-text-secondary hover:text-text-primary">Settings</a>
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

