import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsAPI, userAPI } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalPetsContext } from '../../contexts/LocalPetsContext';
import PetCard from './PetCard';

interface PetListProps {
  onError?: (error: Error) => void;
  onSuccess?: (message: string) => void;
}

export default function PetList({ onError, onSuccess }: PetListProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { pets: localPets, feedPet: feedLocalPet, deletePet: deleteLocalPet } = useLocalPetsContext();

  // Fetch user XP when authenticated to control button state
  const { data: userXPData } = useQuery({
    queryKey: ['userXP'],
    queryFn: () => userAPI.getXP(),
    enabled: isAuthenticated,
  });

  // Fetch from backend when authenticated
  const { data: backendPets, isLoading, error } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsAPI.getAll(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const feedMutation = useMutation({
    mutationFn: (petId: number) => petsAPI.feed(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['userXP'] });
      onSuccess?.('Pet fed successfully!');
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (petId: number) => petsAPI.delete(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      onSuccess?.('Pet deleted successfully');
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  // Use local pets when not authenticated, backend pets when authenticated
  const pets = isAuthenticated ? backendPets : localPets;

  if (isAuthenticated && isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading pets...</p>
      </div>
    );
  }

  if (isAuthenticated && error) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Error loading pets. Please try again.</p>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-gentle-100 text-lg">
          No pets yet! Create your first pet above 🐾
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          onFeed={() => {
            if (isAuthenticated) {
              feedMutation.mutate(pet.id);
            } else {
              feedLocalPet(pet.id);
              onSuccess?.('Pet fed successfully!');
            }
          }}
          onDelete={() => {
            if (isAuthenticated) {
              deleteMutation.mutate(pet.id);
            } else {
              deleteLocalPet(pet.id);
              onSuccess?.('Pet deleted successfully');
            }
          }}
          isLocal={!isAuthenticated}
          userXP={userXPData?.xp}
        />
      ))}
    </div>
  );
}

