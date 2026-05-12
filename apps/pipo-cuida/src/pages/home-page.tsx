import { useNavigate } from '@tanstack/react-router';
import { BannerCard } from '@/components/ui/banner-card/banner-card';
import { HelpSection } from '@/components/home/help-section/help-section';
import { QuickLinksSection } from '@/components/home/quick-links-section/quick-links-section';
import { PartnersSection } from '@/components/home/partners-section/partners-section';
import { useHome } from '@/hooks/use-home';
import styles from './home-page.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const { helpTiles, quickLinks, partners } = useHome();

  return (
    <div className={styles.shell}>
      <div className={styles.column}>
        <BannerCard
          title="Como anda sua saúde?"
          subtitle="Complete o questionário de saúde."
          onClick={() => navigate({ to: '/questionario' as string })}
        />
        <HelpSection tiles={helpTiles} />
        <QuickLinksSection links={quickLinks} />
        <PartnersSection partners={partners} />
      </div>
    </div>
  );
}
