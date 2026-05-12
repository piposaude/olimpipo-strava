import { ActivityIcon } from '../activity-icon/activity-icon';
import { OlimpipoShell, OlimpipoHeader } from '../shell/olimpipo-shell';
import { OLIMPIPO_ACTIVITIES, type Edition } from '../types';
import styles from './activities-screen.module.css';

export type ActivitiesScreenProps = {
  edition: Edition;
  onBack: () => void;
};

export function ActivitiesScreen({ edition, onBack }: ActivitiesScreenProps) {
  const totalPoints = OLIMPIPO_ACTIVITIES
    .filter((a) => a.status === 'aprovada')
    .reduce((s, a) => s + a.points, 0);

  return (
    <OlimpipoShell>
      <button type="button" onClick={onBack} className={styles.back}>
        ← Voltar
      </button>
      <OlimpipoHeader
        eyebrow={`Olimpipo · ${edition.label}`}
        title="Minhas atividades"
        sub={`Atividades submetidas no período da edição (${edition.period}).`}
      />

      {/* Summary strip */}
      <div className={styles.summary}>
        <div className={styles.summaryCell}>
          <div className={styles.summaryValue}>{OLIMPIPO_ACTIVITIES.length}</div>
          <div className={styles.summaryLabel}>Atividades</div>
        </div>
        <div className={styles.summaryCell}>
          <div className={styles.summaryValue}>{totalPoints}</div>
          <div className={styles.summaryLabel}>Pontos</div>
        </div>
        <div className={styles.summaryCell}>
          <div className={styles.summaryValue}>#{edition.my_rank}</div>
          <div className={styles.summaryLabel}>Posição</div>
        </div>
      </div>

      {/* Add activity CTA */}
      <button type="button" className={styles.addCta}>
        <span className={styles.addCtaPlus} aria-hidden="true">+</span>
        Registrar nova atividade
      </button>

      {/* History list */}
      <section>
        <h2 className={styles.historyTitle}>Histórico</h2>

        <div className={styles.list}>
          {OLIMPIPO_ACTIVITIES.map((a) => (
            <div key={a.id} className={styles.row}>
              <ActivityIcon kind={a.kind} size="md" />
              <div className={styles.body}>
                <div className={styles.topLine}>
                  <span className={styles.type}>{a.type}</span>
                  {a.status === 'em análise' && (
                    <span className={styles.statusTag}>em análise</span>
                  )}
                </div>
                <div className={styles.meta}>
                  {a.date} · {a.duration} · {a.metric}
                </div>
              </div>
              <div className={styles.points}>
                +{a.points} <span className={styles.pointsUnit}>pts</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </OlimpipoShell>
  );
}
