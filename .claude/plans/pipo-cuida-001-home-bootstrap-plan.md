**Task:** pipo-cuida-001
**Spec:** `.claude/specs/pipo-cuida-001-home-bootstrap-design.md`
**Area:** web

Implementation plan for bootstrapping the pipo-cuida web app with the home screen. Steps are sequential; each ends with a verification gate the dev runs before moving on.

---

## Step 1 — Scaffold the Vite + React + TS project

Create the project skeleton at `apps/pipo-cuida/`.

**Files to create:**

`apps/pipo-cuida/package.json`
```json
{
  "name": "pipo-cuida",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 5173",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@tanstack/react-router": "^1.95.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tanstack/router-plugin": "^1.95.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

`apps/pipo-cuida/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "allowImportingTsExtensions": false,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`apps/pipo-cuida/tsconfig.node.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "composite": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

`apps/pipo-cuida/vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: 'src/routes', generatedRouteTree: 'src/routeTree.gen.ts' }),
    react(),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { host: '0.0.0.0', port: 5173 },
});
```

`apps/pipo-cuida/vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: true,
  },
});
```

`apps/pipo-cuida/vitest.setup.ts`
```ts
import '@testing-library/jest-dom/vitest';
```

`apps/pipo-cuida/index.html`
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pipo Cuida</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/pipo-cuida/.gitignore`
```
node_modules
dist
src/routeTree.gen.ts
.DS_Store
```

**Verification:** `cd apps/pipo-cuida && npm install && npm run typecheck` — succeeds with no errors.

---

## Step 2 — Copy design tokens and write global styles

**Files to create:**

`apps/pipo-cuida/src/styles/tokens.css` — verbatim copy of `.claude/design/project/tokens.css` (do not edit; keep the original brand-team comments).

After copying, append a single alias block at the bottom so component CSS can refer to the short names the design source already uses:

```css
/* ── Aliases used by component CSS modules (mirror the names the design source uses inline) ── */
:root {
  --font-display: var(--pipo-font-display);
  --font-body: var(--pipo-font-body);
  --font-ui: var(--pipo-font-ui);
  --font-mono: var(--pipo-font-mono);
  --fg-3: var(--pipo-neutral-dark);
  --ease-standard: cubic-bezier(.2, 0, 0, 1);
}
```

`apps/pipo-cuida/src/styles/global.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: #FFFFFF;
  font-family: var(--font-body);
  color: #000;
  -webkit-font-smoothing: antialiased;
}

#root { min-height: 100%; }

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: #E2E1DF; border-radius: 10px; }

button { font: inherit; }
```

**Verification:** files exist; nothing imports them yet.

---

## Step 3 — Copy design assets into `public/`

```bash
mkdir -p apps/pipo-cuida/public/assets/icons \
         apps/pipo-cuida/public/assets/illustrations \
         apps/pipo-cuida/public/assets/logos

cp .claude/design/project/assets/icons/illus-benefit-card.svg \
   .claude/design/project/assets/icons/illus-checkup.svg \
   .claude/design/project/assets/icons/illus-chat-questions.svg \
   .claude/design/project/assets/icons/illus-programa-pinguim.svg \
   .claude/design/project/assets/icons/illus-olimpipo.svg \
   .claude/design/project/assets/icons/icon-arrow.svg \
   .claude/design/project/assets/icons/icon-chevron.svg \
   apps/pipo-cuida/public/assets/icons/

cp .claude/design/project/assets/illustrations/especialista.svg \
   .claude/design/project/assets/illustrations/spot-rede.svg \
   apps/pipo-cuida/public/assets/illustrations/

cp .claude/design/project/assets/logos/pipo-wordmark.svg \
   apps/pipo-cuida/public/assets/logos/
```

**Verification:** `ls apps/pipo-cuida/public/assets/icons/` lists 7 files; illustrations lists 2; logos lists 1.

---

## Step 4 — Implement UI primitives

One folder per primitive in `src/components/ui/`. Each contains a `.tsx`, a `.module.css`, and a co-located `*.spec.tsx`. The primitives below are translations of the inline-style code in `.claude/design/project/Primitives.jsx`, `Chrome.jsx`, and `HomeScreen.jsx` — class names map 1:1 to the inline style objects in the source.

### 4.1 `Button` (translated from `Primitives.jsx`)

`apps/pipo-cuida/src/components/ui/button/button.tsx`
```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      className={styles.button}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
```

