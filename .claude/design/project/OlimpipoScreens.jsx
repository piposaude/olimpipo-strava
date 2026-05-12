// Olimpipo — gamified monthly health challenge for Pipo members.
// Three screens: editions list → ranking → submitted activities.

const { useState: useStateOl } = React;

// ---------------------------------------------------------------------------
// Sample data — would come from API in production.
// ---------------------------------------------------------------------------

const OLIMPIPO_EDITIONS = [
  { id: 'mai-26', label: 'Maio/26',    period: '01 — 31 maio 2026',     active: true,
    days_remaining: 19, participants: 412, my_rank: 14, my_points: 580, my_activities: 12 },
  { id: 'abr-26', label: 'Abril/26',   period: '01 — 30 abril 2026',    active: false,
    days_remaining: 0,  participants: 398, my_rank: 5,  my_points: 920, my_activities: 21 },
  { id: 'mar-26', label: 'Março/26',   period: '01 — 31 março 2026',    active: false,
    days_remaining: 0,  participants: 376, my_rank: 1,  my_points: 1180, my_activities: 27 },
  { id: 'fev-26', label: 'Fevereiro/26', period: '01 — 28 fevereiro 2026', active: false,
    days_remaining: 0, participants: 351, my_rank: 22, my_points: 510, my_activities: 11 },
  { id: 'jan-26', label: 'Janeiro/26', period: '01 — 31 janeiro 2026',  active: false,
    days_remaining: 0,  participants: 312, my_rank: 3,  my_points: 1020, my_activities: 24 },
  { id: 'dez-25', label: 'Dezembro/25', period: '01 — 31 dezembro 2025', active: false,
    days_remaining: 0, participants: 289, my_rank: 2,  my_points: 1090, my_activities: 25 },
  { id: 'nov-25', label: 'Novembro/25', period: '01 — 30 novembro 2025', active: false,
    days_remaining: 0, participants: 268, my_rank: 34, my_points: 410, my_activities: 8 },
];

const OLIMPIPO_RANKING = [
  { rank: 1, name: 'Mariana Costa',   dept: 'Produto',     points: 1240, activities: 28 },
  { rank: 2, name: 'Rafael Lima',     dept: 'Engenharia',  points: 1180, activities: 26 },
  { rank: 3, name: 'Camila Souza',    dept: 'Comercial',   points: 1095, activities: 24 },
  { rank: 4, name: 'Bruno Almeida',   dept: 'Engenharia',  points: 980,  activities: 22 },
  { rank: 5, name: 'Letícia Ferreira', dept: 'Design',     points: 945,  activities: 21 },
  { rank: 6, name: 'João Pereira',    dept: 'Operações',   points: 880,  activities: 19 },
  { rank: 7, name: 'Isabela Martins', dept: 'Marketing',   points: 845,  activities: 18 },
  { rank: 8, name: 'Diego Ribeiro',   dept: 'Engenharia',  points: 790,  activities: 17 },
  { rank: 9, name: 'Patrícia Nunes',  dept: 'RH',          points: 745,  activities: 16 },
  { rank: 10, name: 'Felipe Cardoso', dept: 'Comercial',   points: 720,  activities: 15 },
  { rank: 11, name: 'Beatriz Rocha',  dept: 'Produto',     points: 680,  activities: 14 },
  { rank: 12, name: 'Lucas Mendes',   dept: 'Engenharia',  points: 645,  activities: 13 },
  { rank: 13, name: 'Aline Barbosa',  dept: 'Design',      points: 610,  activities: 12 },
  // -- the current user --
  { rank: 14, name: 'Ana Silva',      dept: 'Produto',     points: 580,  activities: 12, me: true },
  { rank: 15, name: 'Marcelo Tavares', dept: 'Operações',  points: 545,  activities: 11 },
  { rank: 16, name: 'Renata Pinto',   dept: 'Comercial',   points: 520,  activities: 10 },
  { rank: 17, name: 'Gustavo Henrique', dept: 'Engenharia', points: 495, activities: 10 },
  { rank: 18, name: 'Juliana Castro', dept: 'Marketing',   points: 470,  activities: 9 },
];

