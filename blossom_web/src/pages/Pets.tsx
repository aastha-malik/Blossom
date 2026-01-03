import PetForm from '../components/pets/PetForm';
import PetList from '../components/pets/PetList';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export default function Pets() {
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
          <h2 className="text-4xl font-extrabold text-text-primary">MY PETS</h2>
        </div>

        <PetForm
          onSuccess={() => handleSuccess('Pet created successfully!')}
          onError={handleError}
        />

        <PetList onSuccess={handleSuccess} onError={handleError} />

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
    </div>
  );
}
