import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI, statsAPI, petsAPI } from '../api/client';
import type { Task } from '../api/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Returns 0=Mon … 6=Sun for the first day of the month
function firstDayOfWeek(month: number, year: number): number {
  const d = new Date(year, month, 1).getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;
}

function buildMonthCounts(tasks: Task[], month: number, year: number): number[] {
  const days = daysInMonth(month, year);
  const counts = Array(days).fill(0);
  tasks.forEach(t => {
    if (!t.completed) return;
    const d = new Date(t.created_at);
    if (d.getFullYear() === year && d.getMonth() === month) {
      counts[d.getDate() - 1]++;
    }
  });
  return counts;
}

function buildTagCounts(tasks: Task[]): Record<string, number> {
  const counts: Record<string, number> = {};
  tasks.forEach(t => {
    if (!t.completed) return;
    const tag = (t.priority ?? 'LOW').toUpperCase();
    counts[tag] = (counts[tag] ?? 0) + 1;
  });
  return counts;
}

const monoStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '2px',
  color: 'var(--muted)',
  textTransform: 'uppercase',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Ledger() {
  const { isAuthenticated } = useAuth();
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll(),
    enabled: isAuthenticated,
  });

  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsAPI.getAll(),
    enabled: isAuthenticated,
  });

  const userId = tasks[0]?.user_id ?? pets[0]?.user_id;
  const { data: stats } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => statsAPI.getStats(userId!),
    enabled: isAuthenticated && !!userId,
  });

  const monthCounts = buildMonthCounts(tasks, viewMonth, viewYear);
  const tagCounts = buildTagCounts(tasks);
  const tagMax = Math.max(...Object.values(tagCounts), 1);
  const maxInMonth = Math.max(...monthCounts, 1);

  const streak = stats?.streaks ?? 0;
  const tasksCompleted = stats?.num_task_completed ?? tasks.filter(t => t.completed).length;
  const timeEst = Math.floor((stats?.xps ?? 0) / 10);

  const tagColors: Record<string, string> = {
    HIGH: 'var(--accent)',
    MEDIUM: 'var(--accent-3)',
    LOW: 'var(--accent-2)',
  };

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const goForward = () => {
    const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
  const startOffset = firstDayOfWeek(viewMonth, viewYear); // empty cells before day 1
  const totalMonthTasks = monthCounts.reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '24px 36px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ ...monoStyle, marginBottom: 4 }}>THE LEDGER · YOUR RECORD</div>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 44, letterSpacing: -1.2, lineHeight: 1, color: 'var(--ink)', margin: '0 0 4px' }}>
          The record.
        </h1>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-soft)', marginBottom: 30 }}>
          Everything you have done, quietly counted.
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>
          {([
            ['TASKS FINISHED', String(tasksCompleted), 'var(--accent)'],
            ['TIME TOGETHER', `${timeEst} ${timeEst === 1 ? 'hr' : 'hrs'}`, 'var(--accent-3)'],
            ['STREAK', `${streak} days`, 'var(--amber)'],
          ] as [string, string, string][]).map(([label, value, color]) => (
            <div key={label} style={{ border: '1px solid var(--rule)', background: 'var(--card)', padding: '18px 20px' }}>
              <div style={{ ...monoStyle, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 44, fontWeight: 500, color, letterSpacing: -1.5, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Monthly calendar heatmap */}
        <div style={{ border: '1px solid var(--rule)', background: 'var(--card)', padding: 22, marginBottom: 20 }}>

          {/* Header: nav + month/year */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ ...monoStyle, marginBottom: 4 }}>MONTHLY VIEW</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>
                {MONTH_NAMES[viewMonth]} {viewYear}.
              </div>
              <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                {totalMonthTasks} task{totalMonthTasks !== 1 ? 's' : ''} completed
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={goBack}
                style={{ background: 'none', border: '1px solid var(--rule)', padding: '6px 12px', cursor: 'pointer', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12, color: 'var(--ink-soft)' }}
              >
                ‹
              </button>
              <button
                onClick={goForward}
                disabled={isCurrentMonth}
                style={{ background: 'none', border: '1px solid var(--rule)', padding: '6px 12px', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12, color: 'var(--ink-soft)', opacity: isCurrentMonth ? 0.35 : 1 }}
              >
                ›
              </button>
            </div>
          </div>

          {/* Day-of-week labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ ...monoStyle, fontSize: 9, textAlign: 'center', paddingBottom: 4 }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {/* Empty offset cells */}
            {Array(startOffset).fill(null).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {monthCounts.map((count, i) => {
              const day = i + 1;
              const isToday = isCurrentMonth && day === now.getDate();
              const opacity = count === 0 ? 1 : 0.2 + (count / maxInMonth) * 0.8;
              return (
                <div
                  key={day}
                  title={`${day} ${MONTH_NAMES[viewMonth]} — ${count} task${count !== 1 ? 's' : ''}`}
                  style={{
                    height: 32,
                    background: count === 0 ? 'var(--rule-soft)' : 'var(--accent)',
                    opacity: count === 0 ? 1 : opacity,
                    border: isToday ? '1.5px solid var(--accent)' : '1px solid var(--rule-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <span style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 9,
                    color: count > 0 ? 'var(--paper)' : 'var(--muted)',
                    fontFeatureSettings: '"tnum"',
                    opacity: count > 0 ? Math.max(0.8, opacity) : 1,
                  }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, ...monoStyle, fontSize: 9 }}>
            <span>NO ACTIVITY</span>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--muted)' }}>each square, a day</span>
            <span>MOST ACTIVE</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Priority breakdown */}
          <div style={{ border: '1px solid var(--rule)', background: 'var(--card)', padding: 22 }}>
            <div style={{ ...monoStyle, marginBottom: 6 }}>BY PRIORITY</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'var(--ink)', marginBottom: 16 }}>
              Where your effort went.
            </div>
            {Object.entries(tagCounts).length === 0 ? (
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)' }}>
                no completed tasks yet.
              </div>
            ) : Object.entries(tagCounts).map(([tag, count]) => (
              <div key={tag} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ ...monoStyle, fontSize: 9 }}>{tag}</div>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'var(--ink-soft)', fontFeatureSettings: '"tnum"' }}>{count}</div>
                </div>
                <div style={{ height: 6, background: 'var(--paper-deep)' }}>
                  <div style={{ width: `${(count / tagMax) * 100}%`, height: '100%', background: tagColors[tag] ?? 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Streak */}
          <div style={{ border: '1px solid var(--rule)', background: 'var(--card)', padding: 22 }}>
            <div style={{ ...monoStyle, marginBottom: 6 }}>STREAK</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'var(--ink)', marginBottom: 16 }}>
              Continuity is the point.
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 56, fontWeight: 500, color: 'var(--amber)', letterSpacing: -2, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
                {streak}
              </div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-soft)' }}>
                days running
              </div>
            </div>
            <div style={{ borderTop: '1px dashed var(--rule)', paddingTop: 14 }}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                {streak >= 7
                  ? 'A proper run. Keep the thread.'
                  : streak >= 3
                  ? 'Three days in. Keep going.'
                  : streak >= 1
                  ? 'Started. The hardest part.'
                  : 'Not yet. Tomorrow is fine.'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
