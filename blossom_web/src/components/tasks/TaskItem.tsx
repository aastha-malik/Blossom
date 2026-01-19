import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { tasksAPI } from '../../api/client';
import type { Task } from '../../api/types';

interface TaskItemProps {
  task: Task;
  onDelete: () => void;
  onError?: (error: Error) => void;
  isLocal?: boolean;
  onUpdateLocal?: (updates: Partial<Task>) => void;
}

export default function TaskItem({ task, onDelete, onError, isLocal = false, onUpdateLocal }: TaskItemProps) {
  const queryClient = useQueryClient();

  const toggleCompletionMutation = useMutation({
    mutationFn: (completed: boolean) => tasksAPI.updateCompletion(task.id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['userXP'] });
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const handleToggle = () => {
    if (isLocal && onUpdateLocal) {
      // Update local task immediately
      onUpdateLocal({ completed: !task.completed });
    } else {
      // Use backend API
      toggleCompletionMutation.mutate(!task.completed);
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 bg-dark-surface rounded-lg border border-dark-border hover:border-blue-muted-100/50 transition-colors ${task.completed ? 'opacity-50' : ''}`}>
      <button
        onClick={handleToggle}
        disabled={!isLocal && toggleCompletionMutation.isPending}
        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${task.completed
          ? 'bg-blue-muted-100 border-blue-muted-100'
          : 'border-blue-muted-100 bg-transparent hover:bg-blue-muted-100/20'
          } disabled:opacity-50`}
      >
        {task.completed && <Check size={16} className="text-white" />}
      </button>

      <div className="flex-1">
        <p
          className={`${task.completed ? 'line-through text-text-muted' : 'text-text-primary'
            }`}
        >
          {task.title}
        </p>
        {task.priority && (
          <span
            className={`text-xs px-2 py-1 rounded ${task.priority === 'High'
              ? 'bg-pink-soft-100/20 text-pink-soft-100'
              : task.priority === 'Medium'
                ? 'bg-blue-muted-100/20 text-blue-muted-100'
                : 'bg-purple-gentle-100/20 text-purple-gentle-100'
              }`}
          >
            {task.priority}
          </span>
        )}
      </div>

      <button
        onClick={onDelete}
        className="flex-shrink-0 p-1 text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

