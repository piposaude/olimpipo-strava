import { Logo } from '../logo/logo';
import styles from './top-bar.module.css';

export function TopBar() {
  return (
    <header className={styles.bar}>
      <div className={styles.left}><Logo /></div>
      <nav className={styles.nav}>
        <a className={styles.link} href="#meus-dados">Meus dados</a>
        <span className={styles.divider} />
        <a className={styles.link} href="#sair">Sair</a>
      </nav>
    </header>
  );
}
