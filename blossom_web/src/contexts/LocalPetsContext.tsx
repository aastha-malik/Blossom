import { createContext, useContext, ReactNode } from 'react';
import { useLocalPets } from '../hooks/useLocalPets';
import type { Pet } from '../api/types';

interface LocalPetsContextType {
  pets: Pet[];
  addPet: (pet: { name: string; type: string }) => Pet;
  updatePet: (petId: number, updates: Partial<Pet>) => void;
  deletePet: (petId: number) => void;
  feedPet: (petId: number) => void;
}

const LocalPetsContext = createContext<LocalPetsContextType | undefined>(undefined);

export const LocalPetsProvider = ({ children }: { children: ReactNode }) => {
  const localPets = useLocalPets();

  return (
    <LocalPetsContext.Provider value={localPets}>
      {children}
    </LocalPetsContext.Provider>
  );
};

export const useLocalPetsContext = (): LocalPetsContextType => {
  const context = useContext(LocalPetsContext);
  if (context === undefined) {
    throw new Error('useLocalPetsContext must be used within a LocalPetsProvider');
  }
  return context;
};

