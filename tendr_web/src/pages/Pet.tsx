import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { petsAPI, userAPI } from '../api/client';
import { PetSprite, getStage, deriveMood } from '../components/PetSprite';
import type { Species } from '../components/PetSprite';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import type { PetCreate } from '../api/types';


function formatDayCounter(age?: number): string {
  if (!age) return 'DAY 001';
  return `DAY ${String(Math.floor(age)).padStart(3, '0')}`;
}

const monoStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '2px',
  color: 'var(--muted)',
  textTransform: 'uppercase',
};

const PET_TYPES = ['Dog', 'Cat'];

export default function Pet() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');

  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsAPI.getAll(),
    enabled: isAuthenticated,
  });

  const { data: userXP } = useQuery({
    queryKey: ['userXP'],
    queryFn: () => userAPI.getXP(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const feedMutation = useMutation({
    mutationFn: (petId: string) => petsAPI.feed(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      showToast('Fed. She looks pleased.', 'success');
    },
    onError: () => showToast('Could not feed right now.', 'error'),
  });

  const createMutation = useMutation({
    mutationFn: (data: PetCreate) => petsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setNewName('');
      setNewType('');
      showToast('A new companion has arrived.', 'success');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const handleAdopt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newType) return;
    createMutation.mutate({ name: newName.trim(), type: newType });
  };

  const pet = pets.find(p => p.is_alive) ?? pets[0];
  const deadPets = pets.filter(p => !p.is_alive);

  const petHunger = pet?.hunger ?? 50;
  const petSpecies = (pet?.type?.toLowerCase() === 'cat' ? 'cat' : 'dog') as Species;
  const petStage = getStage(pet?.age ?? 0);
  const petMood = pet ? deriveMood(pet.hunger, pet.last_fed) : 'content';
  const petName = pet?.name ?? 'Tendr';
  const dayCounter = formatDayCounter(pet?.age);
  const xp = userXP?.xp ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '24px 36px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ ...monoStyle, marginBottom: 6 }}>
          {petName.toUpperCase()} · FOX-MOCHI · {dayCounter}
        </div>

        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 44, letterSpacing: -1.2, lineHeight: 1, color: 'var(--ink)', margin: '0 0 28px' }}>
          {petName}.
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>

          {/* Pet card */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--rule)', padding: 28, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PetSprite species={petSpecies} stage={petStage} mood={petMood} size={240} />
            </div>

            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontStyle: 'italic', letterSpacing: -0.4, marginTop: 8, color: 'var(--ink)' }}>
              {petMood === 'happy' ? '"perfectly content"'
                : petMood === 'sad' ? '"a bit lonely"'
                : petMood === 'sleepy' ? '"just waking up"'
                : '"doing alright"'}
            </div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 4 }}>
              {petHunger > 60 ? 'getting hungry — feed when you can.' : 'doing well for now.'}
            </div>

            {/* Progress bars */}
            <div style={{ marginTop: 22, textAlign: 'left' }}>
              {([
                ['Mood', 100 - petHunger, 'var(--accent)'],
                ['Belly', 100 - petHunger, 'var(--accent-2)'],
                ['Bond', Math.min(100, (pet?.age ?? 0) * 3), 'var(--amber)'],
              ] as [string, number, string][]).map(([label, value, color]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 36px', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)' }}>{label}</div>
                  <div style={{ height: 6, background: 'var(--paper-deep)' }}>
                    <div style={{ width: `${Math.min(100, value)}%`, height: '100%', background: color }} />
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'var(--muted)', textAlign: 'right', fontFeatureSettings: '"tnum"' }}>{Math.round(value)}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <button
                onClick={() => pet && feedMutation.mutate(pet.id)}
                disabled={!pet || feedMutation.isPending || xp < 35}
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '12px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  border: 'none',
                  cursor: (pet && xp >= 35) ? 'pointer' : 'not-allowed',
                  opacity: (!pet || xp < 35) ? 0.5 : 1,
                }}
              >
                Offer a treat · 35 xp
              </button>
              <button
                style={{
                  padding: '12px 20px',
                  border: '1.5px solid var(--ink)',
                  background: 'none',
                  color: 'var(--ink)',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Pet
              </button>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Adopt form */}
            <div style={{ border: '1px solid var(--rule)', background: 'var(--card)', padding: 22 }}>
              <div style={{ ...monoStyle, marginBottom: 6 }}>ADOPT A NEW PET</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'var(--ink)', marginBottom: 16 }}>
                A new companion.
              </div>
              <form onSubmit={handleAdopt}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ ...monoStyle, display: 'block', marginBottom: 6 }}>NAME</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="give them a name…"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--rule)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--rule)')}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ ...monoStyle, display: 'block', marginBottom: 8 }}>TYPE</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {PET_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewType(t)}
                        style={{
                          flex: 1,
                          padding: '12px 8px 8px',
                          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                          fontSize: 11,
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          background: newType === t ? 'var(--ink)' : 'transparent',
                          color: newType === t ? 'var(--paper)' : 'var(--muted)',
                          border: `1px solid ${newType === t ? 'var(--ink)' : 'var(--rule)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <PetSprite
                          species={t.toLowerCase() as Species}
                          stage="baby"
                          mood="happy"
                          size={80}
                        />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newName.trim() || !newType || createMutation.isPending}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--ink)',
                    color: 'var(--paper)',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    border: 'none',
                    cursor: (newName.trim() && newType) ? 'pointer' : 'not-allowed',
                    opacity: (!newName.trim() || !newType || createMutation.isPending) ? 0.5 : 1,
                  }}
                >
                  {createMutation.isPending ? 'Adopting…' : 'Adopt →'}
                </button>
              </form>
            </div>

            {/* Past companions */}
            {deadPets.length > 0 && (
              <div style={{ border: '1px solid var(--rule)', padding: 20, background: 'var(--card)' }}>
                <div style={{ ...monoStyle, marginBottom: 14 }}>PAST COMPANIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {deadPets.map(p => (
                    <div key={p.id} style={{ border: '1px solid var(--rule-soft)', padding: 12, opacity: 0.6 }}>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, color: 'var(--ink)' }}>{p.name}</div>
                      <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase' }}>
                        passed peacefully · day {String(Math.floor(p.age ?? 0)).padStart(3, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
