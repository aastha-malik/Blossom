// Direction B refined — "Cozy Study"
// Pet-only (no garden). Editorial cozy aesthetic. Includes:
// - Light + dark mode (toggleable)
// - Analytics heatmap (editorial-styled bento)
// - Field notes flourishes throughout
// - Multiple feature touches (treat shop, mood log, pomodoro ledger)

const serif = '"Fraunces", "Cormorant Garamond", Georgia, serif';
const sans = '"Inter", system-ui, sans-serif';
const mono = '"JetBrains Mono", ui-monospace, monospace';

const lightTheme = {
  paper: '#f4ece0',
  paperDeep: '#ead9c1',
  card: '#fffaf1',
  ink: '#2a2118',
  inkSoft: '#5a4d3c',
  muted: '#8a7a64',
  accent: '#c94e3a',
  accent2: '#5b7a4c',
  accent3: '#3d5a7c',
  amber: '#c08a2a',
  rule: 'rgba(42,33,24,0.18)',
  ruleSoft: 'rgba(42,33,24,0.08)',
  shadow: 'rgba(42,33,24,0.08)',
  pet: '#fff',
  petStroke: '#2a2118',
  hi: 'rgba(201,78,58,0.08)',
};

const darkTheme = {
  paper: '#1a1410',
  paperDeep: '#241c16',
  card: '#221a14',
  ink: '#f0e8d8',
  inkSoft: '#c9bfae',
  muted: '#8a7e6a',
  accent: '#e07158',
  accent2: '#9bb87a',
  accent3: '#7ea0c4',
  amber: '#e0b25a',
  rule: 'rgba(240,232,216,0.15)',
  ruleSoft: 'rgba(240,232,216,0.06)',
  shadow: 'rgba(0,0,0,0.4)',
  pet: '#3a2e22',
  petStroke: '#f0e8d8',
  hi: 'rgba(224,113,88,0.12)',
};

// ─── Pet illustration (cozy mochi-fox in a teacup) ───
function BPet({ size = 200, theme }) {
  const t = theme;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <ellipse cx="100" cy="175" rx="70" ry="8" fill={t.ink} opacity="0.15" />
      <path d="M50 130 Q50 175 100 178 Q150 175 150 130 Z" fill={t.pet} stroke={t.petStroke} strokeWidth="2.5" />
      <ellipse cx="100" cy="130" rx="50" ry="8" fill={t === lightTheme ? '#f4d9c4' : '#4a3a2c'} stroke={t.petStroke} strokeWidth="2" />
      <path d="M150 140 Q172 140 170 158 Q168 170 150 168" fill="none" stroke={t.petStroke} strokeWidth="2.5" />
      <ellipse cx="100" cy="115" rx="34" ry="26" fill={t.pet} stroke={t.petStroke} strokeWidth="2.2" />
      <ellipse cx="86" cy="82" rx="7" ry="18" fill={t.pet} stroke={t.petStroke} strokeWidth="2" transform="rotate(-12 86 82)" />
      <ellipse cx="114" cy="82" rx="7" ry="18" fill={t.pet} stroke={t.petStroke} strokeWidth="2" transform="rotate(12 114 82)" />
      <ellipse cx="86" cy="85" rx="3" ry="10" fill={t.accent} opacity="0.55" transform="rotate(-12 86 85)" />
      <ellipse cx="114" cy="85" rx="3" ry="10" fill={t.accent} opacity="0.55" transform="rotate(12 114 85)" />
      <circle cx="85" cy="118" r="5" fill={t.accent} opacity="0.55" />
      <circle cx="115" cy="118" r="5" fill={t.accent} opacity="0.55" />
      <path d="M88 112 Q92 108 96 112" fill="none" stroke={t.petStroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M104 112 Q108 108 112 112" fill="none" stroke={t.petStroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M100 117 L100 121 M100 121 Q97 124 94 122 M100 121 Q103 124 106 122" fill="none" stroke={t.petStroke} strokeWidth="1.6" strokeLinecap="round" />
      <g transform="translate(140 80)">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-9" rx="5" ry="8" fill={t.pet} stroke={t.petStroke} strokeWidth="1.5" transform={`rotate(${a})`} />
        ))}
        <circle r="5" fill={t.amber} stroke={t.petStroke} strokeWidth="1.5" />
        <path d="M0 8 Q-3 22 -8 30" stroke={t.accent2} strokeWidth="2" fill="none" />
      </g>
      <path d="M78 106 Q74 96 80 92 Q86 86 80 80" fill="none" stroke={t.muted} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

