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

export default function TaskForm({ onSuccess, onError }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string>(TASK_PRIORITIES.MEDIUM);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { addTask: addLocalTask } = useLocalTasksContext();

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskCreate) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTitle('');
      setPriority(TASK_PRIORITIES.MEDIUM);
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isAuthenticated) {
      // Use backend API when logged in
      createTaskMutation.mutate({ title: title.trim(), priority });
    } else {
      // Use local storage when not logged in
      try {
        addLocalTask({
          title: title.trim(),
          priority: priority || TASK_PRIORITIES.MEDIUM,
        });
        setTitle('');
        setPriority(TASK_PRIORITIES.MEDIUM);
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Add New Task</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to focus on?"
          className="input-field w-full"
        />

        <div className="flex gap-3">
          {Object.values(TASK_PRIORITIES).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 ${
                priority === p
                  ? 'bg-blue-muted-100 text-white'
                  : 'bg-dark-surface text-text-secondary hover:bg-dark-border'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!title.trim() || createTaskMutation.isPending}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </div>
  );
}

