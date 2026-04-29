import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../api/client';
import { TASK_PRIORITIES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalTasksContext } from '../../contexts/LocalTasksContext';
import type { TaskCreate } from '../../api/types';

interface TaskFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const TASK_CATEGORIES = ['Work', 'Personal', 'Home', 'Friends', 'Health'];

export default function TaskForm({ onSuccess, onError }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string>(TASK_PRIORITIES.MEDIUM);
  const [category, setCategory] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { addTask: addLocalTask } = useLocalTasksContext();

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskCreate) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTitle('');
      setPriority(TASK_PRIORITIES.MEDIUM);
      setCategory('');
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => { onError?.(error); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (isAuthenticated) {
      createTaskMutation.mutate({ title: title.trim(), priority, ...(category ? { category } : {}) });
    } else {
      try {
        addLocalTask({ title: title.trim(), priority: priority || TASK_PRIORITIES.MEDIUM });
        setTitle('');
        setPriority(TASK_PRIORITIES.MEDIUM);
        setCategory('');
        setIsOpen(false);
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 14,
          color: 'var(--muted)',
          padding: '8px 0',
          cursor: 'pointer',
          borderBottom: '1px dashed var(--rule)',
        }}
      >
        + add another…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ borderBottom: '1px dashed var(--rule)', paddingBottom: 10, marginBottom: 4 }}>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="what needs doing…"
        autoFocus
        style={{
          width: '100%',
          padding: '8px 0',
          border: 'none',
          borderBottom: '1.5px solid var(--accent)',
          background: 'transparent',
          color: 'var(--ink)',
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 16,
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: 8,
        }}
      />
      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {TASK_CATEGORIES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(category === c ? '' : c)}
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '3px 8px',
              background: category === c ? 'var(--accent-3)' : 'transparent',
              color: category === c ? 'var(--paper)' : 'var(--muted)',
              border: `1px solid ${category === c ? 'var(--accent-3)' : 'var(--rule)'}`,
              cursor: 'pointer',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {Object.values(TASK_PRIORITIES).map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '4px 8px',
              background: priority === p ? 'var(--ink)' : 'transparent',
              color: priority === p ? 'var(--paper)' : 'var(--muted)',
              border: `1px solid ${priority === p ? 'var(--ink)' : 'var(--rule)'}`,
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          type="submit"
          disabled={!title.trim() || createTaskMutation.isPending}
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            padding: '5px 12px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            border: 'none',
            cursor: title.trim() ? 'pointer' : 'not-allowed',
            opacity: (!title.trim() || createTaskMutation.isPending) ? 0.5 : 1,
          }}
        >
          {createTaskMutation.isPending ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setTitle(''); setCategory(''); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, color: 'var(--muted)', padding: 0 }}
        >
          ×
        </button>
      </div>
    </form>
  );
}
