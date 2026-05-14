import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogoSvg } from '../components/ui/LogoSvg';
import { PetSvg } from '../components/ui/PetSvg';
import { useIsMobile } from '../hooks/useIsMobile';

function getEditionInfo() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  const weekOfYear = Math.ceil(dayOfYear / 7);
  const issueNum = ((weekOfYear - 1) % 13) + 1;
  const month = now.getMonth();
  let season = 'winter';
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  const yr = String(now.getFullYear()).slice(2);
  return { number: String(issueNum).padStart(2, '0'), season, year: yr };
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/today');
    }
  }, [isAuthenticated, navigate]);

  const edition = getEditionInfo();
  const pad = isMobile ? '16px' : '20px 36px';

  return (
    <div style={{ width: '100%', maxWidth: '100vw', minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>

      {/* Nav */}
      <div style={{ padding: pad, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rule)', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoSvg />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: -0.4 }}>Tendr</span>
          {!isMobile && (
            <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'var(--muted)', letterSpacing: 1, borderLeft: '1px solid var(--rule)', paddingLeft: 10, marginLeft: 4 }}>
              no. {edition.number} · {edition.season} '{edition.year}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 12 : 24, alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            style={{ cursor: 'pointer', fontSize: 18, color: 'var(--ink-soft)', background: 'none', border: 'none', padding: '4px 6px', lineHeight: 1 }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link to="/login" style={{ color: 'var(--paper)', background: 'var(--ink)', padding: '8px 16px', fontSize: 12, letterSpacing: 0.5, fontFamily: '"Inter", system-ui, sans-serif', textDecoration: 'none' }}>
            Begin →
          </Link>
        </div>
      </div>

      {/* Eyebrow strip — hidden on mobile to save space */}
      {!isMobile && (
        <div style={{ padding: '28px 36px 12px', textAlign: 'center', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>
            VOL. I  ·  A QUIET ALMANAC FOR GETTING THINGS DONE
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr',
        gap: isMobile ? 28 : 44,
        padding: isMobile ? '28px 16px 24px' : '40px 36px 28px',
        maxWidth: 1200,
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}>

        {/* Hero copy */}
        <div>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: isMobile ? 'clamp(32px, 9vw, 48px)' : 'clamp(48px, 6vw, 78px)',
            lineHeight: 1,
            letterSpacing: isMobile ? -1 : -2,
            fontWeight: 400,
            color: 'var(--ink)',
          }}>
            Tend to your<br />
            <span style={{ fontStyle: 'italic' }}>to-do list</span><br />
            like a friend.
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 24, width: '100%', overflow: 'hidden' }}>
            <div style={{ width: 3, background: 'var(--accent)', alignSelf: 'stretch', flexShrink: 0 }} />
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: isMobile ? 15 : 17, lineHeight: 1.6, color: 'var(--ink-soft)', fontStyle: 'italic', overflowWrap: 'break-word', minWidth: 0 }}>
              Tendr is a journal-shaped productivity app. Every task you finish earns a treat for a small animal that lives inside it. Show up daily and it gets happier; ignore it and, well, it remembers.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 28, alignItems: isMobile ? 'flex-start' : 'center' }}>
            <Link
              to="/signup"
              style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '13px 24px', fontSize: 14, fontWeight: 500, letterSpacing: 0.5, fontFamily: '"Inter", system-ui, sans-serif', textDecoration: 'none' }}
            >
              Adopt your pet →
            </Link>
            <Link
              to="/login"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-soft)', textDecoration: 'underline', textDecorationStyle: 'wavy', textUnderlineOffset: 4, textDecorationColor: 'var(--accent)' }}
            >
              or sign in
            </Link>
          </div>
        </div>

        {/* Sample journal card — shown below copy on mobile, beside on desktop */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--rule)',
          padding: isMobile ? 18 : 22,
          boxShadow: '4px 6px 0 var(--shadow)',
          transform: isMobile ? 'none' : 'rotate(1.4deg)',
          alignSelf: 'start',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
            <span>TUE · 21 APR</span><span>DAY 014</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <PetSvg size={isMobile ? 140 : 190} mood="content" />
          </div>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: isMobile ? 18 : 22, textAlign: 'center', fontStyle: 'italic', color: 'var(--ink)' }}>
            Mochi is content.
          </div>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 4, marginBottom: 14 }}>
            3 of 5 tasks · 22 min of focus
          </div>
          <div style={{ borderTop: '1px dashed var(--rule)', paddingTop: 12 }}>
            {[
              { mark: '☒', text: 'Morning pages', done: true },
              { mark: '☒', text: 'Reply to studio emails', done: true },
              { mark: '☐', text: 'Sketch 10 mushrooms', done: false },
              { mark: '☐', text: '4pm walk', done: false },
            ].map((item, i) => (
              <div key={i} style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, color: item.done ? 'var(--ink)' : 'var(--ink-soft)', marginBottom: 5, display: 'flex', gap: 10 }}>
                <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 14 }}>{item.mark}</span>
                <span style={{ textDecoration: item.done ? 'line-through' : 'none', textDecorationColor: 'var(--accent)', textDecorationThickness: 2 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature trio */}
      <div style={{
        padding: isMobile ? '24px 16px 32px' : '28px 36px 36px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
        gap: isMobile ? 24 : 28,
        borderTop: '1px solid var(--rule)',
        maxWidth: 1200,
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}>
        {[
          { n: 'I.', h: 'A task is a treat.', b: 'Every item you finish becomes food for your pet. High-priority ones are richer meals.', c: 'var(--accent)' },
          { n: 'II.', h: 'Focus is affection.', b: 'Run a Pomodoro session and it counts as time spent with your pet. Show up and they feel it.', c: 'var(--accent-2)' },
          { n: 'III.', h: 'Three weeks at a glance.', b: 'Your last 21 days become a quiet heatmap. Some days bloom, some are bare. Both are honest.', c: 'var(--accent-3)' },
        ].map(f => (
          <div key={f.n}>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontStyle: 'italic', color: f.c, lineHeight: 1, marginBottom: 6 }}>{f.n}</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: isMobile ? 18 : 22, letterSpacing: -0.4, marginBottom: 6, color: 'var(--ink)' }}>{f.h}</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-soft)', fontStyle: 'italic' }}>{f.b}</div>
          </div>
        ))}
      </div>

      {/* Footer strip */}
      <div style={{ borderTop: '1px solid var(--rule)', padding: isMobile ? '16px' : '20px 36px', display: 'flex', justifyContent: 'space-between', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', boxSizing: 'border-box', width: '100%' }}>
        <span>EST. {new Date().getFullYear()}</span>
        <span>PG. 01</span>
      </div>
    </div>
  );
}
