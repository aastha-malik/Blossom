import React from 'react';

export type Species = 'dog' | 'cat';
export type Stage = 'baby' | 'kid' | 'teen' | 'adult';
export type Mood = 'happy' | 'content' | 'sad' | 'sleepy';

export interface PetSpriteProps {
  species: Species;
  stage: Stage;
  mood: Mood;
  size?: number;
}

const INK = 'var(--ink)';
const INK_SOFT = 'var(--ink-soft)';
const ACCENT = 'var(--accent)';
const AMBER = 'var(--amber)';
const LEAF = 'var(--accent-2)';
const BLUSH = '#f4b6b0';

function eyes(mood: Mood, lEx: number, lEy: number, rEx: number, rEy: number, color = INK): React.ReactElement {
  switch (mood) {
    case 'happy':
      return (
        <g>
          <circle cx={lEx} cy={lEy} r="2.4" fill={color} />
          <circle cx={rEx} cy={rEy} r="2.4" fill={color} />
          <circle cx={lEx + 0.7} cy={lEy - 0.7} r="0.7" fill="#fff" />
          <circle cx={rEx + 0.7} cy={rEy - 0.7} r="0.7" fill="#fff" />
        </g>
      );
    case 'content':
      return (
        <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <path d={`M${lEx - 3} ${lEy} Q${lEx} ${lEy - 3} ${lEx + 3} ${lEy}`} />
          <path d={`M${rEx - 3} ${rEy} Q${rEx} ${rEy - 3} ${rEx + 3} ${rEy}`} />
        </g>
      );
    case 'sad':
      return (
        <g>
          <circle cx={lEx} cy={lEy} r="2.2" fill={color} />
          <circle cx={rEx} cy={rEy} r="2.2" fill={color} />
          <path d={`M${rEx + 1} ${rEy + 2} Q${rEx + 2.5} ${rEy + 5} ${rEx + 1.5} ${rEy + 7}`}
                fill="#7ea0c4" stroke="#7ea0c4" strokeWidth="0.5" />
        </g>
      );
    case 'sleepy':
    default:
      return (
        <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <path d={`M${lEx - 3} ${lEy + 1} Q${lEx} ${lEy + 3} ${lEx + 3} ${lEy + 1}`} />
          <path d={`M${rEx - 3} ${rEy + 1} Q${rEx} ${rEy + 3} ${rEx + 3} ${rEy + 1}`} />
        </g>
      );
  }
}

function mouth(mood: Mood, mx: number, my: number, w = 6, color = INK): React.ReactElement {
  switch (mood) {
    case 'happy':
      return <path d={`M${mx - w} ${my} Q${mx} ${my + w} ${mx + w} ${my}`}
                   fill={ACCENT} opacity="0.6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />;
    case 'content':
      return <path d={`M${mx - w / 2} ${my} Q${mx} ${my + 2} ${mx + w / 2} ${my}`}
                   fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />;
    case 'sad':
      return <path d={`M${mx - w / 2} ${my + 2} Q${mx} ${my - 1} ${mx + w / 2} ${my + 2}`}
                   fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />;
    case 'sleepy':
    default:
      return <ellipse cx={mx} cy={my + 1} rx="1.5" ry="2" fill={color} opacity="0.7" />;
  }
}

function moodAura(mood: Mood, cx: number, cy: number, r: number): React.ReactElement | null {
  switch (mood) {
    case 'happy':
      return (
        <g fill={ACCENT} opacity="0.85">
          <path d={`M${cx + r * 0.7} ${cy - r * 0.9} m-3 0 a3 3 0 0 1 6 0 q0 3 -3 5 q-3 -2 -3 -5 z`} />
          <path d={`M${cx - r * 0.85} ${cy - r * 0.7} m-2 0 a2 2 0 0 1 4 0 q0 2 -2 3.5 q-2 -1.5 -2 -3.5 z`} opacity="0.6" />
        </g>
      );
    case 'sleepy':
      return (
        <g fontFamily="'Fraunces', serif" fontStyle="italic" fill={INK_SOFT}>
          <text x={cx + r * 0.7} y={cy - r * 0.55} fontSize="10">z</text>
          <text x={cx + r * 0.85} y={cy - r * 0.85} fontSize="13">z</text>
          <text x={cx + r * 1.05} y={cy - r * 1.15} fontSize="16">Z</text>
        </g>
      );
    case 'content':
      return (
        <g fill={AMBER} opacity="0.9">
          <text x={cx + r * 0.85} y={cy - r * 0.75} fontSize="12" fontFamily="serif">✦</text>
        </g>
      );
    case 'sad':
    default:
      return null;
  }
}