// ─── Logo mark ───
function BLogo({ theme }) {
  const t = theme;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="none" stroke={t.ink} strokeWidth="1.5" />
      <path d="M9 16 Q14 9 19 16" stroke={t.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="13" r="2" fill={t.amber} />
      <circle cx="10" cy="11" r="1" fill={t.ink} />
      <circle cx="18" cy="11" r="1" fill={t.ink} />
    </svg>
  );
}

function BNav({ scope, theme, name, onToggle, isDark }) {
  const t = theme;
  return (
    <div style={{ padding: '20px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${t.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BLogo theme={t} />
        <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: t.ink, letterSpacing: -0.4 }}>{name}</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: t.muted, letterSpacing: 1, marginLeft: 4, borderLeft: `1px solid ${t.rule}`, paddingLeft: 10 }}>no. 04 · spring &rsquo;26</div>
      </div>
      {scope === 'landing' ? (
        <div style={{ display: 'flex', gap: 24, fontFamily: sans, fontSize: 13, color: t.inkSoft, alignItems: 'center' }}>
          <span>Story</span><span>Field notes</span><span>Pricing</span>
          <span onClick={onToggle} style={{ cursor: 'pointer', fontFamily: mono, fontSize: 11, color: t.muted, letterSpacing: 1 }}>{isDark ? '☀' : '☾'}</span>
          <span style={{ color: t.paper, background: t.ink, padding: '8px 16px', fontSize: 12, letterSpacing: 0.5 }}>Begin →</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 22, fontFamily: serif, fontSize: 15, fontStyle: 'italic', alignItems: 'center' }}>
          {[['Today', true], ['Pet'], ['Ledger'], ['Archive']].map(([l, a]) => (
            <span key={l} style={{ color: a ? t.accent : t.inkSoft, borderBottom: a ? `2px solid ${t.accent}` : 'none', paddingBottom: 2 }}>{l}</span>
          ))}
          <span onClick={onToggle} style={{ cursor: 'pointer', fontFamily: mono, fontSize: 11, color: t.muted, letterSpacing: 1, marginLeft: 8 }}>{isDark ? '☀' : '☾'}</span>
        </div>
      )}
    </div>
  );
}

// ─── Heatmap (editorial-styled) ───
function BHeatmap({ theme }) {
  const t = theme;
  const data = [0, .2, .4, .7, 1, .6, .3, .1, .5, .9, 1, .7, .4, .2, 0, .5, .8, 1, .9, .6, .3, .2, .6, .9, 1, .8, .5, .3];
  const accentRgb = t === lightTheme ? '201,78,58' : '224,113,88';
  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        {data.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: 22,
            background: v === 0 ? t.ruleSoft : `rgba(${accentRgb}, ${0.15 + v * 0.85})`,
            borderRadius: 2,
            border: `1px solid ${t.ruleSoft}`,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 9, color: t.muted, marginTop: 6, letterSpacing: 1.5 }}>
        <span>28 D AGO</span>
        <span style={{ fontFamily: serif, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>each square, a day</span>
        <span>TODAY</span>
      </div>
    </div>
  );
}

