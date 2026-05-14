import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';

const NAV_ITEMS = [
  { label: 'Today',   path: '/today' },
  { label: 'Pet',     path: '/pet' },
  { label: 'Ledger',  path: '/ledger' },
  { label: 'Archive', path: '/settings' },
];

export default function BottomNav() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile || !isAuthenticated) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--paper)',
      borderTop: '1px solid var(--rule)',
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {NAV_ITEMS.map(({ label, path }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 4px',
              textDecoration: 'none',
              fontFamily: 'Fraunces, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: active ? 'var(--accent)' : 'var(--ink-soft)',
              borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
