import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalTasksContext } from '../../contexts/LocalTasksContext';
import TaskItem from './TaskItem';
import type { Task } from '../../api/types';

interface TaskListProps {
  onError?: (error: Error) => void;
  activeCategory?: string;
}

export default function TaskList({ onError, activeCategory }: TaskListProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { tasks: localTasks, updateTask: updateLocalTask, deleteTask: deleteLocalTask } = useLocalTasksContext();

  // Fetch from backend when authenticated
  const { data: backendTasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => tasksAPI.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  // Use local tasks when not authenticated, backend tasks when authenticated
  // Backend now returns all tasks (completed and incomplete)
  const tasks = isAuthenticated ? backendTasks : localTasks;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPast = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  // A task is "late" if it's incomplete and its due_date (or created_at fallback) is before today
  const isLate = (t: Task) =>
    !t.completed && isPast(t.due_date ?? t.created_at);

  const visibleTasks = (tasks || []).filter(t => {
    if (t.completed) return !isPast(t.completed_at ?? t.created_at);
    return !isLate(t);
  });

  // Apply category filter if active
  const categoryFiltered = activeCategory
    ? visibleTasks.filter(t => (t.category ?? '').toLowerCase() === activeCategory.toLowerCase())
    : visibleTasks;

  const sortedTasks = [...categoryFiltered].sort((a, b) => {
    // Incomplete tasks come first (completed: false = 0, true = 1)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // If both have same completion status, sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isAuthenticated && isLoading) {
    return (
      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', padding: '12px 0' }}>
        Loading…
      </div>
    );
  }

  if (isAuthenticated && error) {
    return (
      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--accent)', padding: '12px 0' }}>
        Could not load tasks. Please try again.
      </div>
    );
  }

  if (!sortedTasks || sortedTasks.length === 0) {
    return (
      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', padding: '12px 0', borderBottom: '1px dashed var(--rule)' }}>
        a light page. no tasks yet.
      </div>
    );
  }

  return (
    <div>
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={() => {
            if (isAuthenticated) {
              deleteMutation.mutate(task.id);
            } else {
              deleteLocalTask(task.id);
            }
          }}
          onError={onError}
          isLocal={!isAuthenticated}
          onUpdateLocal={(updates) => updateLocalTask(task.id, updates)}
        />
      ))}
    </div>
  );
}

