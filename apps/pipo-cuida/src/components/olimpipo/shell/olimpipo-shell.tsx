import type { ReactNode } from 'react';
import styles from './olimpipo-shell.module.css';

export type OlimpipoShellProps = {
  children: ReactNode;
};

export function OlimpipoShell({ children }: OlimpipoShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.column}>{children}</div>
    </div>
  );
}

export type OlimpipoHeaderProps = {
  eyebrow: string;
  title: string;
  sub?: string;
};

export function OlimpipoHeader({ eyebrow, title, sub }: OlimpipoHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.eyebrow}>
        <img
          src="/assets/icons/illus-olimpipo.svg"
          alt=""
          className={styles.eyebrowIcon}
        />
        {eyebrow}
      </div>
      <h1 className={styles.title}>{title}</h1>
      {sub && <p className={styles.sub}>{sub}</p>}
    </div>
  );
}
