import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatTimer } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { focusAPI } from '../../api/client';

interface FocusTimerProps {
  petName?: string;
}

const DURATION_OPTIONS = [
  { label: '5s',     secs: 5,       display: '5 SEC'  },
  { label: '25 min', secs: 25 * 60, display: '25 MIN' },
  { label: '45 min', secs: 45 * 60, display: '45 MIN' },
  { label: '60 min', secs: 60 * 60, display: '60 MIN' },
] as const;

const DEFAULT_SECS = 45 * 60;
const MIN_SAVE_SECS = 5;
const ORIGINAL_TITLE = document.title;

export default function FocusTimer({ petName = 'your pet' }: FocusTimerProps) {
  const [selectedSecs, setSelectedSecs] = useState<number>(DEFAULT_SECS);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SECS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: saveSession } = useMutation({
    mutationFn: (duration_seconds: number) => focusAPI.saveSession(duration_seconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusTotal'] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: (err: Error) => {
      setSaveStatus('error');
      setSaveError(err.message ?? 'Save failed');
      setTimeout(() => setSaveStatus('idle'), 5000);
    },
  });

  // Tab title shows live countdown while running
  useEffect(() => {
    if (isRunning) {
      document.title = `⏱ ${formatTimer(timeLeft)} — Tendr`;
    } else {
      document.title = ORIGINAL_TITLE;
    }
    return () => { document.title = ORIGINAL_TITLE; };
  }, [isRunning, timeLeft]);

  // ESC key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isRunning && startTimeRef.current !== null) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
      if (elapsed >= MIN_SAVE_SECS && isAuthenticated) {
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
    if (timeLeft === 0) setTimeLeft(selectedSecs);
    setIsRunning(true);
  };
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedSecs);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };
  const handleLengthChange = (secs: number) => {
    if (!isRunning) { setSelectedSecs(secs); setTimeLeft(secs); }
  };

  const selectedOption = DURATION_OPTIONS.find(o => o.secs === selectedSecs);
  const progressPct = selectedSecs > 0 ? ((selectedSecs - timeLeft) / selectedSecs) * 100 : 0;

  const controls = (fs: boolean) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', gap: fs ? 16 : 10 }}>
        {DURATION_OPTIONS.map(({ label, secs }) => (
          <button
            key={secs}
            onClick={() => handleLengthChange(secs)}
            disabled={isRunning}
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: fs ? 16 : 14,
              color: selectedSecs === secs ? 'var(--ink)' : 'var(--muted)',
              fontStyle: selectedSecs === secs ? 'normal' : 'italic',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${selectedSecs === secs ? 'var(--accent)' : 'transparent'}`,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning && selectedSecs !== secs ? 0.4 : 1,
              padding: '0 0 2px 0',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={isRunning ? handlePause : handleStart}
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: fs ? '10px 24px' : '6px 14px',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: fs ? 14 : 12,
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
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 10vw',
      }}>
        {/* Exit button */}
        <button
          onClick={() => setIsFullscreen(false)}
          title="Exit fullscreen (Esc)"
          style={{
            position: 'absolute',
            top: 24,
            right: 28,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            color: 'var(--muted)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            padding: '4px 8px',
          }}
        >
          esc ✕
        </button>

        {/* Label */}
        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
          SIT WITH {petName.toUpperCase()} · {selectedOption?.display ?? ''}
          {isRunning && (
            <span style={{ marginLeft: 24, fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', letterSpacing: 0, fontSize: 14, color: 'var(--ink-soft)', textTransform: 'none' }}>
              stay with it.
            </span>
          )}
          {saveStatus === 'saved' && (
            <span style={{ marginLeft: 16, color: 'var(--accent-3)', letterSpacing: 1 }}>saved ✓</span>
          )}
          {saveStatus === 'error' && (
            <span style={{ marginLeft: 16, color: 'tomato', letterSpacing: 1 }} title={saveError}>save failed ✗</span>
          )}
        </div>

        {/* Big timer */}
        <div
          onClick={isRunning ? handlePause : handleStart}
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 'clamp(96px, 20vw, 180px)',
            letterSpacing: -6,
            lineHeight: 1,
            fontFeatureSettings: '"tnum"',
            color: 'var(--accent)',
            cursor: 'pointer',
            userSelect: 'none',
            marginBottom: 32,
          }}
        >
          {formatTimer(timeLeft)}
        </div>

        {/* Progress bar */}
        <svg width="100%" height="22" viewBox="0 0 300 22" preserveAspectRatio="none" style={{ display: 'block', marginBottom: 32 }}>
          <line x1="0" y1="11" x2="300" y2="11" stroke="var(--rule)" strokeWidth="1" strokeDasharray="3 4" />
          <line x1="0" y1="11" x2={300 * progressPct / 100} y2="11" stroke="var(--accent)" strokeWidth="2" />
        </svg>

        {controls(true)}
      </div>
    );
  }

  // Normal card
  return (
    <div style={{ border: '1.5px solid var(--ink)', padding: 20, background: 'var(--card)', marginTop: 22 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
          SIT WITH {petName.toUpperCase()} · {selectedOption?.display ?? ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isRunning && (
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)' }}>
              stay with it.
            </div>
          )}
          {saveStatus === 'saved' && (
            <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, letterSpacing: 1, color: 'var(--accent-3)', textTransform: 'uppercase' }}>
              saved ✓
            </div>
          )}
          {saveStatus === 'error' && (
            <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, letterSpacing: 1, color: 'tomato', textTransform: 'uppercase' }} title={saveError}>
              save failed ✗
            </div>
          )}
          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 2px',
              color: 'var(--muted)',
              lineHeight: 1,
              fontSize: 13,
              opacity: 0.7,
            }}
          >
            ⛶
          </button>
        </div>
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

      {controls(false)}
    </div>
  );
}
