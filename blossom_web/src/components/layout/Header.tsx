import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { userAPI } from '../../api/client';
import { LogoSvg } from '../ui/LogoSvg';

function getEditionInfo(): { number: string; season: string; year: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  const weekOfYear = Math.ceil(dayOfYear / 7);
  const issueNum = ((weekOfYear - 1) % 13) + 1;

  const month = now.getMonth(); // 0-indexed
  let season = 'winter';
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';

  const yr = String(now.getFullYear()).slice(2);
  return {
    number: String(issueNum).padStart(2, '0'),
    season,
    year: yr,
  };
}

const NAV_ITEMS = [
  { label: 'Today', path: '/today' },
  { label: 'Pet',   path: '/pet' },
  { label: 'Ledger', path: '/ledger' },
  { label: 'Archive', path: '/settings' },
];

export default function Header() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const { data: userXP } = useQuery({
    queryKey: ['userXP'],
    queryFn: () => userAPI.getXP(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const edition = getEditionInfo();
  const isLanding = !isAuthenticated;

  const headerStyle: React.CSSProperties = {
    padding: '20px 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--rule)',
    background: 'var(--paper)',
  };

  return (
    <header style={headerStyle}>
      {/* Left: logo + brand + edition */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to={isAuthenticated ? '/today' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoSvg />
          <span style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--ink)',
            letterSpacing: -0.4,
          }}>
            Tendr
          </span>
        </Link>
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 10,
          color: 'var(--muted)',
          letterSpacing: 1,
          borderLeft: '1px solid var(--rule)',
          paddingLeft: 10,
          marginLeft: 4,
        }}>
          no. {edition.number} · {edition.season} '{edition.year}
        </div>
      </div>

      {/* Right: nav or Begin */}
      {isLanding ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={toggleTheme}
            style={{
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11,
              color: 'var(--muted)',
              letterSpacing: 1,
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link
            to="/login"
            style={{
              color: 'var(--paper)',
              background: 'var(--ink)',
              padding: '8px 16px',
              fontSize: 12,
              letterSpacing: 0.5,
              fontFamily: '"Inter", system-ui, sans-serif',
              textDecoration: 'none',
            }}
          >
            Begin →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {NAV_ITEMS.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 15,
                  fontStyle: 'italic',
                  color: active ? 'var(--accent)' : 'var(--ink-soft)',
                  borderBottom: active ? '2px solid var(--accent)' : 'none',
                  paddingBottom: 2,
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            style={{
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11,
              color: 'var(--muted)',
              letterSpacing: 1,
              background: 'none',
              border: 'none',
              padding: 0,
              marginLeft: 8,
            }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            color: 'var(--muted)',
            letterSpacing: 1,
          }}>
            xp {isAuthenticated ? (userXP?.xp ?? 0) : 0}
          </div>
          <button
            onClick={logout}
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
              color: 'var(--muted)',
              letterSpacing: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textTransform: 'uppercase',
            }}
          >
            OUT
          </button>
        </div>
      )}
    </header>
  );
}
