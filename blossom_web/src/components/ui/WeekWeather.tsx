interface WeekWeatherProps {
  // Array of 7 task counts [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  counts?: number[];
  // Index of today (0=Mon … 6=Sun)
  todayIndex?: number;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getGlyph(count: number): string {
  if (count === 0) return '☂';
  if (count <= 2) return '☁';
  if (count <= 4) return '⛅';
  return '☀';
}

function getSummary(counts: number[]): string {
  const sunny = counts.filter(c => c >= 5).length;
  if (sunny === 0) return 'a quiet week.';
  if (sunny >= 5) return `brilliant week · ${sunny} sunny days`;
  return `good week · ${sunny} sunny day${sunny === 1 ? '' : 's'}`;
}

export function WeekWeather({ counts = [0, 0, 0, 0, 0, 0, 0], todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1 }: WeekWeatherProps) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--card)', border: '1px solid var(--rule)' }}>
      <div style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '2px',
        color: 'var(--muted)',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        WEEK'S WEATHER
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {DAYS.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              padding: '6px 0',
              background: i === todayIndex ? 'var(--hi)' : 'transparent',
            }}
          >
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9,
              color: 'var(--muted)',
              letterSpacing: 1,
            }}>{d}</div>
            <div style={{ fontSize: 18, marginTop: 2, color: 'var(--ink)' }}>{getGlyph(counts[i] ?? 0)}</div>
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontStyle: 'italic',
        fontSize: 12,
        color: 'var(--ink-soft)',
        marginTop: 8,
        textAlign: 'center',
      }}>
        {getSummary(counts)}
      </div>
    </div>
  );
}
