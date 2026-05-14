import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../api/client';
import type { Task } from '../../api/types';

interface TaskItemProps {
  task: Task;
  onDelete: () => void;
  onError?: (error: Error) => void;
  isLocal?: boolean;
  onUpdateLocal?: (updates: Partial<Task>) => void;
}

const XP_BY_PRIORITY: Record<string, number> = { High: 25, Medium: 15, Low: 10 };

export default function TaskItem({ task, onDelete, onError, isLocal = false, onUpdateLocal }: TaskItemProps) {
  const queryClient = useQueryClient();

  const toggleCompletionMutation = useMutation({
    mutationFn: (completed: boolean) => tasksAPI.updateCompletion(task.id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['userXP'] });
    },
    onError: (error: Error) => { onError?.(error); },
  });

  const handleToggle = () => {
    if (isLocal && onUpdateLocal) {
      onUpdateLocal({ completed: !task.completed });
    } else {
      toggleCompletionMutation.mutate(!task.completed);
    }
  };

  const xp = task.xpReward ?? XP_BY_PRIORITY[task.priority ?? ''] ?? 2;
  const rawDate = task.completed ? task.completed_at : (task.due_date ?? task.created_at);
  const dateLabel = rawDate
    ? new Date(rawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;

  const mono: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 9,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px dashed var(--rule)' }}>
      {/* Row 1: checkbox · title · delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button
          onClick={handleToggle}
          disabled={!isLocal && toggleCompletionMutation.isPending}
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            border: '1.5px solid var(--ink)',
            background: task.completed ? 'var(--accent)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
            marginTop: 3,
            opacity: (!isLocal && toggleCompletionMutation.isPending) ? 0.5 : 1,
          }}
        >
          {task.completed && (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 5 L4 8 L9 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div style={{
          flex: 1,
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 16,
          lineHeight: 1.35,
          color: task.completed ? 'var(--muted)' : 'var(--ink)',
          textDecoration: task.completed ? 'line-through' : 'none',
          textDecorationColor: 'var(--accent)',
          textDecorationThickness: 2,
          wordBreak: 'break-word',
        }}>
          {task.title}
        </div>

        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', ...mono, fontSize: 13, color: 'var(--muted)', padding: '2px 0', flexShrink: 0 }}
        >
          ×
        </button>
      </div>

      {/* Row 2: meta tags */}
      <div style={{ display: 'flex', gap: 10, marginTop: 5, paddingLeft: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ ...mono, color: 'var(--ink-soft)' }}>{task.priority ?? 'LOW'}</span>
        {task.category && (
          <span style={{ ...mono, color: 'var(--accent-3)' }}>{task.category}</span>
        )}
        {dateLabel && (
          <span style={{ ...mono, color: 'var(--muted)' }}>{dateLabel}</span>
        )}
        <span style={{ ...mono, color: 'var(--amber)' }}>+{xp}</span>
      </div>
    </div>
  );
}