const OLIMPIPO_ACTIVITIES = [
  { id: 1, type: 'Corrida',    date: '19 mai · 06:42', duration: '38 min', metric: '5,2 km',  points: 60, kind: 'run',    status: 'aprovada' },
  { id: 2, type: 'Yoga',       date: '18 mai · 07:30', duration: '45 min', metric: 'sessão',  points: 40, kind: 'yoga',   status: 'aprovada' },
  { id: 3, type: 'Hidratação', date: '18 mai',         duration: 'dia',     metric: '2,4 L',   points: 20, kind: 'water',  status: 'aprovada' },
  { id: 4, type: 'Musculação', date: '17 mai · 19:10', duration: '55 min', metric: 'treino',  points: 50, kind: 'gym',    status: 'aprovada' },
  { id: 5, type: 'Caminhada',  date: '16 mai · 17:50', duration: '42 min', metric: '4,1 km',  points: 45, kind: 'walk',   status: 'aprovada' },
  { id: 6, type: 'Meditação',  date: '15 mai · 22:05', duration: '12 min', metric: 'sessão',  points: 25, kind: 'mind',   status: 'aprovada' },
  { id: 7, type: 'Bicicleta',  date: '14 mai · 08:00', duration: '1h 12min', metric: '18,4 km', points: 80, kind: 'bike', status: 'aprovada' },
  { id: 8, type: 'Corrida',    date: '12 mai · 06:30', duration: '32 min', metric: '4,3 km',  points: 50, kind: 'run',    status: 'aprovada' },
  { id: 9, type: 'Hidratação', date: '11 mai',         duration: 'dia',     metric: '2,0 L',   points: 20, kind: 'water',  status: 'aprovada' },
  { id: 10, type: 'Consulta médica', date: '08 mai · 14:00', duration: '30 min', metric: 'check-up', points: 100, kind: 'doctor', status: 'aprovada' },
  { id: 11, type: 'Natação',   date: '06 mai · 18:30', duration: '40 min', metric: '1,2 km',  points: 70, kind: 'swim',   status: 'aprovada' },
  { id: 12, type: 'Caminhada', date: '04 mai · 18:00', duration: '50 min', metric: '4,5 km',  points: 50, kind: 'walk',   status: 'em análise' },
];

// ---------------------------------------------------------------------------
// Activity icons — small inline SVGs sized to fit a 36×36 chip.
// ---------------------------------------------------------------------------
const ACTIVITY_GLYPHS = {
  run:    { bg: '#FFE3D7', stroke: '#9B3A1B', icon: 'M9 18l3-5 3 3 4-7M5 21h14' },
  walk:   { bg: '#F7F3EB', stroke: '#3C2A18', icon: 'M9 4l2 5-2 4 3 3 2 5M9 4l-2 4M14 6l3-1' },
  bike:   { bg: '#D8EBFF', stroke: '#1527A9', icon: 'M6 18a3 3 0 100-6 3 3 0 000 6zm12 0a3 3 0 100-6 3 3 0 000 6zM8 14l3-7h3l3 5M11 7l3 6' },
  swim:   { bg: '#D8EBFF', stroke: '#1527A9', icon: 'M3 16c2 2 4 0 6 0s4 2 6 0 4 2 6 0M3 12c2 2 4 0 6 0s4 2 6 0 4 2 6 0M17 7a2 2 0 100-2 2 2 0 000 2zM10 9l4-2 3 2' },
  yoga:   { bg: '#F2E9FB', stroke: '#5D2BAA', icon: 'M12 5a2 2 0 110-2 2 2 0 010 2zM7 21l3-7 2 2 2-2 3 7M9 14l-3-3M15 14l3-3' },
  gym:    { bg: '#FFEBEB', stroke: '#902D2D', icon: 'M4 9v6M8 7v10M16 7v10M20 9v6M8 12h8' },
  mind:   { bg: '#F2E9FB', stroke: '#5D2BAA', icon: 'M12 4a5 5 0 015 5c0 3-2 4-2 6v1H9v-1c0-2-2-3-2-6a5 5 0 015-5zM10 19h4M11 21h2' },
  water:  { bg: '#D8EBFF', stroke: '#1527A9', icon: 'M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11zM9 14c0 2 1 3 3 3' },
  doctor: { bg: '#D4F8E7', stroke: '#0C5338', icon: 'M12 4l4 4-4 4-4-4 4-4zM4 14h16v6H4zM12 14v6M8 17h8' },
};

