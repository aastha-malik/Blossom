import { useState, useEffect } from 'react';
import type { Pet } from '../api/types';

const STORAGE_KEY = 'blossom_local_pets';

export const useLocalPets = () => {
  const [pets, setPets] = useState<Pet[]>(() => {
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

  // Save to localStorage whenever pets change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    }
  }, [pets]);

  const addPet = (pet: { name: string; type: string }) => {
    const newPet: Pet = {
      ...pet,
      id: Date.now(), // Use timestamp as ID for local pets
      age: 0.0,
      hunger: 100,
      last_fed: new Date().toISOString(),
      is_alive: true,
      user_id: 0, // Local user ID
    };
    setPets((prev) => [...prev, newPet]);
    return newPet;
  };

  const updatePet = (petId: number, updates: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((pet) => (pet.id === petId ? { ...pet, ...updates } : pet))
    );
  };

  const deletePet = (petId: number) => {
    setPets((prev) => prev.filter((pet) => pet.id !== petId));
  };

  const feedPet = (petId: number) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id === petId) {
          return {
            ...pet,
            hunger: Math.min(100, pet.hunger + 20), // Increase hunger by 20
            last_fed: new Date().toISOString(),
          };
        }
        return pet;
      })
    );
  };

  return {
    pets,
    addPet,
    updatePet,
    deletePet,
    feedPet,
    setPets,
  };
};

