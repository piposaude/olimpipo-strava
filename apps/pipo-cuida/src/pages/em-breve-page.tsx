import { Link } from '@tanstack/react-router';
import styles from './em-breve-page.module.css';

export function EmBrevePage() {
  return (
    <div className={styles.shell}>
      <div className={styles.column}>
        <h1 className={styles.title}>Em breve</h1>
        <p className={styles.subtitle}>Essa parte do Pipo Cuida ainda não está disponível.</p>
        <Link to="/" className={styles.back}>← Voltar ao início</Link>
      </div>
    </div>
  );
}