`apps/pipo-cuida/src/components/ui/button/button.module.css`
```css
.button {
  font-family: var(--font-ui);
  font-weight: 600;
  letter-spacing: 0;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: box-shadow 160ms var(--ease-standard);
}
.button:disabled { cursor: not-allowed; opacity: 0.5; }

.button[data-size='sm'] { font-size: 13px; padding: 6px 12px; }
.button[data-size='md'] { font-size: 14px; padding: 10px 18px; }
.button[data-size='lg'] { font-size: 15px; padding: 12px 22px; }

.button[data-variant='primary']   { background: #000; color: #fff; border: 1px solid #000; }
.button[data-variant='secondary'] { background: #fff; color: #000; border: 1px solid #E2E1DF; }
.button[data-variant='ghost']     { background: transparent; color: #000; border: 1px solid transparent; }
.button[data-variant='danger']    { background: #F04646; color: #fff; border: 1px solid #F04646; }

.button[data-variant='primary']:hover:not(:disabled) { box-shadow: inset 0 0 0 2px #000; }
.button[data-variant='danger']:hover:not(:disabled)  { box-shadow: inset 0 0 0 2px #902D2D; }
.button[data-variant='secondary']:hover:not(:disabled),
.button[data-variant='ghost']:hover:not(:disabled)   { box-shadow: inset 0 0 0 1px #BCBAB5; }
```

`apps/pipo-cuida/src/components/ui/button/button.spec.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Acessar</Button>);
    expect(screen.getByRole('button', { name: /acessar/i })).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Acessar</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Acessar</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

### 4.2 `Logo`

`apps/pipo-cuida/src/components/ui/logo/logo.tsx`
```tsx
import styles from './logo.module.css';

export type LogoProps = { size?: number; dark?: boolean };

export function Logo({ size = 22, dark = false }: LogoProps) {
  return (
    <img
      src="/assets/logos/pipo-wordmark.svg"
      alt="Pipo"
      className={styles.logo}
      style={{ height: size, filter: dark ? 'invert(1)' : 'none' }}
    />
  );
}
```

`apps/pipo-cuida/src/components/ui/logo/logo.module.css`
```css
.logo { display: inline-block; width: auto; }
```

`apps/pipo-cuida/src/components/ui/logo/logo.spec.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('renders the pipo wordmark with accessible alt text', () => {
    render(<Logo />);
    const img = screen.getByAltText('Pipo');
    expect(img).toHaveAttribute('src', '/assets/logos/pipo-wordmark.svg');
  });
});
```

### 4.3 `TopBar` (translated from `Chrome.jsx`)

`apps/pipo-cuida/src/components/ui/top-bar/top-bar.tsx`
```tsx
import { Logo } from '../logo/logo';
import styles from './top-bar.module.css';

