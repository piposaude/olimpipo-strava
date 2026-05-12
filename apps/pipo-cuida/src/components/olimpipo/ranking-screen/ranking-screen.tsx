import { useState } from 'react';
import { OlimpipoShell, OlimpipoHeader } from '../shell/olimpipo-shell';
import { OLIMPIPO_RANKING, type Edition, type RankingEntry } from '../types';
import styles from './ranking-screen.module.css';

export type RankingScreenProps = {
  edition: Edition;
  onBack: () => void;
  onOpenActivities: () => void;
};

type Tab = 'all' | 'dept' | 'friends';

type PodiumRank = 1 | 2 | 3;

type PodiumCardProps = {
  entry: RankingEntry;
  rank: PodiumRank;
};

function PodiumCard({ entry, rank }: PodiumCardProps) {
  return (
    <div className={styles.podiumCard} data-rank={rank}>
      <div className={styles.podiumMedal} data-rank={rank}>
        {rank}º
      </div>
      <div className={styles.podiumName}>{entry.name.split(' ')[0]}</div>
      <div className={styles.podiumDept}>{entry.dept}</div>
      <div className={styles.podiumPoints}>{entry.points} pts</div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function RankingScreen({
  edition,
  onBack,
  onOpenActivities,
}: RankingScreenProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [showAll, setShowAll] = useState(false);
  const top3 = OLIMPIPO_RANKING.slice(0, 3);
  const me = OLIMPIPO_RANKING.find((r) => r.me);

  // Window of 5 rows centered on the user.
  const meIdx = OLIMPIPO_RANKING.findIndex((r) => r.me);
  const windowSize = 5;
  let start = Math.max(0, meIdx - 2);
  let end = start + windowSize;
  if (end > OLIMPIPO_RANKING.length) {
    end = OLIMPIPO_RANKING.length;
    start = Math.max(0, end - windowSize);
  }
  const visibleRows = showAll
    ? OLIMPIPO_RANKING
    : OLIMPIPO_RANKING.slice(start, end);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Geral' },
    { id: 'dept', label: 'Meu time' },
    { id: 'friends', label: 'Amigos' },
  ];

  return (
    <OlimpipoShell>
      <button type="button" onClick={onBack} className={styles.back}>
        ← Voltar
      </button>
      <OlimpipoHeader
        eyebrow={`Olimpipo · ${edition.label}`}
        title="Classificação"
        sub={`${edition.period} · ${edition.participants} pessoas participando.${edition.active ? ` Faltam ${edition.days_remaining} dias.` : ''}`}
      />

      {/* My position card */}
      {me && (
        <div className={styles.meCard}>
          <div className={styles.meRank}>#{me.rank}</div>
          <div className={styles.meBody}>
            <div className={styles.meName}>Você</div>
            <div className={styles.meMeta}>
              {me.points} pontos · {me.activities} atividades
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenActivities}
            className={styles.meCta}
          >
            Ver minhas atividades
            <span className={styles.meCtaArrow}>→</span>
          </button>
        </div>
      )}

      {/* Podium — visual order: 2, 1, 3 */}
      <div className={styles.podium}>
        <PodiumCard entry={top3[1]} rank={2} />
        <PodiumCard entry={top3[0]} rank={1} />
        <PodiumCard entry={top3[2]} rank={3} />
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={styles.tab}
            data-active={tab === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ranking list */}
      <div className={styles.list}>
        <div className={styles.listHeader}>
          <span className={styles.colRank}>#</span>
          <span className={styles.colParticipant}>Participante</span>
          <span className={styles.colPoints}>Pontos</span>
        </div>
        {visibleRows.map((r) => (
          <div
            key={r.rank}
            className={styles.row}
            data-me={r.me ? 'true' : 'false'}
          >
            <span
              className={styles.rowRank}
              data-top={r.rank <= 3 ? 'true' : 'false'}
            >
              {r.rank}
            </span>
            <div className={styles.avatar} aria-hidden="true">
              {initials(r.name)}
            </div>
            <div className={styles.rowBody}>
              <div className={styles.rowName} data-me={r.me ? 'true' : 'false'}>
                {r.me ? `${r.name} (você)` : r.name}
              </div>
              <div className={styles.rowMeta}>
                {r.dept} · {r.activities} atividades
              </div>
            </div>
            <span className={styles.rowPoints}>{r.points}</span>
          </div>
        ))}
      </div>

      {/* Toggle full ranking */}
      <div className={styles.toggleWrap}>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className={styles.toggle}
        >
          {showAll
            ? 'Mostrar somente próximos a mim'
            : `Ver classificação completa (${OLIMPIPO_RANKING.length})`}
          <span className={styles.toggleCaret}>{showAll ? '▴' : '▾'}</span>
        </button>
      </div>
    </OlimpipoShell>
  );
}
