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

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '24px 1fr auto auto auto',
      alignItems: 'center',
      gap: 14,
      padding: '11px 0',
      borderBottom: '1px dashed var(--rule)',
    }}>
      {/* Circle checkbox */}
      <button
        onClick={handleToggle}
        disabled={!isLocal && toggleCompletionMutation.isPending}
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          border: `1.5px solid var(--ink)`,
          background: task.completed ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          padding: 0,
          opacity: (!isLocal && toggleCompletionMutation.isPending) ? 0.5 : 1,
        }}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 5 L4 8 L9 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Task title */}
      <div style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: 17,
        color: task.completed ? 'var(--muted)' : 'var(--ink)',
        textDecoration: task.completed ? 'line-through' : 'none',
        textDecorationColor: 'var(--accent)',
        textDecorationThickness: 2,
      }}>
        {task.title}
      </div>

      {/* Priority tag */}
      <div style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '1.5px',
        color: 'var(--ink-soft)',
        textTransform: 'uppercase',
      }}>
        {task.priority ?? 'LOW'}
      </div>

      {/* Category tag */}
      <div style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 9,
        letterSpacing: '1.5px',
        color: task.category ? 'var(--accent-3)' : 'transparent',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {task.category ?? '·'}
      </div>

      {/* XP + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11,
          color: 'var(--amber)',
          fontFeatureSettings: '"tnum"',
        }}>
          +{xp}
        </span>
        <button
          onClick={onDelete}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 12,
            color: 'var(--muted)',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
