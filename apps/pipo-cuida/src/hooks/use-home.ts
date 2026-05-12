export type NavTarget = 'plan' | 'network' | 'claims' | 'olimpipo' | 'carteirinhas' | 'checkup' | 'pinguim';

export type HelpTile = {
  title: string;
  illustrationSrc: string;
  target: NavTarget;
};

export type QuickLink = {
  label: string;
  iconSrc: string;
  target: NavTarget;
  badge?: { label: string; tone: 'success' };
  variant?: 'default' | 'olimpipo';
};

export type Partner = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export type HomeData = {
  user: { name: string };
  helpTiles: [HelpTile, HelpTile];
  quickLinks: QuickLink[];
  partners: Partner[];
};

export function useHome(): HomeData {
  return {
    user: { name: 'Ana Silva' },
    helpTiles: [
      { title: 'Falar com o time de saúde', illustrationSrc: '/assets/illustrations/especialista.svg', target: 'plan' },
      { title: 'Buscar rede credenciada', illustrationSrc: '/assets/illustrations/spot-rede.svg', target: 'network' },
    ],
    quickLinks: [
      { label: 'Carteirinhas', iconSrc: '/assets/icons/illus-benefit-card.svg', target: 'carteirinhas' },
      { label: 'Fazer check-up', iconSrc: '/assets/icons/illus-checkup.svg', target: 'checkup' },
      { label: 'Tirar dúvidas', iconSrc: '/assets/icons/illus-chat-questions.svg', target: 'claims' },
      { label: 'Programa Pinguim', iconSrc: '/assets/icons/illus-programa-pinguim.svg', target: 'pinguim' },
      {
        label: 'Olimpipo',
        iconSrc: '/assets/icons/illus-olimpipo.svg',
        target: 'olimpipo',
        variant: 'olimpipo',
        badge: { label: 'Edição ativa', tone: 'success' },
      },
    ],
    partners: [
      {
        eyebrow: 'Pipo + Beep Saúde',
        title: 'Vacinas à domicílio com desconto.',
        subtitle: 'Acesse o benefício com cupom PIPOSAUDE',
      },
    ],
  };
}

export function targetToPath(target: NavTarget): string {
  return `/${target}`;
}
