interface ConfirmModalProps {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const mono: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 9,
  letterSpacing: '2px',
  textTransform: 'uppercase',
};

export default function ConfirmModal({ title, body, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--rule)',
          borderLeft: '4px solid var(--accent)',
          boxShadow: '4px 4px 0 var(--shadow)',
          padding: '28px 32px',
          maxWidth: 380,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ ...mono, color: 'var(--accent)', marginBottom: 10 }}>Warning</p>

        <h3 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 20,
          color: 'var(--ink)',
          marginBottom: 12,
          lineHeight: 1.3,
        }}>
          {title}
        </h3>

        <p style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 14,
          color: 'var(--ink-soft)',
          lineHeight: 1.65,
          marginBottom: 28,
        }}>
          {body}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              ...mono,
              fontSize: 10,
              background: 'none',
              border: '1px solid var(--rule)',
              color: 'var(--muted)',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...mono,
              fontSize: 10,
              background: 'var(--accent)',
              border: '1px solid var(--accent)',
              color: '#fff',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
