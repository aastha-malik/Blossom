import { useState, useEffect, useRef } from 'react';
import { SESSION_LENGTHS } from '../../utils/constants';
import { formatTimer } from '../../utils/formatters';

export default function FocusTimer() {
  const [selectedLength, setSelectedLength] = useState<number>(SESSION_LENGTHS.MEDIUM);
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_LENGTHS.MEDIUM * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { setIsRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (timeLeft === 0) setTimeLeft(selectedLength * 60);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedLength * 60);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const handleLengthChange = (minutes: number) => {
    if (!isRunning) { setSelectedLength(minutes); setTimeLeft(minutes * 60); }
  };

  const totalSeconds = selectedLength * 60;
  const progressPct = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div style={{ border: '1.5px solid var(--ink)', padding: 20, background: 'var(--card)', marginTop: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
          SIT WITH MOCHI · {selectedLength} MIN
        </div>
        {isRunning && (
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)' }}>
            stay with it.
          </div>
        )}
      </div>

      {/* Timer + track */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 8 }}>
        <div style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 88,
          letterSpacing: -4,
          lineHeight: 1,
          fontFeatureSettings: '"tnum"',
          color: 'var(--accent)',
          cursor: 'pointer',
          userSelect: 'none',
        }} onClick={isRunning ? handlePause : handleStart}>
          {formatTimer(timeLeft)}
        </div>

        <div style={{ flex: 1 }}>
          <svg width="100%" height="22" viewBox="0 0 300 22" preserveAspectRatio="none">
            <line x1="0" y1="11" x2="300" y2="11" stroke="var(--rule)" strokeWidth="1" strokeDasharray="3 4" />
            <line x1="0" y1="11" x2={300 * progressPct / 100} y2="11" stroke="var(--accent)" strokeWidth="2" />
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.values(SESSION_LENGTHS).map(minutes => (
                <button
                  key={minutes}
                  onClick={() => handleLengthChange(minutes)}
                  disabled={isRunning}
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 14,
                    color: selectedLength === minutes ? 'var(--ink)' : 'var(--muted)',
                    fontStyle: selectedLength === minutes ? 'normal' : 'italic',
                    borderBottom: selectedLength === minutes ? '2px solid var(--accent)' : 'none',
                    paddingBottom: 1,
                    background: 'none',
                    border: 'none',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    opacity: isRunning && selectedLength !== minutes ? 0.4 : 1,
                  }}
                >
                  {minutes} min
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={isRunning ? handlePause : handleStart}
                style={{
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  padding: '6px 14px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={handleReset}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}
              >
                Reset
              </button>
              <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                PAUSE · SPACE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