// ── DOG ──

function DogBaby({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#d9a26a'; const furDark = '#a87642';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="88" rx="28" ry="3" fill={INK} opacity="0.15" />
      <ellipse cx="50" cy="68" rx="22" ry="14" fill={fur} stroke={INK} strokeWidth="1.6" />
      <ellipse cx="50" cy="70" rx="14" ry="8" fill="#f0d4a6" />
      <ellipse cx="38" cy="80" rx="4" ry="3" fill={fur} stroke={INK} strokeWidth="1.2" />
      <ellipse cx="62" cy="80" rx="4" ry="3" fill={fur} stroke={INK} strokeWidth="1.2" />
      <circle cx="50" cy="44" r="22" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M30 38 Q24 50 30 60 Q34 56 36 50 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <path d="M70 38 Q76 50 70 60 Q66 56 64 50 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="50" cy="50" rx="7" ry="5" fill="#f0d4a6" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="50" cy="48" rx="2" ry="1.4" fill={INK} />
      <circle cx="36" cy="48" r="3" fill={BLUSH} opacity="0.7" />
      <circle cx="64" cy="48" r="3" fill={BLUSH} opacity="0.7" />
      {eyes(mood, 42, 42, 58, 42)}
      {mouth(mood, 50, 54, 4)}
      {moodAura(mood, 50, 50, 26)}
    </svg>
  );
}

function DogKid({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#c98e54'; const furDark = '#8e5e30';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="92" rx="32" ry="3" fill={INK} opacity="0.15" />
      <ellipse cx="32" cy="82" rx="8" ry="6" fill={fur} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="68" cy="82" rx="8" ry="6" fill={fur} stroke={INK} strokeWidth="1.4" />
      <path d="M30 76 Q26 56 38 50 Q50 46 62 50 Q74 56 70 76 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <ellipse cx="50" cy="66" rx="14" ry="10" fill="#e8c188" />
      <rect x="42" y="74" width="6" height="14" rx="3" fill={fur} stroke={INK} strokeWidth="1.4" />
      <rect x="52" y="74" width="6" height="14" rx="3" fill={fur} stroke={INK} strokeWidth="1.4" />
      <path d="M70 60 Q82 52 78 42" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M70 60 Q82 52 78 42" stroke={fur} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      <circle cx="50" cy="38" r="20" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M32 30 Q26 44 32 52 L40 44 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <path d="M68 30 Q74 44 68 52 L60 44 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="50" cy="44" rx="7" ry="5" fill="#e8c188" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="50" cy="42" rx="2" ry="1.4" fill={INK} />
      <line x1="50" y1="44" x2="50" y2="48" stroke={INK} strokeWidth="1" />
      <circle cx="36" cy="42" r="2.5" fill={BLUSH} opacity="0.6" />
      <circle cx="64" cy="42" r="2.5" fill={BLUSH} opacity="0.6" />
      {eyes(mood, 42, 36, 58, 36)}
      {mouth(mood, 50, 50, 5)}
      {moodAura(mood, 50, 38, 24)}
    </svg>
  );
}

