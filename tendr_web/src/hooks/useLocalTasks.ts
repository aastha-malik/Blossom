import { useState, useEffect } from 'react';
import type { Task } from '../api/types';

const STORAGE_KEY = 'tendr_local_tasks';

export const useLocalTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (task: { title: string; priority?: string | null; description?: string | null }) => {
    const newTask: Task = {
      ...task,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_id: 'local',
      completed: false,
      priority: task.priority || null,
      description: task.description || null,
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const getIncompleteTasks = () => {
    return tasks.filter((task) => !task.completed);
  };

  return {
    tasks,
    incompleteTasks: getIncompleteTasks(),
    addTask,
    updateTask,
    deleteTask,
    setTasks,
  };
};

