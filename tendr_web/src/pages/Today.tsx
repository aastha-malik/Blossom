import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI, petsAPI, statsAPI, userAPI, focusAPI } from '../api/client';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import FocusTimer from '../components/focus/FocusTimer';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { PetSprite, getStage, deriveMood } from '../components/PetSprite';
import type { Species } from '../components/PetSprite';
import { Heatmap } from '../components/ui/Heatmap';
import type { Task } from '../api/types';

function getMoodSubtitle(streak: number, completedToday: number): string {
  if (completedToday >= 3) return 'Sun\'s out. Mochi is doing zoomies.';
  if (completedToday >= 1) return 'A gentle drizzle. Mochi is watching the window.';
  if (streak >= 3) return 'Overcast, but familiar. Mochi is waiting for you.';
  return 'A light drizzle. Mochi is sleeping in.';
}


function formatDayCounter(petAge?: number): string {
  if (!petAge) return 'DAY 001';
  return `DAY ${String(Math.floor(petAge)).padStart(3, '0')}`;
}

function getDateEyebrow(): string {
  const now = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]}`;
}


function buildHeatmapData(tasks: Task[]): number[] {
  // 21 days: index 0 = 20 days ago, index 20 = today
  const counts = Array(21).fill(0);
  const now = new Date();
  tasks.forEach(task => {
    if (!task.completed) return;
    const d = new Date(task.created_at);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff >= 0 && diff < 21) counts[20 - diff]++;
  });
  return counts;
}

export default function Today() {
  const { isAuthenticated } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const CATEGORIES = ['Work', 'Personal', 'Home', 'Friends', 'Health'];

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

  const { data: userXP } = useQuery({
    queryKey: ['userXP'],
    queryFn: () => userAPI.getXP(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  // Get userId from tasks or pets for stats
  const userId = tasks[0]?.user_id ?? pets[0]?.user_id;
  const { data: stats } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => statsAPI.getStats(userId!),
    enabled: isAuthenticated && !!userId,
  });

  const { data: focusTotal } = useQuery({
    queryKey: ['focusTotal'],
    queryFn: () => focusAPI.getTotal(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const pet = pets.find(p => p.is_alive) ?? pets[0];
  const completedToday = tasks.filter(t => {
    if (!t.completed) return false;
    const d = new Date(t.created_at);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const streak = stats?.streaks ?? 0;
  const tasksCompleted = stats?.num_task_completed ?? completedToday;
  const heatmapData = buildHeatmapData(tasks);

  const totalFocusSecs = focusTotal?.total_seconds ?? 0;
  const focusHrs = Math.floor(totalFocusSecs / 3600);
  const focusMins = Math.floor((totalFocusSecs % 3600) / 60);
  const focusDisplay = focusHrs === 0
    ? `${focusMins} min`
    : focusMins === 0
      ? `${focusHrs} ${focusHrs === 1 ? 'hr' : 'hrs'}`
      : `${focusHrs} ${focusHrs === 1 ? 'hr' : 'hrs'} ${focusMins} min`;

  const petHunger = pet?.hunger ?? 50;
  const petHappiness = 100 - petHunger;
  const petSpecies = (pet?.type?.toLowerCase() === 'cat' ? 'cat' : 'dog') as Species;
  const petStage = getStage(pet?.age ?? 0);
  const petMood = pet ? deriveMood(pet.hunger, pet.last_fed) : 'content';
  const petName = pet?.name ?? 'Tendr';
  const dayCounter = formatDayCounter(pet?.age);

  const monoStyle: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 10,
    letterSpacing: '2px',
    color: 'var(--muted)',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '24px 36px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 30, maxWidth: 1200, margin: '0 auto' }}>

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Eyebrow */}
          <div style={{ ...monoStyle, marginBottom: 4 }}>
            {getDateEyebrow()} · {dayCounter} WITH {petName.toUpperCase()}
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 44, letterSpacing: -1.2, lineHeight: 1, color: 'var(--ink)', margin: '0 0 6px' }}>
            Today's page.
          </h1>

          {/* Mood subtitle */}
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-soft)', marginBottom: 22 }}>
            {getMoodSubtitle(streak, completedToday)}
          </div>

          {/* Task list section */}
          <div style={{ marginTop: 22 }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', ...monoStyle, borderBottom: '1px solid var(--rule)', paddingBottom: 6, marginBottom: 8 }}>
              <span>TO DO</span>
              <span>{tasks.filter(t => !t.completed).length} items · {tasks.filter(t => !t.completed).reduce((s, t) => s + (t.xpReward ?? (t.priority === 'High' ? 25 : t.priority === 'Medium' ? 15 : 10)), 0)} xp possible</span>
            </div>

            {/* Category filter bar */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(activeCategory === c ? '' : c)}
                  style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 9,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    background: activeCategory === c ? 'var(--accent-3)' : 'transparent',
                    color: activeCategory === c ? 'var(--paper)' : 'var(--muted)',
                    border: `1px solid ${activeCategory === c ? 'var(--accent-3)' : 'var(--rule)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <TaskList onError={e => showToast(e.message, 'error')} activeCategory={activeCategory} />
            <TaskForm
              onSuccess={() => showToast('Task added.', 'success')}
              onError={e => showToast(e.message, 'error')}
            />
          </div>

          {/* Ledger card */}
          <div style={{ marginTop: 22, border: '1px solid var(--rule)', padding: 20, background: 'var(--card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={monoStyle}>THE LEDGER · LAST 28 DAYS</div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontStyle: 'italic', marginTop: 2, color: 'var(--ink)' }}>
                  How the season has been treating you.
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 16, paddingBottom: 14, borderBottom: '1px dashed var(--rule)' }}>
              {[
                ['TASKS FINISHED', String(tasksCompleted), 'var(--accent)'],
                ['TIME TOGETHER', focusDisplay, 'var(--accent-3)'],
                ['STREAK', `${streak} days`, 'var(--amber)'],
              ].map(([label, value, color]) => (
                <div key={label}>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 500, color, letterSpacing: -1, fontFeatureSettings: '"tnum"', marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
            <Heatmap data={heatmapData} />
          </div>

          {/* Focus card */}
          <FocusTimer />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {/* Pet eyebrow */}
          <div style={{ ...monoStyle, marginBottom: 6 }}>
            {petName.toUpperCase()} · FOX-MOCHI · {dayCounter}
          </div>

          {/* Pet card */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--rule)', padding: 22, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PetSprite species={petSpecies} stage={petStage} mood={petMood} size={210} />
            </div>

            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 26, fontStyle: 'italic', letterSpacing: -0.4, marginTop: 4, color: 'var(--ink)' }}>
              {petMood === 'happy' ? '"perfectly content"'
                : petMood === 'sad' ? '"a bit lonely"'
                : petMood === 'sleepy' ? '"just waking up"'
                : '"doing alright"'}
            </div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>
              {petHunger > 60 ? 'getting hungry — feed when you can.' : 'doing well for now.'}
            </div>

            {/* Progress bars: Mood + Belly */}
            <div style={{ marginTop: 18, textAlign: 'left' }}>
              {[
                ['Mood', petHappiness, 'var(--accent)'],
                ['Belly', 100 - petHunger, 'var(--accent-2)'],
              ].map(([label, value, color]) => (
                <div key={label as string} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 30px', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)' }}>{label as string}</div>
                  <div style={{ height: 6, background: 'var(--paper-deep)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${value}%`, height: '100%', background: color as string }} />
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'var(--muted)', textAlign: 'right' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Feed button */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '11px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.3,
                  textAlign: 'center',
                  cursor: (isAuthenticated && (userXP?.xp ?? 0) >= 35) ? 'pointer' : 'not-allowed',
                  opacity: (isAuthenticated && (userXP?.xp ?? 0) < 35) ? 0.5 : 1,
                }}
              >
                Offer a treat · 35 xp
              </div>
            </div>
          </div>

        </div>
      </div>

      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