const ActivityIcon = ({ kind, size = 36 }) => {
  const g = ACTIVITY_GLYPHS[kind] || ACTIVITY_GLYPHS.run;
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path d={g.icon} stroke={g.stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Shared layout — centered 520px column with the Olimpipo header strip.
// ---------------------------------------------------------------------------

const OlimpipoHeader = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      font: '500 12px/16px var(--font-mono)', color: '#9B3A1B',
      textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12,
    }}>
      <img src="assets/icons/illus-olimpipo.svg" alt="" style={{ width: 20, height: 20 }} />
      {eyebrow}
    </div>
    <h1 style={{
      margin: 0,
      font: '500 30px/36px var(--font-heading)',
      color: '#000',
      letterSpacing: -0.4,
    }}>{title}</h1>
    {sub && (
      <p style={{
        margin: '10px 0 0',
        font: '400 15px/22px var(--font-body)',
        color: 'var(--fg-3)',
        maxWidth: 480,
      }}>{sub}</p>
    )}
  </div>
);

const OlimpipoShell = ({ children }) => (
  <div style={{
    width: '100%', display: 'flex', justifyContent: 'center',
    padding: '32px 24px 96px', boxSizing: 'border-box',
  }}>
    <div style={{ width: '100%', maxWidth: 520 }}>
      {children}
    </div>
  </div>
);

// ===========================================================================
// 1. Editions list
// ===========================================================================

const OlimpipoEditionsScreen = ({ onOpenEdition }) => {
  const active = OLIMPIPO_EDITIONS.find(e => e.active);
  const past = OLIMPIPO_EDITIONS.filter(e => !e.active);

  return (
    <OlimpipoShell>
      <OlimpipoHeader
        eyebrow="Olimpipo"
        title="Suas edições"
        sub="Toda edição da Olimpipo dura um mês. Apenas a edição mais recente está ativa — registre suas atividades e dispute o pódio."
      />

      {/* Active edition — hero card with the torch grafismo */}
      {active && (
        <button
          onClick={() => onOpenEdition(active)}
          style={{
            position: 'relative',
            width: '100%',
            border: 'none',
            borderRadius: 20,
            padding: '26px 28px',
            textAlign: 'left',
            background: '#060D41',
            color: '#fff',
            cursor: 'pointer',
            overflow: 'hidden',
            display: 'block',
            font: 'inherit',
            marginBottom: 36,
            transition: 'box-shadow 160ms var(--ease-standard)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(6,13,65,0.28)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {/* Decorative dots grafismo */}
          <img
            src="assets/illustrations/grafismo-dots-azul-claro.svg"
            alt=""
            style={{
              position: 'absolute', right: -30, top: -30,
              width: 200, height: 200, opacity: 0.35, pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '4px 10px 4px 8px',
              background: 'rgba(212,248,231,0.18)',
              color: '#7AE2B5',
              borderRadius: 999,
              font: '500 11px/1.4 var(--font-mono)',
              marginBottom: 16,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#7AE2B5',
                boxShadow: '0 0 0 3px rgba(122,226,181,0.25)',
              }} />
              Edição ativa
            </div>
            <div style={{
              font: '500 28px/34px var(--font-heading)',
              letterSpacing: -0.3,
              marginBottom: 6,
            }}>
              {active.label}
            </div>
            <div style={{ font: '400 14px/22px var(--font-body)', color: '#BCC4F5' }}>
              {active.period} · faltam {active.days_remaining} dias
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16, marginTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              paddingTop: 20,
            }}>
              <Stat color="#fff" label="Sua posição" value={`#${active.my_rank}`} />
              <Stat color="#fff" label="Seus pontos" value={active.my_points} />
              <Stat color="#fff" label="Participantes" value={active.participants} />
            </div>

            <div style={{
              marginTop: 24,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              font: '600 14px/20px var(--font-ui)', color: '#fff',
            }}>
              Ver classificação
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </div>
          </div>
        </button>
      )}

      {/* Past editions */}
      <div>
        <h2 style={{
          margin: '0 0 14px',
          font: '500 16px/22px var(--font-heading)',
          color: '#000',
        }}>Edições anteriores</h2>
        <div style={{ borderTop: '1px solid #E2E1DF' }}>
          {past.map(ed => {
            // Derive medal styling from final rank.
            const tier =
              ed.my_rank === 1 ? { kind: 'gold',   bg: '#FFE9A8', fg: '#7A5200', medal: '#C69414', label: '🥇 1º lugar' } :
              ed.my_rank === 2 ? { kind: 'silver', bg: '#ECECEC', fg: '#3C404A', medal: '#9A9A9A', label: '🥈 2º lugar' } :
              ed.my_rank === 3 ? { kind: 'bronze', bg: '#F4D9BD', fg: '#6B3A14', medal: '#A26431', label: '🥉 3º lugar' } :
              ed.my_rank <= 10 ? { kind: 'top10',  bg: '#FFEEC2', fg: '#7A4A00', medal: '#C69414', label: '🏅 Top 10' } :
                                 { kind: 'none',   bg: '#F4F2EF', fg: '#3C404A', medal: '#BCBAB5', label: null };

            return (
              <button
                key={ed.id}
                onClick={() => onOpenEdition(ed)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #E2E1DF',
                  padding: '16px 4px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                  transition: 'background 120ms var(--ease-standard)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Rank chip with medal ring for top 3 */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: tier.bg,
                  border: tier.kind === 'gold' || tier.kind === 'silver' || tier.kind === 'bronze'
                    ? `2px solid ${tier.medal}` : '1px solid transparent',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  color: tier.fg,
                  position: 'relative',
                }}>
                  <span style={{
                    font: '500 9px/1 var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    opacity: 0.7,
                    marginBottom: 2,
                  }}>pos.</span>
                  <span style={{
                    font: '600 20px/1 var(--font-heading)',
                    letterSpacing: -0.3,
                  }}>{ed.my_rank}</span>
                  {(tier.kind === 'gold' || tier.kind === 'silver' || tier.kind === 'bronze') && (
                    <span style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 22, height: 22, borderRadius: '50%',
                      background: tier.medal, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, lineHeight: 1,
                      border: '2px solid #fff',
                    }}>
                      {tier.kind === 'gold' ? '★' : tier.kind === 'silver' ? '★' : '★'}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ font: '500 15px/22px var(--font-body)', color: '#000' }}>
                      {ed.label}
                    </span>
                    {tier.label && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px',
                        background: tier.bg, color: tier.fg,
                        borderRadius: 999,
                        font: '500 10px/1.4 var(--font-mono)',
                      }}>{tier.label}</span>
                    )}
                  </div>
                  <div style={{ font: '400 13px/18px var(--font-body)', color: 'var(--fg-3)', marginTop: 2 }}>
                    {ed.my_points} pontos · {ed.my_activities} atividades · {ed.participants} participantes
                  </div>
                </div>
                <span style={{ color: '#3C404A', fontSize: 20, lineHeight: 1, flexShrink: 0 }}>›</span>
              </button>
            );
          })}
        </div>
      </div>
    </OlimpipoShell>
  );
};

