import type { ActivityKind } from '../types';
import styles from './activity-icon.module.css';

type Glyph = { bg: string; stroke: string; icon: string };

const ACTIVITY_GLYPHS: Record<ActivityKind, Glyph> = {
  run: { bg: '#FFE3D7', stroke: '#9B3A1B', icon: 'M9 18l3-5 3 3 4-7M5 21h14' },
  walk: { bg: '#F7F3EB', stroke: '#3C2A18', icon: 'M9 4l2 5-2 4 3 3 2 5M9 4l-2 4M14 6l3-1' },
  bike: { bg: '#D8EBFF', stroke: '#1527A9', icon: 'M6 18a3 3 0 100-6 3 3 0 000 6zm12 0a3 3 0 100-6 3 3 0 000 6zM8 14l3-7h3l3 5M11 7l3 6' },
  swim: { bg: '#D8EBFF', stroke: '#1527A9', icon: 'M3 16c2 2 4 0 6 0s4 2 6 0 4 2 6 0M3 12c2 2 4 0 6 0s4 2 6 0 4 2 6 0M17 7a2 2 0 100-2 2 2 0 000 2zM10 9l4-2 3 2' },
  yoga: { bg: '#F2E9FB', stroke: '#5D2BAA', icon: 'M12 5a2 2 0 110-2 2 2 0 010 2zM7 21l3-7 2 2 2-2 3 7M9 14l-3-3M15 14l3-3' },
  gym: { bg: '#FFEBEB', stroke: '#902D2D', icon: 'M4 9v6M8 7v10M16 7v10M20 9v6M8 12h8' },
  mind: { bg: '#F2E9FB', stroke: '#5D2BAA', icon: 'M12 4a5 5 0 015 5c0 3-2 4-2 6v1H9v-1c0-2-2-3-2-6a5 5 0 015-5zM10 19h4M11 21h2' },
  water: { bg: '#D8EBFF', stroke: '#1527A9', icon: 'M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11zM9 14c0 2 1 3 3 3' },
  doctor: { bg: '#D4F8E7', stroke: '#0C5338', icon: 'M12 4l4 4-4 4-4-4 4-4zM4 14h16v6H4zM12 14v6M8 17h8' },
};

export type ActivityIconProps = {
  kind: ActivityKind;
  size?: 'sm' | 'md';
};

export function ActivityIcon({ kind, size = 'sm' }: ActivityIconProps) {
  const g = ACTIVITY_GLYPHS[kind];
  return (
    <div
      className={styles.chip}
      data-size={size}
      data-kind={kind}
    >
      <svg
        className={styles.glyph}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={g.icon}
          stroke={g.stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export { ACTIVITY_GLYPHS };
