import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalTasksContext } from '../../contexts/LocalTasksContext';
import TaskItem from './TaskItem';

interface TaskListProps {
  onError?: (error: Error) => void;
}

export default function TaskList({ onError }: TaskListProps) {
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
    mutationFn: (taskId: number) => tasksAPI.delete(taskId),
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

  // Sort tasks: incomplete first, completed last
  // Update: Only show incomplete tasks OR tasks completed today
  const filteredTasks = (tasks || []).filter(task => {
    if (!task.completed) return true;

    // For completed tasks, check if they were created today
    const createdAt = new Date(task.created_at);
    const today = new Date();

    return createdAt.getFullYear() === today.getFullYear() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getDate() === today.getDate();
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Incomplete tasks come first (completed: false = 0, true = 1)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // If both have same completion status, sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isAuthenticated && isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading tasks...</p>
      </div>
    );
  }

  if (isAuthenticated && error) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Error loading tasks. Please try again.</p>
      </div>
    );
  }

  if (!sortedTasks || sortedTasks.length === 0) {
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

