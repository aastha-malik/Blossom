import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SESSION_LENGTHS } from '../../utils/constants';
import { formatTimer } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { focusAPI } from '../../api/client';

interface FocusTimerProps {
  petName?: string;
}

export default function FocusTimer({ petName = 'your pet' }: FocusTimerProps) {
  const [selectedLength, setSelectedLength] = useState<number>(SESSION_LENGTHS.MEDIUM);
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_LENGTHS.MEDIUM * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: saveSession } = useMutation({
    mutationFn: (duration_seconds: number) => focusAPI.saveSession(duration_seconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusTotal'] });
    },
  });

  useEffect(() => {
    if (!isRunning && startTimeRef.current !== null) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
      if (elapsed >= 30 && isAuthenticated) {
        saveSession(elapsed);
      }
    }
    if (isRunning) startTimeRef.current = Date.now();
  }, [isRunning, isAuthenticated, saveSession]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
          SIT WITH {petName.toUpperCase()} · {selectedLength} MIN
        </div>
        {isRunning && (
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)' }}>
            stay with it.
          </div>
        )}
      </div>

      {/* Timer — click to start/pause */}
      <div
        onClick={isRunning ? handlePause : handleStart}
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 'clamp(52px, 18vw, 88px)',
          letterSpacing: -4,
          lineHeight: 1,
          fontFeatureSettings: '"tnum"',
          color: 'var(--accent)',
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: 16,
        }}
      >
        {formatTimer(timeLeft)}
      </div>

      {/* Progress bar */}
      <svg width="100%" height="22" viewBox="0 0 300 22" preserveAspectRatio="none" style={{ display: 'block', marginBottom: 12 }}>
        <line x1="0" y1="11" x2="300" y2="11" stroke="var(--rule)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="0" y1="11" x2={300 * progressPct / 100} y2="11" stroke="var(--accent)" strokeWidth="2" />
      </svg>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {/* Duration selector */}
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
                borderBottom: selectedLength === minutes ? '2px solid var(--accent)' : '2px solid transparent',
                paddingBottom: 1,
                background: 'none',
                border: 'none',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: selectedLength === minutes ? 'var(--accent)' : 'transparent',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning && selectedLength !== minutes ? 0.4 : 1,
                padding: '0 0 2px 0',
              }}
            >
              {minutes} min
            </button>
          ))}
        </div>

        {/* Action buttons */}
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
        </div>
      </div>
    </div>
  );
}
