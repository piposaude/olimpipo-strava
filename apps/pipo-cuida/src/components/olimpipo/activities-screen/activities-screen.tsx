import { useEffect, useState } from 'react';
import { ActivityIcon } from '../activity-icon/activity-icon';
import { OlimpipoShell, OlimpipoHeader } from '../shell/olimpipo-shell';
import { OLIMPIPO_ACTIVITIES, type Edition, type ActivityKind } from '../types';
import styles from './activities-screen.module.css';

export type ActivitiesScreenProps = {
  edition: Edition;
  participantId: string;
  companyId: string;
  onBack: () => void;
};

type RealActivity = {
  id: string;
  type: string;
  kind: ActivityKind;
  date: string;
  duration: string;
  metric: string;
  points: number;
  status: 'aprovada';
};

const TYPE_TO_KIND: Record<string, ActivityKind> = {
  Run: 'run', Walk: 'walk', Hike: 'walk',
  Ride: 'bike',
  Swim: 'swim',
  Yoga: 'yoga',
  Workout: 'gym', WeightTraining: 'gym', Elliptical: 'gym', StairStepper: 'gym',
};

function toRealActivity(raw: Record<string, string | number>, idx: number): RealActivity {
  const activityType = String(raw.activity_type ?? 'Workout');
  const durationMin = Number(raw.duration_minutes ?? 0);
  const date = String(raw.date ?? '');
  const registeredAt = String(raw.registered_at ?? '');
  const timeStr = registeredAt.includes('T') ? registeredAt.split('T')[1].slice(0, 5) : '';

  return {
    id: String(raw.strava_activity_id ?? idx),
    type: activityType,
    kind: TYPE_TO_KIND[activityType] ?? 'gym',
    date: timeStr ? `${date} · ${timeStr}` : date,
    duration: `${durationMin} min`,
    metric: activityType === 'Ride' ? 'ciclismo' : activityType === 'Swim' ? 'natação' : 'atividade',
    points: durationMin * 2,
    status: 'aprovada',
  };
}

const HEALTH_ACTIONS_URL = 'http://localhost:8001';

export function ActivitiesScreen({ edition, participantId, companyId, onBack }: ActivitiesScreenProps) {
  const [realActivities, setRealActivities] = useState<RealActivity[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${HEALTH_ACTIONS_URL}/v1/company/${companyId}/participants/activities?participant_id=${encodeURIComponent(participantId)}`)
      .then((r) => r.json())
      .then((data: Record<string, string | number>[]) => {
        setRealActivities(data.length > 0 ? data.map(toRealActivity) : null);
      })
      .catch(() => setRealActivities(null))
      .finally(() => setLoading(false));
  }, [participantId, companyId]);

  const activities = realActivities ?? OLIMPIPO_ACTIVITIES;
  const isReal = realActivities !== null;

  const totalPoints = activities
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

      <div className={styles.summary}>
        <div className={styles.summaryCell}>
          <div className={styles.summaryValue}>{activities.length}</div>
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

      <button type="button" className={styles.addCta}>
        <span className={styles.addCtaPlus} aria-hidden="true">+</span>
        Registrar nova atividade
      </button>

      <section>
        <h2 className={styles.historyTitle}>
          Histórico
          {isReal && <span className={styles.liveTag}>ao vivo</span>}
        </h2>

        {loading && <p className={styles.loading}>Carregando atividades...</p>}

        {!loading && (
          <div className={styles.list}>
            {activities.map((a) => (
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
        )}
      </section>
    </OlimpipoShell>
  );
}
