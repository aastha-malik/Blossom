interface MotivationalMessageProps {
  tasksCompleted: number;
  streak: number;
}

export default function MotivationalMessage({ tasksCompleted, streak }: MotivationalMessageProps) {
  const getMessage = () => {
    if (tasksCompleted === 0 && streak === 0) {
      return {
        title: 'Keep Going!',
        message: 'Complete your first task to start building your stats!',
      };
    } else if (streak >= 7) {
      return {
        title: '🔥 Amazing Streak!',
        message: `You've completed ${tasksCompleted} tasks with a ${streak}-day streak! Keep up the incredible work!`,
      };
    } else if (streak >= 3) {
      return {
        title: '🌟 Great Progress!',
        message: `You're on a ${streak}-day streak with ${tasksCompleted} tasks completed! You're doing great!`,
      };
    } else if (tasksCompleted > 10) {
      return {
        title: '💪 Keep Going!',
        message: `You've completed ${tasksCompleted} tasks! Every task brings you closer to your goals!`,
      };
    } else if (tasksCompleted > 0) {
      return {
        title: '✨ Keep Going!',
        message: `You've completed ${tasksCompleted} task${tasksCompleted > 1 ? 's' : ''}! Keep building momentum!`,
      };
    } else {
      return {
        title: 'Keep Going!',
        message: 'Complete your first task to start building your stats!',
      };
    }
  };

  const { title, message } = getMessage();

  return (
    <div className="card bg-gradient-to-r from-pink-soft-100/10 to-blue-muted-100/10 border-2 border-pink-soft-100/30 text-center">
      <h3 className="text-xl font-bold text-pink-soft-100 mb-2">{title}</h3>
      <p className="text-text-secondary">{message}</p>
    </div>
  );
}

