import { useState, useEffect } from 'react';
import type { Task } from '../api/types';

const STORAGE_KEY = 'blossom_local_tasks';

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
      id: Date.now(), // Use timestamp as ID for local tasks
      created_at: new Date().toISOString(),
      user_id: 0, // Local user ID
      completed: false,
      priority: task.priority || null,
      description: task.description || null,
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskId: number, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (taskId: number) => {
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

