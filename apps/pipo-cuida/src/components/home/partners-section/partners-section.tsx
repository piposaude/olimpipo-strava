import { PartnerCard } from '@/components/ui/partner-card/partner-card';
import type { Partner } from '@/hooks/use-home';
import styles from './partners-section.module.css';

export type PartnersSectionProps = { partners: Partner[] };

export function PartnersSection({ partners }: PartnersSectionProps) {
  return (
    <section>
      <h3 className={styles.heading}>Nossos parceiros</h3>
      {partners.map(partner => (
        <PartnerCard
          key={partner.eyebrow}
          eyebrow={partner.eyebrow}
          title={partner.title}
          subtitle={partner.subtitle}
        />
      ))}
    </section>
  );
}
