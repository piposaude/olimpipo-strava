import type { MouseEventHandler } from 'react';
import styles from './partner-card.module.css';

export type PartnerCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function PartnerCard({ eyebrow, title, subtitle, onClick }: PartnerCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.body}>
        <div className={styles.eyebrowRow}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={styles.glyph}>
            <g stroke="#8B3ADD" strokeWidth="1.6" strokeLinecap="round" fill="none">
              <path d="M14 3l7 7" />
              <path d="M12.5 6.5l5 5" />
              <path d="M16 8l-9 9-4 1 1-4 9-9z" />
              <path d="M7 17l-3 3" />
            </g>
          </svg>
          <span className={styles.eyebrow}>{eyebrow}</span>
        </div>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </button>
  );
}
