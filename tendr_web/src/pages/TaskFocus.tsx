import FocusTimer from '../components/focus/FocusTimer';
import TaskForm from '../components/tasks/TaskForm';
import TaskList from '../components/tasks/TaskList';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export default function TaskFocus() {
  const { toasts, showToast, removeToast } = useToast();

  const handleSuccess = (message: string) => {
    showToast(message, 'success');
  };

  const handleError = (error: Error) => {
    showToast(error.message || 'An error occurred', 'error');
  };

  return (
    <div className="min-h-screen page-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Centered Heading */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-3 h-3 rounded-full bg-pink-soft-100"></div>
          <h2 className="text-4xl font-extrabold text-text-primary">TASK & FOCUS</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Focus Timer */}
          <div>
            <FocusTimer />
          </div>

          {/* Right Column - Task Management */}
          <div>
            <div className="card">
              <TaskForm
                onSuccess={() => handleSuccess('Task added successfully!')}
                onError={handleError}
              />
              
              <div className="border-t border-dark-border pt-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Your Tasks</h3>
                <TaskList onError={handleError} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