export function TopBar() {
  return (
    <header className={styles.bar}>
      <div className={styles.left}><Logo /></div>
      <nav className={styles.nav}>
        <a className={styles.link} href="#meus-dados">Meus dados</a>
        <span className={styles.divider} />
        <a className={styles.link} href="#sair">Sair</a>
      </nav>
    </header>
  );
}
```

`apps/pipo-cuida/src/components/ui/top-bar/top-bar.module.css`
```css
.bar {
  height: 64px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 0 40px;
  justify-content: space-between;
  flex-shrink: 0;
}
.left { display: flex; align-items: center; }
.nav { display: flex; align-items: center; gap: 20px; }
.link {
  font: 400 14px/20px var(--font-body);
  color: #000;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.divider { width: 1px; height: 16px; background: #BCBAB5; }
```

`apps/pipo-cuida/src/components/ui/top-bar/top-bar.spec.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import { TopBar } from './top-bar';

describe('TopBar', () => {
  it('renders the wordmark, "Meus dados" and "Sair" links', () => {
    render(<TopBar />);
    expect(screen.getByAltText('Pipo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /meus dados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sair/i })).toBeInTheDocument();
  });
});
```

### 4.4 `BannerCard` (translated from the survey banner in `HomeScreen.jsx`)

`apps/pipo-cuida/src/components/ui/banner-card/banner-card.tsx`
```tsx
import type { MouseEventHandler, ReactNode } from 'react';
import styles from './banner-card.module.css';

export type BannerCardProps = {
  title: ReactNode;
  subtitle: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function BannerCard({ title, subtitle, onClick }: BannerCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <span className={styles.chevron} aria-hidden="true">›</span>
    </button>
  );
}
```

`apps/pipo-cuida/src/components/ui/banner-card/banner-card.module.css`
```css
.card {
  width: 100%;
  background: #F7F3EB;
  border: none;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  color: inherit;
  transition: box-shadow 160ms var(--ease-standard);
}
.card:hover { box-shadow: inset 0 0 0 1px #BCBAB5; }

.text { font: inherit; }
.title { font: 500 16px/22px var(--font-display); color: #000; }
.subtitle { font: 400 13px/20px var(--font-body); color: var(--fg-3); margin-top: 4px; }
.chevron { color: #000; font-size: 22px; line-height: 1; flex-shrink: 0; }
```

### 4.5 `BigTile`

`apps/pipo-cuida/src/components/ui/big-tile/big-tile.tsx`
```tsx
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
```

`apps/pipo-cuida/src/components/ui/big-tile/big-tile.module.css`
```css
.tile {
  background: #F7F3EB;
  border: none;
  border-radius: 12px;
  padding: 22px 22px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 200px;
  cursor: pointer;
  text-align: left;
  color: inherit;
  transition: box-shadow 160ms var(--ease-standard);
}
.tile:hover { box-shadow: inset 0 0 0 1px #BCBAB5; }
.title { font: 500 17px/22px var(--font-display); color: #000; max-width: 160px; }
.illustration { width: 96px; height: 96px; object-fit: contain; align-self: center; margin-top: 8px; display: block; }
```

### 4.6 `LinkRow`

`apps/pipo-cuida/src/components/ui/link-row/link-row.tsx`
```tsx
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
```

`apps/pipo-cuida/src/components/ui/link-row/link-row.module.css`
```css
.row {
  width: 100%;
  background: transparent;
  border: none;
  border-top: 1px solid #E2E1DF;
  padding: 14px 4px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: background 120ms var(--ease-standard);
}
.row[data-first] { border-top: none; }
.row:hover { background: #FAFAF9; }

.iconWrap { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon { width: 40px; height: 40px; display: block; }
.label { flex: 1; font: 400 15px/22px var(--font-body); color: #000; display: flex; align-items: center; gap: 10px; }
.chevron { color: #3C404A; font-size: 20px; line-height: 1; }
```

### 4.7 `OlimpipoLinkRow`

`apps/pipo-cuida/src/components/ui/olimpipo-link-row/olimpipo-link-row.tsx`
```tsx
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
```

`apps/pipo-cuida/src/components/ui/olimpipo-link-row/olimpipo-link-row.module.css`
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px 2px 8px;
  background: #D4F8E7;
  color: #0C5338;
  border-radius: 999px;
  font: 500 11px/1.4 var(--font-mono);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1E9B5F;
  box-shadow: 0 0 0 3px rgba(30, 155, 95, 0.18);
}
```

### 4.8 `PartnerCard`

`apps/pipo-cuida/src/components/ui/partner-card/partner-card.tsx`
```tsx
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
```

`apps/pipo-cuida/src/components/ui/partner-card/partner-card.module.css`
```css
.card {
  width: 100%;
  background: #F2E9FB;
  border: none;
  border-radius: 12px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: box-shadow 160ms var(--ease-standard);
}
.card:hover { box-shadow: inset 0 0 0 1px #8B3ADD; }
.body { flex: 1; }
.eyebrowRow { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.glyph { display: block; }
.eyebrow { font: 500 15px/22px var(--font-display); color: #8B3ADD; }
.title { font: 500 14px/22px var(--font-body); color: #000; }
.subtitle { font: 400 14px/22px var(--font-body); color: #000; }
.arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid #8B3ADD;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B3ADD;
  font-size: 18px;
  flex-shrink: 0;
}
```

### 4.9 Smoke tests for the remaining primitives

For `BannerCard`, `BigTile`, `LinkRow`, `OlimpipoLinkRow`, `PartnerCard`: follow the exact `Button` test shape — render, assert visible content (title/label/eyebrow), assert `onClick` fires. Each `*.spec.tsx` is its own file under the primitive's folder. No branching, no shared mock factories.

**Verification:** `npm run test` — all primitive specs pass.

---

## Step 5 — Implement `useHome` hook

`apps/pipo-cuida/src/hooks/use-home.ts`
```ts
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
```

`apps/pipo-cuida/src/hooks/use-home.spec.ts`
```ts
import { renderHook } from '@testing-library/react';
import { useHome, targetToPath } from './use-home';

describe('useHome', () => {
  it('returns two help tiles and five quick links with one Olimpipo entry', () => {
    const { result } = renderHook(() => useHome());
    expect(result.current.helpTiles).toHaveLength(2);
    expect(result.current.quickLinks).toHaveLength(5);
    const olimpipo = result.current.quickLinks.find(link => link.target === 'olimpipo');
    expect(olimpipo?.variant).toBe('olimpipo');
    expect(olimpipo?.badge?.label).toBe('Edição ativa');
  });

  it('renders one partner', () => {
    const { result } = renderHook(() => useHome());
    expect(result.current.partners).toHaveLength(1);
    expect(result.current.partners[0].eyebrow).toBe('Pipo + Beep Saúde');
  });
});

describe('targetToPath', () => {
  it('prefixes the target with a slash', () => {
    expect(targetToPath('olimpipo')).toBe('/olimpipo');
    expect(targetToPath('plan')).toBe('/plan');
  });
});
```

---

## Step 6 — Implement home feature sections

`apps/pipo-cuida/src/components/home/help-section/help-section.tsx`
```tsx
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
```

`apps/pipo-cuida/src/components/home/help-section/help-section.module.css`
```css
.heading {
  margin: 0 0 20px;
  font: 500 22px/28px var(--pipo-font-display);
  font-style: normal;
  color: #000;
  text-align: left;
}
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
```

`apps/pipo-cuida/src/components/home/quick-links-section/quick-links-section.tsx`
```tsx
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
```

`apps/pipo-cuida/src/components/home/quick-links-section/quick-links-section.module.css`
```css
.bottomBorder { border-top: 1px solid #E2E1DF; }
```

`apps/pipo-cuida/src/components/home/partners-section/partners-section.tsx`
```tsx
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
```

`apps/pipo-cuida/src/components/home/partners-section/partners-section.module.css`
```css
.heading {
  margin: 0 0 14px;
  font: 500 18px/26px var(--pipo-font-display);
  font-style: normal;
  color: #000;
}
```

---

## Step 7 — Implement pages

`apps/pipo-cuida/src/pages/home-page.tsx`
```tsx
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
          onClick={() => navigate({ to: '/questionario' })}
        />
        <HelpSection tiles={helpTiles} />
        <QuickLinksSection links={quickLinks} />
        <PartnersSection partners={partners} />
      </div>
    </div>
  );
}
```

`apps/pipo-cuida/src/pages/home-page.module.css`
```css
.shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 24px 96px;
  box-sizing: border-box;
}
.column {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}
```

`apps/pipo-cuida/src/pages/em-breve-page.tsx`
```tsx
import { Link } from '@tanstack/react-router';
import styles from './em-breve-page.module.css';

export function EmBrevePage() {
  return (
    <div className={styles.shell}>
      <div className={styles.column}>
        <h1 className={styles.title}>Em breve</h1>
        <p className={styles.subtitle}>Essa parte do Pipo Cuida ainda não está disponível.</p>
        <Link to="/" className={styles.back}>← Voltar ao início</Link>
      </div>
    </div>
  );
}
```

`apps/pipo-cuida/src/pages/em-breve-page.module.css`
```css
.shell { width: 100%; display: flex; justify-content: center; padding: 80px 24px; box-sizing: border-box; }
.column { width: 100%; max-width: 520px; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.title { margin: 0; font: 500 28px/34px var(--pipo-font-display); color: #000; }
.subtitle { margin: 0; font: 400 15px/22px var(--pipo-font-body); color: var(--fg-3); }
.back { font: 400 14px/20px var(--pipo-font-body); color: #000; text-decoration: underline; text-underline-offset: 3px; }
```

---

## Step 8 — Wire up TanStack Router

`apps/pipo-cuida/src/routes/__root.tsx`
```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TopBar } from '@/components/ui/top-bar/top-bar';
import styles from './__root.module.css';

export const Route = createRootRoute({
  component: () => (
    <div className={styles.app}>
      <TopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  ),
});
```

`apps/pipo-cuida/src/routes/__root.module.css`
```css
.app { min-height: 100vh; background: #FFFFFF; display: flex; flex-direction: column; }
.main { flex: 1; }
```

`apps/pipo-cuida/src/routes/index.tsx`
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/pages/home-page';

export const Route = createFileRoute('/')({ component: HomePage });
```

`apps/pipo-cuida/src/routes/$.tsx`
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { EmBrevePage } from '@/pages/em-breve-page';

export const Route = createFileRoute('/$')({ component: EmBrevePage });
```

`apps/pipo-cuida/src/main.tsx`
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './styles/tokens.css';
import './styles/global.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

**Verification:**
- `cd apps/pipo-cuida && npm run dev` — Vite starts on 5173 with no console errors.
- Open `http://localhost:5173/` — home renders with banner, help tiles, quick links (Olimpipo with badge), partner card.
- Click any menu item — URL changes (e.g. `/olimpipo`, `/plan`), `<EmBrevePage />` renders with the back link.
- Click "← Voltar ao início" — URL returns to `/`, home re-renders.
- `npm run typecheck && npm run test` — both pass.

---

## Step 9 — Page-level rendering test

`apps/pipo-cuida/src/pages/home-page.spec.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { HomePage } from './home-page';

function renderHomePage() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('HomePage', () => {
  it('renders the survey banner, help heading, all five quick links and the partner card', () => {
    renderHomePage();
    expect(screen.getByRole('button', { name: /como anda sua saúde/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /como podemos te ajudar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /falar com o time de saúde/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar rede credenciada/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /carteirinhas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fazer check-up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tirar dúvidas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /programa pinguim/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /olimpipo.*edição ativa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pipo \+ beep saúde/i })).toBeInTheDocument();
  });
});
```

**Verification:** `npm run test` passes including the page test.

---

## Step 10 — Dockerize and wire into compose

`apps/pipo-cuida/Dockerfile`
```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

Update `docker-compose.yml` — add a new service entry. The dev should leave the existing services unchanged and append:

```yaml
  pipo-cuida:
    build: ./apps/pipo-cuida
    ports:
      - "5173:5173"
    volumes:
      - ./apps/pipo-cuida/src:/app/src
      - ./apps/pipo-cuida/public:/app/public
```

**Verification:**
- `docker compose build pipo-cuida` succeeds.
- `docker compose up pipo-cuida` boots; `http://localhost:5173/` renders the home identically to the local `npm run dev` run.
- Stop with `docker compose down`.

---

## Step 11 — Visual diff against the design source

Open both side-by-side in the browser at 520px viewport width:

- **Reference:** `.claude/design/project/Olimpipo.html` (the design serves the home as the default route). Serve with any static server, e.g. `python3 -m http.server 8080 --directory .claude/design/project` then open `http://localhost:8080/Olimpipo.html`.
- **Built app:** `http://localhost:5173/`.

Eye-check the following items and resolve any mismatch before opening the PR. Each item maps back to an inline-style value in `HomeScreen.jsx` / `Chrome.jsx`:

| Item                                  | Expected                                                |
| ------------------------------------- | ------------------------------------------------------- |
| Top bar                               | 64px tall, white, wordmark left, two links right        |
| Page padding                          | 40px top / 24px sides / 96px bottom                     |
| Content column                        | 520px max width, centered                                |
| Section spacing                       | 48px between the 4 sections                              |
| Banner card                           | `#F7F3EB` background, 12px radius, 20/24 padding         |
| Help tiles grid                       | 1fr 1fr, 14px gap, 200px min height each                 |
| Tile background                       | `#F7F3EB`, 12px radius                                   |
| Link rows                             | Top border `#E2E1DF` except first; 40×40 icon            |
| Olimpipo badge                        | `#D4F8E7` pill, green dot with halo, `IBM Plex Mono`     |
| Partner card                          | `#F2E9FB` background, purple `#8B3ADD` arrow circle       |
| Headings                              | "Oi, como podemos te ajudar?" 22/28; "Nossos parceiros" 18/26 |

---

## Done criteria

- All steps' verifications pass.
- `apps/pipo-cuida/` builds, types, tests, and serves end-to-end via both `npm run dev` and `docker compose up pipo-cuida`.
- Every menu item navigates and the catch-all renders the `Em breve` screen with a working "Voltar ao início" link.
- No unused exports, no inline `style={...}` attributes outside the carve-out cases declared in the spec.

## Handoff

This plan does not include creating a branch, committing, pushing, or opening a PR — those steps belong to the `dev` agent. When the work is complete, hand off to `dev` for the branch + PR.
