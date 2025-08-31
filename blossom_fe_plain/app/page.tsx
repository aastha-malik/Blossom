"use client";

import React, { useEffect, useState } from "react";
import {
  fetchTasks, createTask, updateTaskCompleted, deleteTask,
  fetchPets, createPet,
  fetchStats, login, register
} from "../lib/api";

// Type definitions
interface Task {
  id: number; // Ensure this matches your FastAPI model (int)
  title: string;
  completed?: boolean;
  created?: string;
  xpReward?: number;
}

interface Pet {
  id: number;
  name: string;
  age?: number;
  hunger?: number;
  last_fed?: string;
}

export default function BlossomApp() {
  const [tab, setTab] = useState<'tasks' | 'pet' | 'analytics' | 'auth'>('tasks');

  // --- Authentication State ---
  const [token, setToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Task State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // --- Pet State ---
  const [pets, setPets] = useState<Pet[]>([]);
  const [newPet, setNewPet] = useState({ name: '', age: 1, hunger: 100 });
  const [petLoading, setPetLoading] = useState(false);
  const [petError, setPetError] = useState<string | null>(null);

  // --- Stats State ---
  const [stats, setStats] = useState<any>(null);
  const [statsPeriod, setStatsPeriod] = useState<'all_time' | 'today' | 'week' | 'month' | 'year'>('all_time');
  const [statsUserId, setStatsUserId] = useState<number>(1);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch tasks when switching to task tab
  useEffect(() => {
    if (tab !== 'tasks') return;
    setTaskLoading(true);
    fetchTasks(token || undefined)
      .then(setTasks)
      .catch(e => setTaskError(e.message))
      .finally(() => setTaskLoading(false));
  }, [tab, token]);

  // Fetch pets when switching to pet tab
  useEffect(() => {
    if (tab !== 'pet') return;
    setPetLoading(true);
    fetchPets(token || undefined)
      .then(setPets)
      .catch(e => setPetError(e.message))
      .finally(() => setPetLoading(false));
  }, [tab, token]);

  // Fetch stats when switching to analytics tab
  useEffect(() => {
    if (tab !== 'analytics') return;
    setStatsLoading(true);
    fetchStats(statsUserId, statsPeriod, token || undefined)
      .then(setStats)
      .catch(e => setStatsError(e.message))
      .finally(() => setStatsLoading(false));
  }, [tab, statsPeriod, statsUserId, token]);

  // Handle login or register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'login') {
        const res = await login(authForm.username, authForm.password);
        setToken(res.access_token);
        setTab('tasks');
      } else {
        if (authForm.password !== authForm.confirmPassword) {
          setAuthError("Passwords do not match");
          return;
        }
        await register(authForm.username, authForm.password);
        setAuthMode('login');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Authentication failed');
    }
  };

  // Handle adding a new task
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setTaskLoading(true);
    try {
      const task = await createTask(newTask, token || undefined);
      setTasks(prev => [...prev, task]);
      setNewTask('');
    } catch (e: any) {
      setTaskError(e.message || 'Failed to create task');
    } finally {
      setTaskLoading(false);
    }
  };
  
  // Handle updating a  task
const handleToggleComplete = async (id: number, completed: boolean) => {
  
  try {
    const updatedTask = await updateTaskCompleted(id, completed, token || undefined);
    setTasks(prevTasks => (
      prevTasks.map(task => (task.id === id ? updatedTask : task))
    ));
  } catch (error) {
    console.error("Error updating task completion:", error);
  }
};
  // Handle deleting a task
  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id, token || undefined);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  

// Task part done here

