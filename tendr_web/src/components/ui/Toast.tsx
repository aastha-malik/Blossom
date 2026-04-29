import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const borderColor = type === 'error' ? 'var(--accent)' : type === 'success' ? 'var(--accent-2)' : 'var(--accent-3)';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: 'var(--card)',
        border: '1px solid var(--rule)',
        borderLeft: `4px solid ${borderColor}`,
        padding: '14px 18px',
        minWidth: 300,
        maxWidth: 420,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '2px 4px 0 var(--shadow)',
      }}
    >
      <p style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: 1.5,
        color: 'var(--ink)',
        margin: 0,
        flex: 1,
      }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11,
          color: 'var(--muted)',
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
