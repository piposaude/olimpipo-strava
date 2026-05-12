import type { MouseEventHandler, ReactNode } from 'react';
import styles from './link-row.module.css';

export type LinkRowProps = {
  iconSrc: string;
  label: ReactNode;
  isFirst?: boolean;
  trailing?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function LinkRow({ iconSrc, label, isFirst = false, trailing, onClick }: LinkRowProps) {
  return (
    <button
      type="button"
      className={styles.row}
      data-first={isFirst ? '' : undefined}
      onClick={onClick}
    >
      <span className={styles.iconWrap}>
        <img src={iconSrc} alt="" className={styles.icon} />
      </span>
      <span className={styles.label}>
        {label}
        {trailing}
      </span>
      <span className={styles.chevron} aria-hidden="true">›</span>
    </button>
  );
}
