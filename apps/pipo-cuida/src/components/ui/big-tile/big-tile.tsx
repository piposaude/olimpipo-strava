import type { MouseEventHandler } from 'react';
import styles from './big-tile.module.css';

export type BigTileProps = {
  title: string;
  illustrationSrc: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function BigTile({ title, illustrationSrc, onClick }: BigTileProps) {
  return (
    <button type="button" className={styles.tile} onClick={onClick}>
      <span className={styles.title}>{title}</span>
      <img src={illustrationSrc} alt="" className={styles.illustration} />
    </button>
  );
}
