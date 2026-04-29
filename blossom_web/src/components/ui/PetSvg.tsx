interface PetSvgProps {
  size?: number;
  mood?: 'content' | 'hungry' | 'sleepy' | 'excited' | 'sad';
}

// Eye and mouth paths per mood
const moodPaths: Record<string, { leftEye: string; rightEye: string; mouth: string }> = {
  content: {
    leftEye:  'M88 112 Q92 108 96 112',
    rightEye: 'M104 112 Q108 108 112 112',
    mouth:    'M100 117 L100 121 M100 121 Q97 124 94 122 M100 121 Q103 124 106 122',
  },
  hungry: {
    leftEye:  'M88 112 Q92 108 96 112',
    rightEye: 'M104 112 Q108 108 112 112',
    mouth:    'M95 122 Q100 118 105 122',
  },
  sleepy: {
    leftEye:  'M88 113 Q92 113 96 113',
    rightEye: 'M104 113 Q108 113 112 113',
    mouth:    'M97 121 Q100 123 103 121',
  },
  excited: {
    leftEye:  'M88 110 Q90 112 92 110 M94 110 Q96 112 98 110',
    rightEye: 'M102 110 Q104 112 106 110 M108 110 Q110 112 112 110',
    mouth:    'M94 120 Q100 126 106 120',
  },
  sad: {
    leftEye:  'M88 112 Q92 108 96 112',
    rightEye: 'M104 112 Q108 108 112 112',
    mouth:    'M94 124 Q100 120 106 124',
  },
};

export function PetSvg({ size = 200, mood = 'content' }: PetSvgProps) {
  const m = moodPaths[mood] ?? moodPaths.content;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {/* shadow */}
      <ellipse cx="100" cy="175" rx="70" ry="8" fill="var(--ink)" opacity="0.15" />
      {/* cup body */}
      <path d="M50 130 Q50 175 100 178 Q150 175 150 130 Z" fill="var(--card)" stroke="var(--ink)" strokeWidth="2.5" />
      {/* cup rim */}
      <ellipse cx="100" cy="130" rx="50" ry="8" fill="#f4d9c4" stroke="var(--ink)" strokeWidth="2" />
      {/* cup handle */}
      <path d="M150 140 Q172 140 170 158 Q168 170 150 168" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
      {/* head */}
      <ellipse cx="100" cy="115" rx="34" ry="26" fill="var(--card)" stroke="var(--ink)" strokeWidth="2.2" />
      {/* left ear */}
      <ellipse cx="86" cy="82" rx="7" ry="18" fill="var(--card)" stroke="var(--ink)" strokeWidth="2" transform="rotate(-12 86 82)" />
      {/* right ear */}
      <ellipse cx="114" cy="82" rx="7" ry="18" fill="var(--card)" stroke="var(--ink)" strokeWidth="2" transform="rotate(12 114 82)" />
      {/* left inner ear */}
      <ellipse cx="86" cy="85" rx="3" ry="10" fill="var(--accent)" opacity="0.55" transform="rotate(-12 86 85)" />
      {/* right inner ear */}
      <ellipse cx="114" cy="85" rx="3" ry="10" fill="var(--accent)" opacity="0.55" transform="rotate(12 114 85)" />
      {/* left cheek */}
      <circle cx="85" cy="118" r="5" fill="var(--accent)" opacity="0.55" />
      {/* right cheek */}
      <circle cx="115" cy="118" r="5" fill="var(--accent)" opacity="0.55" />
      {/* left eye */}
      <path d={m.leftEye} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      {/* right eye */}
      <path d={m.rightEye} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      {/* mouth */}
      <path d={m.mouth} fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      {/* flower */}
      <g transform="translate(140 80)">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-9" rx="5" ry="8" fill="var(--card)" stroke="var(--ink)" strokeWidth="1.5" transform={`rotate(${a})`} />
        ))}
        <circle r="5" fill="var(--amber)" stroke="var(--ink)" strokeWidth="1.5" />
        <path d="M0 8 Q-3 22 -8 30" stroke="var(--accent-2)" strokeWidth="2" fill="none" />
      </g>
      {/* tail wisp */}
      <path d="M78 106 Q74 96 80 92 Q86 86 80 80" fill="none" stroke="var(--muted)" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}