function DogTeen({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#e0b878'; const furDark = '#b8894a'; const furLight = '#f0d4a0';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="93" rx="32" ry="3" fill={INK} opacity="0.15" />
      <rect x="34" y="72" width="7" height="20" rx="3" fill={fur} stroke={INK} strokeWidth="1.4" />
      <rect x="59" y="72" width="7" height="20" rx="3" fill={fur} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="37.5" cy="91" rx="5" ry="2.5" fill={furDark} stroke={INK} strokeWidth="1.2" />
      <ellipse cx="62.5" cy="91" rx="5" ry="2.5" fill={furDark} stroke={INK} strokeWidth="1.2" />
      <path d="M28 76 Q22 56 36 50 Q50 46 64 50 Q78 56 72 76 Q66 82 50 82 Q34 82 28 76 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M40 60 Q44 72 50 78 Q56 72 60 60 Q55 64 50 64 Q45 64 40 60 Z" fill={furLight} />
      {(mood === 'happy' || mood === 'content') ? (
        <g>
          <path d="M72 60 Q86 50 84 36" stroke={fur} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M72 60 Q86 50 84 36" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M82 32 Q86 34 88 38" stroke={furLight} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M72 64 Q86 70 82 80" stroke={fur} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M72 64 Q86 70 82 80" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      )}
      <ellipse cx="50" cy="34" rx="19" ry="18" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M32 26 Q22 32 24 46 Q28 52 34 50 Q34 38 36 30 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <path d="M68 26 Q78 32 76 46 Q72 52 66 50 Q66 38 64 30 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <path d="M30 32 Q28 40 32 46" stroke={furDark} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M70 32 Q72 40 68 46" stroke={furDark} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M50 22 Q48 30 50 40 Q52 30 50 22 Z" fill={furLight} opacity="0.7" />
      <ellipse cx="50" cy="42" rx="9" ry="6" fill={furLight} stroke={INK} strokeWidth="1.2" />
      <ellipse cx="50" cy="40" rx="2.5" ry="1.6" fill={INK} />
      <line x1="50" y1="42" x2="50" y2="46" stroke={INK} strokeWidth="1" />
      <circle cx="38" cy="38" r="2.5" fill={BLUSH} opacity="0.5" />
      <circle cx="62" cy="38" r="2.5" fill={BLUSH} opacity="0.5" />
      {eyes(mood, 42, 32, 58, 32)}
      {mouth(mood, 50, 48, 4)}
      {moodAura(mood, 50, 34, 22)}
    </svg>
  );
}