function BLanding({ theme, name, onToggle, isDark }) {
  const t = theme;
  return (
    <div style={{ width: '100%', height: '100%', background: t.paper, color: t.ink, fontFamily: sans, overflow: 'hidden' }}>
      <BNav scope="landing" theme={t} name={name} onToggle={onToggle} isDark={isDark} />
      <div style={{ padding: '28px 36px 12px', textAlign: 'center', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: t.muted }}>VOL. I  ·  A QUIET ALMANAC FOR GETTING THINGS DONE  ·  ₹0</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 44, padding: '40px 36px 28px' }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 78, lineHeight: 0.95, letterSpacing: -3, fontWeight: 400 }}>
            Tend to your<br />
            <span style={{ fontStyle: 'italic' }}>to-do list</span><br />
            like a friend.
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginTop: 28, maxWidth: 520 }}>
            <div style={{ width: 3, background: t.accent, alignSelf: 'stretch' }} />
            <div style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.55, color: t.inkSoft, fontStyle: 'italic' }}>
              {name} is a journal-shaped productivity app. Every task you finish earns a treat for a small animal that lives inside it. Show up daily and it gets happier; ignore it and, well, it remembers.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 30, alignItems: 'center' }}>
            <div style={{ background: t.ink, color: t.paper, padding: '13px 24px', fontSize: 14, fontWeight: 500, letterSpacing: 0.5 }}>Adopt your pet →</div>
            <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: t.inkSoft, textDecoration: 'underline', textDecorationStyle: 'wavy', textUnderlineOffset: 4, textDecorationColor: t.accent }}>or read a sample day</div>
          </div>
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.rule}`, padding: 22, boxShadow: `4px 6px 0 ${t.shadow}`, transform: 'rotate(1.4deg)', alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 10, color: t.muted, letterSpacing: 2, marginBottom: 12 }}>
            <span>TUE · 21 APR</span><span>DAY 014</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <BPet size={190} theme={t} />
          </div>
          <div style={{ fontFamily: serif, fontSize: 22, textAlign: 'center', fontStyle: 'italic' }}>Mochi is content.</div>
          <div style={{ fontFamily: sans, fontSize: 12, color: t.inkSoft, textAlign: 'center', marginTop: 4, marginBottom: 14 }}>3 of 5 tasks · 22 min of focus</div>
          <div style={{ borderTop: `1px dashed ${t.rule}`, paddingTop: 12 }}>
            {[['☒', 'Morning pages', t.ink], ['☒', 'Reply to studio emails', t.ink], ['☐', 'Sketch 10 mushrooms', t.inkSoft], ['☐', '4pm walk', t.inkSoft]].map(([m, txt, c], i) => (
              <div key={i} style={{ fontFamily: serif, fontSize: 15, color: c, marginBottom: 5, display: 'flex', gap: 10 }}>
                <span style={{ fontFamily: mono, fontSize: 14 }}>{m}</span>
                <span style={{ textDecoration: m === '☒' ? 'line-through' : 'none', textDecorationColor: t.accent, textDecorationThickness: 2 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* feature trio with editorial flourishes */}
      <div style={{ padding: '28px 36px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28, borderTop: `1px solid ${t.rule}` }}>
        {[
          { n: 'I.', h: 'A task is a treat.', b: 'Every item you finish becomes food for your pet. High-priority ones are richer meals.', c: t.accent },
          { n: 'II.', h: 'Focus is affection.', b: 'A Pomodoro session counts as time spent together. Pets bloom faster when you sit with them.', c: t.accent2 },
          { n: 'III.', h: 'A 28-day garden of squares.', b: 'Your activity becomes a quiet heatmap. Some weeks bloom, some are bare. Both are honest.', c: t.accent3 },
        ].map(f => (
          <div key={f.n}>
            <div style={{ fontFamily: serif, fontSize: 32, fontStyle: 'italic', color: f.c, lineHeight: 1, marginBottom: 8 }}>{f.n}</div>
            <div style={{ fontFamily: serif, fontSize: 22, letterSpacing: -0.4, marginBottom: 8 }}>{f.h}</div>
            <div style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.55, color: t.inkSoft, fontStyle: 'italic' }}>{f.b}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${t.rule}`, padding: '20px 36px', display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted }}>
        <span>EST. 2026 · DELHI</span>
        <span>&ldquo;I finish my tasks to see my fox.&rdquo; — PRIYA R.</span>
        <span>PG. 01</span>
      </div>
    </div>
  );
}