//PETS
  // Handle adding a new pet
  const handleAddPet = async () => {
    if (!newPet.name.trim()) return;
    setPetLoading(true);
    try {
      const pet = await createPet(newPet.name, newPet.age, newPet.hunger, token || undefined);
      setPets(prev => [...prev, pet]);
      setNewPet({ name: '', age: 1, hunger: 100 });
    } catch (e: any) {
      setPetError(e.message || 'Failed to add pet');
    } finally {
      setPetLoading(false);
    }
  };

  // Pomodoro-style focus timer component
  const FocusTimer = () => {
    const [seconds, setSeconds] = useState(25 * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
      if (!running) return;
      const interval = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000);
      return () => clearInterval(interval);
    }, [running]);

    const format = (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
      <div className="mt-8 p-20 bg-white rounded shadow flex flex-col items-center">
        <div className="text-7xl font-mono mb-5">{format(seconds)}</div>
        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)} className="bg-blue-500 text-white px-4 py-2 rounded">
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={() => { setRunning(false); setSeconds(25 * 60); }} className="bg-gray-300 px-4 py-2 rounded">
            Reset
          </button>
        </div>
      </div>
    );
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="flex gap-4 p-4 border-b bg-white">
        <button onClick={() => setTab('tasks')} className={tab === 'tasks' ? "font-bold underline" : ""}>Tasks & Focus</button>
        <button onClick={() => setTab('pet')} className={tab === 'pet' ? "font-bold underline" : ""}>Pet</button>
        <button onClick={() => setTab('analytics')} className={tab === 'analytics' ? "font-bold underline" : ""}>Analytics</button>
        <button onClick={() => {
          if (token) {
            setToken(null); // Logout
            setTab('auth');
          } else {
            setTab('auth');
          }
        }} className={tab === 'auth' ? "font-bold underline" : ""}>
          {token ? "Logout" : "Login/Register"}
        </button>
      </nav>

      <main className="max-w-2xl mx-auto p-4">
        {/* Tasks Tab */}
        {tab === 'tasks' && (
          <section>
            <h2 className="text-xl font-bold mb-2">Tasks</h2>
            {taskLoading && <div>Loading tasks...</div>}
            {taskError && <div className="text-red-500">{taskError}</div>}
            <ul className="mb-4">
              {tasks.map(task => (
                <li key={task.id} className="flex justify-between items-center border-b py-2">
                  <span className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-black'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-5 ml-4">
                    {/* ❗️ Task created date */}
                    {task.created && <span className="text-sm text-gray-500">{new Date(task.created).toLocaleDateString()}</span>}

                    {/* 💰 XP Reward */}
                    {task.xpReward && <span className="text-sm text-yellow-600">+{task.xpReward} XP</span>}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const updatedTask = await updateTaskCompleted(task.id, !task.completed, token || undefined);
                        setTasks(prev =>
                          prev
                            .map(t => (t.id === task.id ? { ...t, completed: updatedTask.completed } : t))
                            .sort((a, b) => Number(a.completed) - Number(b.completed))
                        );
                      } catch (error) {
                        console.error("Error updating task:", error);
                      }
                    }}
                    className={`hover:text-green-700 ${task.completed ? "text-gray-400 line-through" : "text-green-500"}`}
                    title="Toggle Complete"
                  >
                    ✔️
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Task"
                  >
                    ✖️
                  </button>
                </li>
                 
              ))}
            </ul>
            <div className="flex gap-2 mb-8">
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="New task"
                className="border p-2 flex-1 rounded"
              />
              <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-4 rounded" disabled={taskLoading}>
                Add
              </button>
            </div>
            <FocusTimer />
          </section>
        )}

        {/* Pet Tab */}
        {tab === 'pet' && (
          <section>
            <h2 className="text-xl font-bold mb-2">My Pets</h2>
            {petLoading && <div>Loading pets...</div>}
            {petError && <div className="text-red-500">{petError}</div>}
            <ul className="mb-4">
              {pets.map(pet => (
                <li key={pet.id} className="flex justify-between items-center border-b py-2">
                  <span>{pet.name} (Age: {pet.age}, Hunger: {pet.hunger})</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input value={newPet.name} onChange={e => setNewPet(p => ({ ...p, name: e.target.value }))} placeholder="Pet name" className="border p-2 flex-1 rounded" />
              <input type="number" value={newPet.age} onChange={e => setNewPet(p => ({ ...p, age: Number(e.target.value) }))} className="border p-2 w-20 rounded" min={0} />
              <input type="number" value={newPet.hunger} onChange={e => setNewPet(p => ({ ...p, hunger: Number(e.target.value) }))} className="border p-2 w-20 rounded" min={0} max={100} />
              <button onClick={handleAddPet} className="bg-green-500 text-white px-4 py-2 rounded" disabled={petLoading}>Add</button>
            </div>
          </section>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <section>
            <h2 className="text-xl font-bold mb-2">Analytics</h2>
            <div className="flex gap-2 mb-4">
              {['| ALL_TIME |', '| TODAY |', '| WEEK |', '| MONTH |', '| YEAR |'].map(period => (
                <button key={period} onClick={() => setStatsPeriod(period as any)} className={statsPeriod === period ? "font-bold underline" : ""}>
                  {period.replace('_', ' ')}
                </button>
              ))}
            </div>
            {statsLoading && <div>Loading stats...</div>}
            {statsError && <div className="text-red-500">{statsError}</div>}
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{stats ? JSON.stringify(stats, null, 2) : 'No data available.'}</pre>
          </section>
        )}

        {/* Auth Tab */}
        {tab === 'auth' && (
          <section>
            <h2 className="text-xl font-bold mb-2">{authMode === 'login' ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleAuth} className="space-y-2 max-w-sm">
              <input value={authForm.username} onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))} placeholder="Username" className="border p-2 w-full rounded" required />
              <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" className="border p-2 w-full rounded" required />
              {authMode === 'register' && (
                <input type="password" value={authForm.confirmPassword} onChange={e => setAuthForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Confirm Password" className="border p-2 w-full rounded" required />
              )}
              {authError && <div className="text-red-500">{authError}</div>}
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="mt-2 underline text-blue-600">
              {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
