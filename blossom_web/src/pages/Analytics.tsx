import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsAPI, tasksAPI, petsAPI } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useLocalTasksContext } from '../contexts/LocalTasksContext';
import StatsCard from '../components/stats/StatsCard';
import MotivationalMessage from '../components/stats/MotivationalMessage';
import { BarChart2, BarChart, CheckCircle2, Flame } from 'lucide-react';

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const { tasks: localTasks } = useLocalTasksContext();
  const [userId, setUserId] = useState<number | null>(null);

  // Try to get user ID from tasks (only when authenticated)
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll(),
    enabled: isAuthenticated && !userId,
    retry: 1,
  });

  // Try to get user ID from pets if tasks didn't work (only when authenticated)
  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsAPI.getAll(),
    enabled: isAuthenticated && !userId && (!tasks || tasks.length === 0) && !tasksLoading,
    retry: 1,
  });

  // Extract userId from tasks or pets (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      if (tasks && tasks.length > 0 && tasks[0].user_id) {
        setUserId(tasks[0].user_id);
      } else if (pets && pets.length > 0 && pets[0].user_id) {
        setUserId(pets[0].user_id);
      }
    }
  }, [tasks, pets, isAuthenticated]);

  // Fetch stats from backend (only when authenticated)
  const { data: stats, isLoading: statsLoading, error } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => statsAPI.getStats(userId!),
    enabled: isAuthenticated && userId !== null,
    retry: 1,
  });

  // Calculate local stats from local tasks when not authenticated
  const localStats = useMemo(() => {
    if (isAuthenticated) return null;

    const completedTasks = localTasks.filter(task => task.completed).length;
    // Simple streak calculation: count consecutive days with completed tasks
    // For now, just return 0 for streak (can be enhanced later)
    return {
      num_task_completed: completedTasks,
      streaks: 0, // Local streak calculation would need date tracking
    };
  }, [localTasks, isAuthenticated]);

  const isLoading = isAuthenticated && (tasksLoading || petsLoading || statsLoading);
  const displayStats = isAuthenticated ? stats : localStats;

  return (
    <div className="min-h-screen page-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Centered Heading - Always Visible */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <BarChart2 size={32} className="text-pink-soft-100" />
          <h2 className="text-4xl font-extrabold text-text-primary">ANALYTICS</h2>
          <BarChart size={32} className="text-blue-muted-100" />
        </div>

        {/* Loading State (only when authenticated) */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading analytics...</p>
          </div>
        )}

        {/* Error State (only when authenticated) */}
        {isAuthenticated && error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-text-secondary">Error loading analytics. Please try again.</p>
            {error instanceof Error && (
              <p className="text-text-muted text-sm mt-2">{error.message}</p>
            )}
          </div>
        )}

        {/* Stats Cards - Always show */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <StatsCard
                title="Tasks Completed"
                value={displayStats?.num_task_completed ?? 0}
                icon={CheckCircle2}
                color="blue"
              />
              <StatsCard
                title="Current Streak"
                value={displayStats ? `${displayStats.streaks} days` : '0 days'}
                icon={Flame}
                color="pink"
              />
            </div>

            {/* Motivational Message */}
            <MotivationalMessage
              tasksCompleted={displayStats?.num_task_completed ?? 0}
              streak={displayStats?.streaks ?? 0}
            />
          </>
        )}

        {/* No Stats Available Message (only when authenticated and no data) */}
        {!isLoading && !error && isAuthenticated && !stats && userId && (
          <div className="text-center py-12">
            <p className="text-purple-gentle-100 text-lg">
              No stats available. Start completing tasks to see your progress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