const Stat = ({ label, value, color = '#000' }) => (
  <div>
    <div style={{
      font: '500 22px/26px var(--font-heading)',
      color,
      letterSpacing: -0.2,
    }}>{value}</div>
    <div style={{
      font: '400 12px/16px var(--font-body)',
      color: color === '#fff' ? 'rgba(255,255,255,0.7)' : 'var(--fg-3)',
      marginTop: 2,
    }}>{label}</div>
  </div>
);

// ===========================================================================
// 2. Ranking — for active edition
// ===========================================================================

const PodiumCard = ({ rank, name, dept, points }) => {
  const accents = {
    1: { tint: '#FFE9A8', medal: '#C69414', label: '1º' },
    2: { tint: '#E6E6E6', medal: '#6B6663', label: '2º' },
    3: { tint: '#F2D6BB', medal: '#A26431', label: '3º' },
  }[rank];
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: accents.tint,
      borderRadius: 14,
      padding: '14px 12px 16px',
      textAlign: 'center',
      transform: rank === 1 ? 'translateY(-10px)' : 'none',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: accents.medal, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        font: '600 13px/1 var(--font-mono)', marginBottom: 8,
      }}>{accents.label}</div>
      <div style={{
        font: '500 14px/18px var(--font-body)', color: '#000',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{name.split(' ')[0]}</div>
      <div style={{
        font: '400 11px/16px var(--font-body)', color: 'var(--fg-3)',
      }}>{dept}</div>
      <div style={{
        marginTop: 8,
        font: '500 15px/20px var(--font-heading)', color: '#000',
      }}>{points} pts</div>
    </div>
  );
};