function DogAdult({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#9a663a'; const furDark = '#5e3d20';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="92" rx="36" ry="3.5" fill={INK} opacity="0.18" />
      <path d="M22 88 Q14 70 24 58 L38 64 L34 88 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M78 88 Q86 70 76 58 L62 64 L66 88 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M28 70 Q22 48 40 40 L60 40 Q78 48 72 70 Q66 80 50 80 Q34 80 28 70 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <ellipse cx="50" cy="62" rx="18" ry="10" fill="#c08a55" />
      <rect x="40" y="68" width="7" height="22" rx="3" fill={fur} stroke={INK} strokeWidth="1.4" />
      <rect x="53" y="68" width="7" height="22" rx="3" fill={fur} stroke={INK} strokeWidth="1.4" />
      {(mood === 'happy' || mood === 'content') ? (
        <>
          <path d="M74 56 Q90 40 86 24" stroke={fur} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M74 56 Q90 40 86 24" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M74 60 Q90 70 86 84" stroke={fur} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M74 60 Q90 70 86 84" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      <circle cx="50" cy="30" r="20" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M30 22 Q22 38 30 50 Q36 44 38 36 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <path d="M70 22 Q78 38 70 50 Q64 44 62 36 Z" fill={furDark} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="50" cy="38" rx="9" ry="6" fill="#c08a55" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="50" cy="35" rx="2.5" ry="1.6" fill={INK} />
      <line x1="50" y1="38" x2="50" y2="44" stroke={INK} strokeWidth="1" />
      <path d="M34 50 Q50 56 66 50" stroke={ACCENT} strokeWidth="3" fill="none" />
      <circle cx="50" cy="54" r="2" fill={AMBER} stroke={INK} strokeWidth="0.8" />
      <circle cx="36" cy="34" r="2.5" fill={BLUSH} opacity="0.4" />
      <circle cx="64" cy="34" r="2.5" fill={BLUSH} opacity="0.4" />
      {eyes(mood, 42, 28, 58, 28)}
      {mouth(mood, 50, 44, 5)}
      {moodAura(mood, 50, 30, 24)}
    </svg>
  );
}

// ── CAT ──

function CatBaby({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#e8d5b8'; const stripe = '#a87642';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="86" rx="28" ry="3" fill={INK} opacity="0.15" />
      <ellipse cx="50" cy="68" rx="24" ry="14" fill={fur} stroke={INK} strokeWidth="1.6" />
      <ellipse cx="50" cy="70" rx="16" ry="8" fill="#f7eadb" />
      <path d="M40 58 Q42 64 38 70" stroke={stripe} strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d="M52 58 Q54 64 50 70" stroke={stripe} strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d="M64 58 Q66 64 62 70" stroke={stripe} strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d="M28 72 Q22 60 30 54" stroke={fur} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M28 72 Q22 60 30 54" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M34 28 L40 14 L46 26 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M66 28 L60 14 L54 26 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="50" cy="42" r="22" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M37 26 L40 18 L43 26 Z" fill={BLUSH} opacity="0.7" />
      <path d="M63 26 L60 18 L57 26 Z" fill={BLUSH} opacity="0.7" />
      <path d="M48 48 L52 48 L50 50 Z" fill={ACCENT} />
      <line x1="38" y1="50" x2="28" y2="48" stroke={INK} strokeWidth="0.8" />
      <line x1="38" y1="52" x2="28" y2="53" stroke={INK} strokeWidth="0.8" />
      <line x1="62" y1="50" x2="72" y2="48" stroke={INK} strokeWidth="0.8" />
      <line x1="62" y1="52" x2="72" y2="53" stroke={INK} strokeWidth="0.8" />
      <circle cx="36" cy="46" r="3" fill={BLUSH} opacity="0.7" />
      <circle cx="64" cy="46" r="3" fill={BLUSH} opacity="0.7" />
      {eyes(mood, 42, 42, 58, 42)}
      {mouth(mood, 50, 54, 4)}
      {moodAura(mood, 50, 42, 26)}
    </svg>
  );
}

function CatKid({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#dcb37d'; const stripe = '#8e5e30';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="92" rx="30" ry="3" fill={INK} opacity="0.15" />
      <path d="M32 88 Q26 60 38 48 Q50 44 62 48 Q74 60 68 88 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <ellipse cx="50" cy="70" rx="14" ry="14" fill="#f0d4a6" />
      <path d="M36 56 Q34 62 38 68" stroke={stripe} strokeWidth="1.6" fill="none" opacity="0.55" />
      <path d="M64 56 Q66 62 62 68" stroke={stripe} strokeWidth="1.6" fill="none" opacity="0.55" />
      <path d="M68 84 Q86 80 82 64" stroke={fur} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M68 84 Q86 80 82 64" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <ellipse cx="40" cy="84" rx="5" ry="4" fill={fur} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="58" cy="84" rx="5" ry="4" fill={fur} stroke={INK} strokeWidth="1.4" />
      <path d="M34 22 L40 6 L46 20 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M66 22 L60 6 L54 20 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="50" cy="34" r="20" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M37 20 L40 10 L43 20 Z" fill={BLUSH} opacity="0.7" />
      <path d="M63 20 L60 10 L57 20 Z" fill={BLUSH} opacity="0.7" />
      <path d="M48 40 L52 40 L50 42 Z" fill={ACCENT} />
      <line x1="38" y1="42" x2="26" y2="40" stroke={INK} strokeWidth="0.8" />
      <line x1="38" y1="44" x2="26" y2="46" stroke={INK} strokeWidth="0.8" />
      <line x1="62" y1="42" x2="74" y2="40" stroke={INK} strokeWidth="0.8" />
      <line x1="62" y1="44" x2="74" y2="46" stroke={INK} strokeWidth="0.8" />
      <circle cx="36" cy="38" r="2.5" fill={BLUSH} opacity="0.6" />
      <circle cx="64" cy="38" r="2.5" fill={BLUSH} opacity="0.6" />
      {eyes(mood, 42, 34, 58, 34)}
      {mouth(mood, 50, 46, 5)}
      {moodAura(mood, 50, 34, 22)}
    </svg>
  );
}

function CatTeen({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#c9924d'; const furDark = '#7c5128'; const furLight = '#e8c188'; const stripe = '#7c5128';
  return (
    <svg width={size} height={size} viewBox="0 -8 100 108">
      <ellipse cx="50" cy="93" rx="34" ry="3.5" fill={INK} opacity="0.15" />
      <ellipse cx="32" cy="80" rx="10" ry="12" fill={fur} stroke={INK} strokeWidth="1.5" />
      <ellipse cx="68" cy="80" rx="10" ry="12" fill={fur} stroke={INK} strokeWidth="1.5" />
      <path d="M28 82 Q20 58 36 48 Q50 44 64 48 Q80 58 72 82 Q66 88 50 88 Q34 88 28 82 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M34 56 Q40 70 50 74 Q60 70 66 56 Q60 60 54 60 Q50 62 46 60 Q40 60 34 56 Z" fill={furLight} />
      <path d="M30 54 Q34 50 38 56" stroke={INK} strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M70 54 Q66 50 62 56" stroke={INK} strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M40 62 Q38 70 42 76" stroke={stripe} strokeWidth="1.3" fill="none" opacity="0.5" />
      <path d="M60 62 Q62 70 58 76" stroke={stripe} strokeWidth="1.3" fill="none" opacity="0.5" />
      <ellipse cx="40" cy="86" rx="5" ry="3" fill={fur} stroke={INK} strokeWidth="1.3" />
      <ellipse cx="60" cy="86" rx="5" ry="3" fill={fur} stroke={INK} strokeWidth="1.3" />
      {mood === 'sad' ? (
        <g>
          <path d="M72 70 Q88 78 86 90" stroke={fur} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M72 70 Q88 78 86 90" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M72 56 Q90 38 84 18" stroke={fur} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M72 56 Q90 38 84 18" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M82 22 Q86 18 88 22" stroke={furLight} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      <path d="M30 22 L36 2 L46 20 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M70 22 L64 2 L54 20 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <ellipse cx="50" cy="32" rx="18" ry="17" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M34 20 L36 8 L42 18 Z" fill={BLUSH} opacity="0.65" />
      <path d="M66 20 L64 8 L58 18 Z" fill={BLUSH} opacity="0.65" />
      <path d="M36 2 L34 -3 M36 2 L38 -3" stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M64 2 L62 -3 M64 2 L66 -3" stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M32 38 Q30 44 34 46" stroke={INK} strokeWidth="1" fill="none" />
      <path d="M68 38 Q70 44 66 46" stroke={INK} strokeWidth="1" fill="none" />
      <path d="M44 22 L46 28 M50 22 L50 28 M56 22 L54 28" stroke={stripe} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M47 38 L53 38 L50 41 Z" fill={ACCENT} />
      <line x1="50" y1="41" x2="50" y2="44" stroke={INK} strokeWidth="0.8" />
      <line x1="38" y1="40" x2="22" y2="38" stroke={INK} strokeWidth="0.7" />
      <line x1="38" y1="42" x2="22" y2="44" stroke={INK} strokeWidth="0.7" />
      <line x1="62" y1="40" x2="78" y2="38" stroke={INK} strokeWidth="0.7" />
      <line x1="62" y1="42" x2="78" y2="44" stroke={INK} strokeWidth="0.7" />
      <circle cx="38" cy="38" r="2.5" fill={BLUSH} opacity="0.5" />
      <circle cx="62" cy="38" r="2.5" fill={BLUSH} opacity="0.5" />
      {eyes(mood, 42, 30, 58, 30)}
      {mouth(mood, 50, 46, 4)}
      {moodAura(mood, 50, 32, 24)}
    </svg>
  );
}

function CatAdult({ mood, size = 110 }: { mood: Mood; size?: number }) {
  const fur = '#a87236'; const stripe = '#5e3d20';
  return (
    <svg width={size} height={size} viewBox="0 -8 100 108">
      <ellipse cx="50" cy="92" rx="34" ry="3.5" fill={INK} opacity="0.18" />
      <ellipse cx="32" cy="78" rx="12" ry="14" fill={fur} stroke={INK} strokeWidth="1.5" />
      <ellipse cx="68" cy="78" rx="12" ry="14" fill={fur} stroke={INK} strokeWidth="1.5" />
      <path d="M30 80 Q22 50 38 38 L62 38 Q78 50 70 80 Q66 88 50 88 Q34 88 30 80 Z" fill={fur} stroke={INK} strokeWidth="1.6" />
      <ellipse cx="50" cy="62" rx="16" ry="14" fill="#bd8c50" />
      <path d="M34 52 Q32 62 36 72" stroke={stripe} strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M50 50 Q48 62 52 76" stroke={stripe} strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M66 52 Q68 62 64 72" stroke={stripe} strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="40" cy="86" rx="6" ry="4" fill={fur} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="60" cy="86" rx="6" ry="4" fill={fur} stroke={INK} strokeWidth="1.4" />
      <line x1="38" y1="86" x2="38" y2="89" stroke={INK} strokeWidth="0.8" />
      <line x1="40" y1="86" x2="40" y2="89" stroke={INK} strokeWidth="0.8" />
      <line x1="42" y1="86" x2="42" y2="89" stroke={INK} strokeWidth="0.8" />
      <path d="M44 88 Q26 84 28 70" stroke={fur} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M44 88 Q26 84 28 70" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M32 18 L40 0 L48 16 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M68 18 L60 0 L52 16 Z" fill={fur} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="50" cy="30" r="20" fill={fur} stroke={INK} strokeWidth="1.6" />
      <path d="M40 0 L38 -5 M40 0 L42 -5" stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M60 0 L58 -5 M60 0 L62 -5" stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M37 16 L40 6 L43 16 Z" fill={BLUSH} opacity="0.65" />
      <path d="M63 16 L60 6 L57 16 Z" fill={BLUSH} opacity="0.65" />
      <path d="M47 36 L53 36 L50 39 Z" fill={ACCENT} />
      <path d="M50 39 L50 42" stroke={INK} strokeWidth="1" />
      <line x1="38" y1="38" x2="22" y2="36" stroke={INK} strokeWidth="0.8" />
      <line x1="38" y1="40" x2="22" y2="42" stroke={INK} strokeWidth="0.8" />
      <line x1="62" y1="38" x2="78" y2="36" stroke={INK} strokeWidth="0.8" />
      <line x1="62" y1="40" x2="78" y2="42" stroke={INK} strokeWidth="0.8" />
      <path d="M34 50 Q50 56 66 50" stroke={ACCENT} strokeWidth="2.5" fill="none" />
      <circle cx="50" cy="54" r="2" fill={LEAF} stroke={INK} strokeWidth="0.8" />
      <circle cx="36" cy="36" r="2.5" fill={BLUSH} opacity="0.45" />
      <circle cx="64" cy="36" r="2.5" fill={BLUSH} opacity="0.45" />
      {eyes(mood, 42, 30, 58, 30)}
      {mouth(mood, 50, 44, 4)}
      {moodAura(mood, 50, 30, 24)}
    </svg>
  );
}

// ── dispatcher ──

type SpriteComponent = (props: { mood: Mood; size?: number }) => React.ReactElement;

const SPRITE_MAP: Record<Species, Record<Stage, SpriteComponent>> = {
  dog: { baby: DogBaby, kid: DogKid, teen: DogTeen, adult: DogAdult },
  cat: { baby: CatBaby, kid: CatKid, teen: CatTeen, adult: CatAdult },
};

export function PetSprite({ species, stage, mood, size = 110 }: PetSpriteProps) {
  const Comp = SPRITE_MAP[species][stage];
  return <Comp mood={mood} size={size} />;
}

// ── utils ──

export function getStage(age: number): Stage {
  if (age < 7) return 'baby';
  if (age < 21) return 'kid';
  if (age < 60) return 'teen';
  return 'adult';
}

export function deriveMood(hunger: number, lastFed: string): Mood {
  const hoursSinceFed = (Date.now() - new Date(lastFed).getTime()) / (1000 * 60 * 60);
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 7) return 'sleepy';
  if (hunger > 80 || hoursSinceFed >= 24) return 'sad';
  if (hunger < 30 && hoursSinceFed < 4) return 'happy';
  return 'content';
}
