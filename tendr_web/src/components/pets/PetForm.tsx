import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { petsAPI } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalPetsContext } from '../../contexts/LocalPetsContext';
import type { PetCreate } from '../../api/types';

interface PetFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const PET_TYPES = ['Dog', 'Cat'];

export default function PetForm({ onSuccess, onError }: PetFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('');
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { addPet: addLocalPet } = useLocalPetsContext();

  const createPetMutation = useMutation({
    mutationFn: (data: PetCreate) => petsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setName('');
      setType('');
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type.trim()) return;

    if (isAuthenticated) {
      // Use backend API when logged in
      createPetMutation.mutate({
        name: name.trim(),
        type: type.trim(),
      });
    } else {
      // Use local storage when not logged in
      try {
        addLocalPet({
          name: name.trim(),
          type: type.trim(),
        });
        setName('');
        setType('');
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Create New Pet</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Pet Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter pet name"
            className="input-field w-full"
            required
          />
        </div>

        <div>
          <label className="block text-text-secondary text-sm mb-2">Pet Type</label>
          <div className="flex gap-3">
            {PET_TYPES.map((petType) => (
              <button
                key={petType}
                type="button"
                onClick={() => setType(petType)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex-1 ${
                  type === petType
                    ? 'bg-purple-gentle-100 text-white'
                    : 'bg-dark-surface text-text-secondary hover:bg-dark-border'
                }`}
              >
                {petType}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !type || createPetMutation.isPending}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createPetMutation.isPending ? 'Creating...' : 'Create Pet'}
        </button>
      </form>
    </div>
  );
}