function BDashboard({ theme, name, onToggle, isDark }) {
  const t = theme;
  return (
    <div style={{ width: '100%', height: '100%', background: t.paper, color: t.ink, fontFamily: sans, overflow: 'hidden' }}>
      <BNav scope="app" theme={t} name={name} onToggle={onToggle} isDark={isDark} />
      <div style={{ padding: '24px 36px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 30 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: t.muted, marginBottom: 4 }}>TUE · 21 APR · DAY 014 WITH MOCHI</div>
          <div style={{ fontFamily: serif, fontSize: 44, letterSpacing: -1.2, lineHeight: 1 }}>Today&rsquo;s page.</div>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: t.inkSoft, marginTop: 6 }}>A light drizzle. Mochi is sleeping in.</div>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted, borderBottom: `1px solid ${t.rule}`, paddingBottom: 6, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>TO DO</span><span>5 items · 28 xp possible</span>
            </div>
            {[
              { t: 'Ship the redesign critique', done: true, xp: 12, tag: 'work' },
              { t: 'Review PRs from the weekend', done: false, xp: 6, tag: 'work' },
              { t: 'Sketch new pet evolutions', done: false, xp: 6, tag: 'studio' },
              { t: 'Reply to Priya about the offsite', done: false, xp: 2, tag: 'friends' },
              { t: 'Order groceries — Thursday', done: true, xp: 2, tag: 'home' },
            ].map((task, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto auto', alignItems: 'baseline', gap: 14, padding: '11px 0', borderBottom: `1px dashed ${t.rule}` }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, border: `1.5px solid ${t.ink}`, background: task.done ? t.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {task.done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 5 L4 8 L9 2" stroke={t === lightTheme ? '#fff' : '#1a1410'} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
                </div>
                <div style={{ fontFamily: serif, fontSize: 17, color: task.done ? t.muted : t.ink, textDecoration: task.done ? 'line-through' : 'none', textDecorationColor: t.accent, textDecorationThickness: 2 }}>{task.t}</div>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1.5, color: t.inkSoft, textTransform: 'uppercase' }}>{task.tag}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: t.amber }}>+{task.xp}</div>
              </div>
            ))}
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: t.muted, padding: '8px 0' }}>+ add another…</div>
          </div>

          {/* Analytics heatmap — bento-styled, editorial */}
          <div style={{ marginTop: 22, border: `1px solid ${t.rule}`, padding: 20, background: t.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted }}>THE LEDGER · LAST 28 DAYS</div>
                <div style={{ fontFamily: serif, fontSize: 22, fontStyle: 'italic', marginTop: 2 }}>How spring has been treating you.</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: t.accent2, letterSpacing: 1 }}>+18% VS LAST</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 16, paddingBottom: 14, borderBottom: `1px dashed ${t.rule}` }}>
              {[['Tasks finished', '23', t.accent], ['Time together', '4h 12m', t.accent3], ['Streak', '7 days', t.amber]].map(([l, v, c]) => (
                <div key={l}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: t.muted, letterSpacing: 1.5 }}>{l.toUpperCase()}</div>
                  <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, color: c, letterSpacing: -1, fontFeatureSettings: '"tnum"', marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            <BHeatmap theme={t} />
          </div>

          {/* focus */}
          <div style={{ marginTop: 22, border: `1.5px solid ${t.ink}`, padding: 20, background: t.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted }}>SIT WITH MOCHI · 45 MIN</div>
              <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: t.inkSoft }}>spending time on &ldquo;review PRs&rdquo;</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 8 }}>
              <div style={{ fontFamily: serif, fontSize: 88, letterSpacing: -4, lineHeight: 1, fontFeatureSettings: '"tnum"', color: t.accent }}>24:51</div>
              <div style={{ flex: 1 }}>
                <svg width="100%" height="22" viewBox="0 0 300 22" preserveAspectRatio="none">
                  <line x1="0" y1="11" x2="300" y2="11" stroke={t.rule} strokeWidth="1" strokeDasharray="3 4" />
                  <line x1="0" y1="11" x2="14" y2="11" stroke={t.accent} strokeWidth="2" />
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['25', '45', '60'].map((m, i) => (
                      <div key={m} style={{ fontFamily: serif, fontSize: 14, color: i === 1 ? t.ink : t.muted, fontStyle: i === 1 ? 'normal' : 'italic', borderBottom: i === 1 ? `2px solid ${t.accent}` : 'none', paddingBottom: 1 }}>{m} min</div>
                    ))}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: t.muted, letterSpacing: 1.5 }}>PAUSE · SPACE</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* pet side */}
        <div>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted, marginBottom: 6 }}>MOCHI · FOX-MOCHI · DAY 014</div>
          <div style={{ background: t.card, border: `1px solid ${t.rule}`, padding: 22, textAlign: 'center' }}>
            <BPet size={210} theme={t} />
            <div style={{ fontFamily: serif, fontSize: 26, fontStyle: 'italic', letterSpacing: -0.4, marginTop: 4 }}>&ldquo;a little hungry&rdquo;</div>
            <div style={{ fontFamily: serif, fontSize: 14, color: t.inkSoft, marginTop: 4 }}>will bloom in 3 days, if fed on time</div>

            <div style={{ marginTop: 18, textAlign: 'left' }}>
              {[['Mood', 72, t.accent], ['Belly', 69, t.accent2], ['Bond', 85, t.amber]].map(([l, v, c]) => (
                <div key={l} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 30px', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontFamily: serif, fontSize: 13, fontStyle: 'italic', color: t.inkSoft }}>{l}</div>
                  <div style={{ height: 6, background: t.paperDeep, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${v}%`, height: '100%', background: c }} />
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: t.muted, textAlign: 'right' }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: t.accent, color: '#fff', padding: '11px', fontFamily: sans, fontWeight: 600, fontSize: 13, letterSpacing: 0.3 }}>Offer a treat · 35 xp</div>
              <div style={{ padding: '11px 16px', border: `1.5px solid ${t.ink}`, color: t.ink, fontSize: 13, fontWeight: 500 }}>Pet</div>
            </div>
          </div>

          {/* field notes */}
          <div style={{ marginTop: 16, padding: '14px 16px', background: t.card, borderLeft: `3px solid ${t.accent2}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted, marginBottom: 4 }}>FIELD NOTES · TODAY</div>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, lineHeight: 1.5, color: t.ink }}>
              Mochi learned a new trick. If you finish a hard task before noon, she does a little spin. The plot twist I didn&rsquo;t know I needed.
            </div>
          </div>

          {/* mood weather */}
          <div style={{ marginTop: 16, padding: '14px 16px', background: t.card, border: `1px solid ${t.rule}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted, marginBottom: 8 }}>WEEK&rsquo;S WEATHER</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {[['M','☀'],['T','☀'],['W','⛅'],['T','☁'],['F','☀'],['S','☀'],['S','☂']].map(([d, w], i) => (
                <div key={i} style={{ textAlign: 'center', padding: '6px 0', background: i === 1 ? t.hi : 'transparent' }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: t.muted, letterSpacing: 1 }}>{d}</div>
                  <div style={{ fontSize: 18, marginTop: 2, color: t.ink }}>{w}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: t.inkSoft, marginTop: 8, textAlign: 'center' }}>good week · 5 sunny days</div>
          </div>

          {/* treat shop */}
          <div style={{ marginTop: 16, padding: '14px 16px', background: t.card, border: `1px solid ${t.rule}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: t.muted, marginBottom: 8 }}>THE PANTRY</div>
            {[['Berry tart', '35 xp', '🥧'], ['Honey biscuit', '60 xp', '🍪'], ['Spring blossom (rare)', '120 xp', '✿']].map(([n, p, e]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: `1px dashed ${t.rule}` }}>
                <div style={{ fontSize: 18 }}>{e}</div>
                <div style={{ flex: 1, fontFamily: serif, fontSize: 14 }}>{n}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: t.amber }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.BLanding = BLanding;
window.BDashboard = BDashboard;
window.lightTheme = lightTheme;
window.darkTheme = darkTheme;
