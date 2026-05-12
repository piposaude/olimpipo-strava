import { useNavigate } from '@tanstack/react-router';
import { BigTile } from '@/components/ui/big-tile/big-tile';
import { targetToPath, type HelpTile } from '@/hooks/use-home';
import styles from './help-section.module.css';

export type HelpSectionProps = { tiles: [HelpTile, HelpTile] };

export function HelpSection({ tiles }: HelpSectionProps) {
  const navigate = useNavigate();
  return (
    <section>
      <h2 className={styles.heading}>Oi, como podemos te ajudar?</h2>
      <div className={styles.grid}>
        {tiles.map(tile => (
          <BigTile
            key={tile.target}
            title={tile.title}
            illustrationSrc={tile.illustrationSrc}
            onClick={() => navigate({ to: targetToPath(tile.target) })}
          />
        ))}
      </div>
    </section>
  );
}
