interface HeatmapProps {
  // Array of 21 activity values (0–1 range or task count, will be normalized)
  data?: number[];
}

export function Heatmap({ data }: HeatmapProps) {
  const days = data && data.length === 21 ? data : Array(21).fill(0);
  const max = Math.max(...days, 1);
  const normalized = days.map(v => v / max);

  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        {normalized.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 22,
              background: v === 0
                ? 'var(--rule-soft)'
                : `rgba(var(--accent-rgb, 201,78,58), ${0.15 + v * 0.85})`,
              backgroundColor: v === 0 ? 'var(--rule-soft)' : undefined,
              borderRadius: 2,
              border: '1px solid var(--rule-soft)',
              opacity: v === 0 ? 1 : undefined,
            }}
          />
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 9,
        color: 'var(--muted)',
        marginTop: 6,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}>
        <span>21 D AGO</span>
        <span style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontStyle: 'italic',
          textTransform: 'none',
          letterSpacing: 0,
          fontSize: 11,
        }}>each square, a day</span>
        <span>TODAY</span>
      </div>
    </div>
  );
}
