import { Link } from '@tanstack/react-router';
import { Route } from '@/routes/connected';
import styles from './connected-page.module.css';

export function ConnectedPage() {
  const { registered } = Route.useSearch();

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.checkmark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l4 4 10-10"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>Strava conectado!</h1>
        <p className={styles.subtitle}>
          {registered} atividades registradas dos últimos 90 dias
        </p>

        <Link to="/olimpipo" className={styles.backLink}>
          Voltar para Olimpipo
          <span className={styles.backArrow} aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
