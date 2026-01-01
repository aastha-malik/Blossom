import { createContext, useContext, ReactNode } from 'react';
import { useLocalTasks } from '../hooks/useLocalTasks';
import type { Task } from '../api/types';

interface LocalTasksContextType {
  tasks: Task[];
  incompleteTasks: Task[];
  addTask: (task: { title: string; priority?: string | null; description?: string | null }) => Task;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  deleteTask: (taskId: number) => void;
}

const LocalTasksContext = createContext<LocalTasksContextType | undefined>(undefined);

export const LocalTasksProvider = ({ children }: { children: ReactNode }) => {
  const localTasks = useLocalTasks();

  return (
    <LocalTasksContext.Provider value={localTasks}>
      {children}
    </LocalTasksContext.Provider>
  );
};

export const useLocalTasksContext = (): LocalTasksContextType => {
  const context = useContext(LocalTasksContext);
  if (context === undefined) {
    throw new Error('useLocalTasksContext must be used within a LocalTasksProvider');
  }
  return context;
};

