import type { MouseEventHandler } from 'react';
import { LinkRow } from '../link-row/link-row';
import styles from './olimpipo-link-row.module.css';

export type OlimpipoLinkRowProps = { onClick?: MouseEventHandler<HTMLButtonElement> };

export function OlimpipoLinkRow({ onClick }: OlimpipoLinkRowProps) {
  return (
    <LinkRow
      iconSrc="/assets/icons/illus-olimpipo.svg"
      label="Olimpipo"
      onClick={onClick}
      trailing={
        <span className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          Edição ativa
        </span>
      }
    />
  );
}
