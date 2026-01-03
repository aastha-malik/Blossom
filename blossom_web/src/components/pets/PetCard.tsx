import { Trash2, Sparkles } from 'lucide-react';
import type { Pet } from '../../api/types';
import { formatTimeAgo } from '../../utils/formatters';

interface PetCardProps {
  pet: Pet;
  onFeed: () => void;
  onDelete: () => void;
  isLocal?: boolean;
}

const getPetEmoji = (type: string): string => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('dog')) return '🐕';
  if (lowerType.includes('cat')) return '🐱';
  return '🐾';
};

const getMood = (happiness: number, hunger: number): { emoji: string; text: string } => {
  if (happiness >= 80 && hunger > 50) {
    return { emoji: '😊', text: 'Very Happy!' };
  } else if (happiness >= 60 && hunger > 30) {
    return { emoji: '🙂', text: 'Happy' };
  } else if (happiness >= 40 || hunger > 20) {
    return { emoji: '😐', text: 'Okay' };
  } else if (hunger <= 20) {
    return { emoji: '😟', text: 'Hungry' };
  } else {
    return { emoji: '😢', text: 'Sad' };
  }
};

export default function PetCard({ pet, onFeed, onDelete, isLocal = false }: PetCardProps) {
  const hungerPercentage = Math.min(100, Math.max(0, pet.hunger));
  const happinessPercentage = Math.min(100, Math.max(0, 100 - (100 - hungerPercentage) * 0.8));
  const mood = getMood(happinessPercentage, hungerPercentage);
  const petEmoji = getPetEmoji(pet.type);

  if (!pet.is_alive) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">💀</div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">{pet.name}</h3>
        <p className="text-text-muted mb-4">This pet has passed away</p>
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-lg border border-dark-border text-text-muted hover:text-text-primary hover:border-pink-soft-100 transition-colors"
        >
          <Trash2 size={18} className="inline mr-2" />
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header with paw prints */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-2xl">🐾</span>
        <h3 className="text-2xl font-bold text-pink-soft-100">YOUR PET</h3>
        <span className="text-2xl">🐾</span>
      </div>

      {/* Pet Emoji */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{petEmoji}</div>
      </div>

      {/* Pet Details */}
      <div className="space-y-3 mb-6">
        <div className="text-center">
          <p className="text-blue-muted-100 text-lg font-semibold">Name: {pet.name}</p>
          <p className="text-purple-gentle-100 text-sm">
            Type: {pet.type} | Age: {pet.age.toFixed(1)} yrs
          </p>
        </div>

        {/* Happiness Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-text-secondary text-sm">Happiness</span>
            <span className="text-pink-soft-100 text-sm font-medium">{Math.round(happinessPercentage)}%</span>
          </div>
          <div className="w-full bg-dark-surface rounded-full h-3">
            <div
              className="bg-pink-soft-100 h-3 rounded-full transition-all"
              style={{ width: `${happinessPercentage}%` }}
            />
          </div>
        </div>

        {/* Hunger Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-text-secondary text-sm">Hunger</span>
            <span className="text-blue-muted-100 text-sm font-medium">{hungerPercentage}%</span>
          </div>
          <div className="w-full bg-dark-surface rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                hungerPercentage > 70
                  ? 'bg-blue-muted-100'
                  : hungerPercentage > 40
                  ? 'bg-purple-gentle-100'
                  : 'bg-pink-soft-100'
              }`}
              style={{ width: `${hungerPercentage}%` }}
            />
          </div>
          {hungerPercentage < 30 && (
            <p className="text-pink-soft-100 text-xs mt-1">Feed your pet soon!</p>
          )}
        </div>

        {/* Mood */}
        <div className="text-center pt-2">
          <p className="text-text-primary">
            Mood: {mood.emoji} {mood.text}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onFeed}
          disabled={hungerPercentage >= 100}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={18} />
          Feed
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dark-border text-text-muted hover:text-text-primary hover:border-pink-soft-100 transition-colors"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>
    </div>
  );
}
