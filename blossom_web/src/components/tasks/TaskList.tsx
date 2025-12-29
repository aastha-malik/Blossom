import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import TaskItem from './TaskItem';

interface TaskListProps {
  onError?: (error: Error) => void;
}

export default function TaskList({ onError }: TaskListProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => tasksAPI.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-blue-muted-100 text-lg">
          Please log in to view and manage your tasks! 😊
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Error loading tasks. Please try again.</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-blue-muted-100 text-lg">
          No tasks yet! Add your first task above 😊
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={() => deleteMutation.mutate(task.id)}
          onError={onError}
        />
      ))}
    </div>
  );
}

