import { useNavigate } from '@tanstack/react-router';
import { LinkRow } from '@/components/ui/link-row/link-row';
import { OlimpipoLinkRow } from '@/components/ui/olimpipo-link-row/olimpipo-link-row';
import { targetToPath, type QuickLink } from '@/hooks/use-home';
import styles from './quick-links-section.module.css';

export type QuickLinksSectionProps = { links: QuickLink[] };

export function QuickLinksSection({ links }: QuickLinksSectionProps) {
  const navigate = useNavigate();
  return (
    <section>
      {links.map((link, index) => {
        if (link.variant === 'olimpipo') {
          return (
            <OlimpipoLinkRow
              key={link.target}
              onClick={() => navigate({ to: targetToPath(link.target) })}
            />
          );
        }
        return (
          <LinkRow
            key={link.target}
            iconSrc={link.iconSrc}
            label={link.label}
            isFirst={index === 0}
            onClick={() => navigate({ to: targetToPath(link.target) })}
          />
        );
      })}
      <div className={styles.bottomBorder} />
    </section>
  );
}
