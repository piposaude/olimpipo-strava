import { OlimpipoShell, OlimpipoHeader } from '../shell/olimpipo-shell';
import { OLIMPIPO_EDITIONS, type Edition } from '../types';
import styles from './editions-screen.module.css';

export type EditionsScreenProps = {
  participantId: string;
  companyId: string;
  onOpenEdition: (edition: Edition) => void;
};

type MedalTier = {
  kind: 'gold' | 'silver' | 'bronze' | 'top10' | 'none';
  label: string | null;
};

function medalTierFor(rank: number): MedalTier {
  if (rank === 1) return { kind: 'gold', label: '🥇 1º lugar' };
  if (rank === 2) return { kind: 'silver', label: '🥈 2º lugar' };
  if (rank === 3) return { kind: 'bronze', label: '🥉 3º lugar' };
  if (rank <= 10) return { kind: 'top10', label: '🏅 Top 10' };
  return { kind: 'none', label: null };
}

export function EditionsScreen({ participantId, companyId, onOpenEdition }: EditionsScreenProps) {
  const STRAVA_CONNECT_URL = `http://localhost:8000/strava/connect?participant_id=${encodeURIComponent(participantId)}&company_id=${encodeURIComponent(companyId)}`;
  const active = OLIMPIPO_EDITIONS.find((e) => e.active);
  const past = OLIMPIPO_EDITIONS.filter((e) => !e.active);

  return (
    <OlimpipoShell>
      {/* Strava connection banner */}
      <a
        className={styles.stravaBanner}
        href={STRAVA_CONNECT_URL}
      >
        <svg
          className={styles.stravaLogo}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Conectar Strava
      </a>

      <OlimpipoHeader
        eyebrow="Olimpipo"
        title="Suas edições"
        sub="Toda edição da Olimpipo dura um mês. Apenas a edição mais recente está ativa — registre suas atividades e dispute o pódio."
      />

      {/* Active edition — hero card */}
      {active && (
        <button
          type="button"
          onClick={() => onOpenEdition(active)}
          className={styles.heroCard}
        >
          <img
            src="/assets/illustrations/grafismo-dots-azul-claro.svg"
            alt=""
            className={styles.heroDots}
          />
          <div className={styles.heroContent}>
            <div className={styles.activeBadge}>
              <span className={styles.activeDot} aria-hidden="true" />
              Edição ativa
            </div>
            <div className={styles.heroTitle}>{active.label}</div>
            <div className={styles.heroSub}>
              {active.period} · faltam {active.days_remaining} dias
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>#{active.my_rank}</div>
                <div className={styles.heroStatLabel}>Sua posição</div>
              </div>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>{active.my_points}</div>
                <div className={styles.heroStatLabel}>Seus pontos</div>
              </div>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>{active.participants}</div>
                <div className={styles.heroStatLabel}>Participantes</div>
              </div>
            </div>

            <div className={styles.heroCta}>
              Ver classificação
              <span className={styles.heroCtaArrow}>→</span>
            </div>
          </div>
        </button>
      )}

      {/* Past editions */}
      <section className={styles.pastSection}>
        <h2 className={styles.pastTitle}>Edições anteriores</h2>
        <div className={styles.pastList}>
          {past.map((ed) => {
            const tier = medalTierFor(ed.my_rank);
            const hasMedal =
              tier.kind === 'gold' ||
              tier.kind === 'silver' ||
              tier.kind === 'bronze';
            return (
              <button
                type="button"
                key={ed.id}
                onClick={() => onOpenEdition(ed)}
                className={styles.pastRow}
              >
                <div className={styles.rankChip} data-tier={tier.kind}>
                  <span className={styles.rankChipEyebrow}>pos.</span>
                  <span className={styles.rankChipValue}>{ed.my_rank}</span>
                  {hasMedal && (
                    <span className={styles.medalStar} aria-hidden="true">
                      ★
                    </span>
                  )}
                </div>

                <div className={styles.pastBody}>
                  <div className={styles.pastTopLine}>
                    <span className={styles.pastLabel}>{ed.label}</span>
                    {tier.label && (
                      <span className={styles.pastTag} data-tier={tier.kind}>
                        {tier.label}
                      </span>
                    )}
                  </div>
                  <div className={styles.pastMeta}>
                    {ed.my_points} pontos · {ed.my_activities} atividades ·{' '}
                    {ed.participants} participantes
                  </div>
                </div>
                <span className={styles.pastChevron} aria-hidden="true">
                  ›
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </OlimpipoShell>
  );
}