const OlimpipoRankingScreen = ({ edition, onBack, onOpenActivities }) => {
  const [tab, setTab] = useStateOl('all');
  const [showAll, setShowAll] = useStateOl(false);
  const top3 = OLIMPIPO_RANKING.slice(0, 3);
  const rest = OLIMPIPO_RANKING.slice(3);
  const me = OLIMPIPO_RANKING.find(r => r.me);

  // 5 rows centered on the user — clamp at list edges.
  const meIdx = OLIMPIPO_RANKING.findIndex(r => r.me);
  const windowSize = 5;
  let start = Math.max(0, meIdx - 2);
  let end = start + windowSize;
  if (end > OLIMPIPO_RANKING.length) {
    end = OLIMPIPO_RANKING.length;
    start = Math.max(0, end - windowSize);
  }
  const visibleRows = showAll ? OLIMPIPO_RANKING : OLIMPIPO_RANKING.slice(start, end);

  return (
    <OlimpipoShell>
      <OlimpipoHeader
        eyebrow={`Olimpipo · ${edition.label}`}
        title="Classificação"
        sub={`${edition.period} · ${edition.participants} pessoas participando.${edition.active ? ` Faltam ${edition.days_remaining} dias.` : ''}`}
      />

      {/* My position card */}
      <div style={{
        background: '#F7F3EB',
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: 28,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#fff', border: '2px solid #000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '600 16px/1 var(--font-mono)', color: '#000', flexShrink: 0,
        }}>#{me.rank}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '500 16px/22px var(--font-body)', color: '#000' }}>Você</div>
          <div style={{ font: '400 13px/18px var(--font-body)', color: 'var(--fg-3)', marginTop: 2 }}>
            {me.points} pontos · {me.activities} atividades
          </div>
        </div>
        <button
          onClick={onOpenActivities}
          style={{
            background: '#000', color: '#fff', border: 'none',
            padding: '10px 16px', borderRadius: 8,
            font: '600 13px/18px var(--font-ui)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            flexShrink: 0,
          }}
        >
          Ver minhas atividades
          <span style={{ fontSize: 14 }}>→</span>
        </button>
      </div>

      {/* Podium */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 20,
        }}>
          {/* Re-arrange 2-1-3 visually */}
          <PodiumCard {...top3[1]} />
          <PodiumCard {...top3[0]} />
          <PodiumCard {...top3[2]} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 8,
        background: '#F4F2EF', borderRadius: 999, padding: 4,
      }}>
        {[
          { id: 'all', label: 'Geral' },
          { id: 'dept', label: 'Meu time' },
          { id: 'friends', label: 'Amigos' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, border: 'none',
              background: tab === t.id ? '#fff' : 'transparent',
              boxShadow: tab === t.id ? 'inset 0 0 0 1px #E2E1DF' : 'none',
              color: '#000',
              font: '600 13px/20px var(--font-ui)',
              padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
              transition: 'background 120ms var(--ease-standard)',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Full ranking list */}
      <div style={{ marginTop: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 4px',
          font: '500 11px/16px var(--font-mono)', color: 'var(--fg-3)',
          textTransform: 'uppercase', letterSpacing: 0.6,
          borderBottom: '1px solid #E2E1DF',
        }}>
          <span style={{ width: 36 }}>#</span>
          <span style={{ flex: 1 }}>Participante</span>
          <span style={{ width: 70, textAlign: 'right' }}>Pontos</span>
        </div>
        {visibleRows.map(r => (
          <div
            key={r.rank}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 12px',
              borderBottom: '1px solid #E2E1DF',
              background: r.me ? '#F7F3EB' : 'transparent',
              borderRadius: r.me ? 10 : 0,
              margin: r.me ? '4px 0' : 0,
              borderLeft: r.me ? '3px solid #000' : '3px solid transparent',
            }}
          >
            <span style={{
              width: 30, textAlign: 'center',
              font: '500 14px/1 var(--font-mono)',
              color: r.rank <= 3 ? '#9B3A1B' : '#000',
            }}>{r.rank}</span>
            <Avatar name={r.name} size={32} color="#fff" fg="#000"
              style={{ border: '1px solid #E2E1DF' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                font: r.me ? '600 14px/18px var(--font-body)' : '500 14px/18px var(--font-body)',
                color: '#000',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{r.me ? `${r.name} (você)` : r.name}</div>
              <div style={{
                font: '400 12px/16px var(--font-body)', color: 'var(--fg-3)',
              }}>{r.dept} · {r.activities} atividades</div>
            </div>
            <span style={{
              width: 70, textAlign: 'right',
              font: '600 14px/1 var(--font-mono)', color: '#000',
            }}>{r.points}</span>
          </div>
        ))}
      </div>

      {/* Toggle full ranking */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button
          onClick={() => setShowAll(v => !v)}
          style={{
            background: '#fff', color: '#000',
            border: '1px solid #E2E1DF', borderRadius: 999,
            padding: '10px 20px',
            font: '600 13px/18px var(--font-ui)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            transition: 'box-shadow 160ms var(--ease-standard)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #BCBAB5'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {showAll
            ? 'Mostrar somente próximos a mim'
            : `Ver classificação completa (${OLIMPIPO_RANKING.length})`}
          <span style={{ fontSize: 12, lineHeight: 1 }}>{showAll ? '▴' : '▾'}</span>
        </button>
      </div>
    </OlimpipoShell>
  );
};

// ===========================================================================
// 3. Activities submitted by the user during the active edition
// ===========================================================================

const OlimpipoActivitiesScreen = ({ edition, onBack }) => {
  const totalPoints = OLIMPIPO_ACTIVITIES
    .filter(a => a.status === 'aprovada')
    .reduce((s, a) => s + a.points, 0);

  return (
    <OlimpipoShell>
      <OlimpipoHeader
        eyebrow={`Olimpipo · ${edition.label}`}
        title="Minhas atividades"
        sub={`Atividades submetidas no período da edição (${edition.period}).`}
      />

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12, marginBottom: 24,
      }}>
        <SummaryCell label="Atividades" value={OLIMPIPO_ACTIVITIES.length} />
        <SummaryCell label="Pontos" value={totalPoints} />
        <SummaryCell label="Posição" value={`#${edition.my_rank}`} />
      </div>

      {/* Add activity CTA */}
      <button
        style={{
          width: '100%',
          background: '#000', color: '#fff', border: 'none',
          padding: '14px 18px', borderRadius: 10,
          font: '600 14px/20px var(--font-ui)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
        Registrar nova atividade
      </button>

      {/* List */}
      <div>
        <h2 style={{
          margin: '0 0 12px',
          font: '500 16px/22px var(--font-heading)',
          color: '#000',
        }}>Histórico</h2>

        <div style={{ borderTop: '1px solid #E2E1DF' }}>
          {OLIMPIPO_ACTIVITIES.map(a => (
            <div
              key={a.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 4px',
                borderBottom: '1px solid #E2E1DF',
              }}
            >
              <ActivityIcon kind={a.kind} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ font: '500 15px/20px var(--font-body)', color: '#000' }}>
                    {a.type}
                  </span>
                  {a.status === 'em análise' && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px',
                      background: '#FFEEC2', color: '#7A4A00',
                      borderRadius: 999,
                      font: '500 10px/1.4 var(--font-mono)',
                    }}>em análise</span>
                  )}
                </div>
                <div style={{
                  font: '400 12px/18px var(--font-body)', color: 'var(--fg-3)',
                }}>
                  {a.date} · {a.duration} · {a.metric}
                </div>
              </div>
              <div style={{
                font: '600 14px/1 var(--font-mono)', color: '#000',
                flexShrink: 0,
              }}>
                +{a.points} <span style={{ color: 'var(--fg-3)', fontWeight: 400 }}>pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OlimpipoShell>
  );
};

const SummaryCell = ({ label, value }) => (
  <div style={{
    background: '#F7F3EB',
    borderRadius: 12,
    padding: '14px 16px',
  }}>
    <div style={{
      font: '500 22px/26px var(--font-heading)', color: '#000', letterSpacing: -0.2,
    }}>{value}</div>
    <div style={{
      font: '400 12px/16px var(--font-body)', color: 'var(--fg-3)', marginTop: 2,
    }}>{label}</div>
  </div>
);

Object.assign(window, {
  OlimpipoEditionsScreen, OlimpipoRankingScreen, OlimpipoActivitiesScreen,
});
