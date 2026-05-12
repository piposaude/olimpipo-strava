import type { MouseEventHandler, ReactNode } from 'react';
import styles from './banner-card.module.css';

export type BannerCardProps = {
  title: ReactNode;
  subtitle: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function BannerCard({ title, subtitle, onClick }: BannerCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <span className={styles.chevron} aria-hidden="true">›</span>
    </button>
  );
}
