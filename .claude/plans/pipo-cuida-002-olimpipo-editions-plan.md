**Task:** pipo-cuida-002
**Spec:** `.claude/specs/pipo-cuida-002-olimpipo-editions-design.md`
**Area:** web

Implementation plan for the Olimpipo editions page at `/olimpipo`. Steps are sequential; each ends with a verification gate.

The plan respects the hook / lib / UI separation enforced by `.claude/rules/nextjs-app.md`. Layers are built bottom-up so each layer's tests pass before the next one consumes it: models → mock fixture → lib + spec → hook + spec → new UI primitive + spec → feature components → page → routes → page test → visual diff.

---

## Step 1 — Add domain models

Create `apps/pipo-cuida/src/models/olimpipo.ts`:

```ts
export type EditionId = string;

export type Edition = {
  id: EditionId;
  label: string;
  period: string;
  active: boolean;
  daysRemaining: number;
  participants: number;
  myRank: number;
  myPoints: number;
  myActivities: number;
};

export type TierKind = 'gold' | 'silver' | 'bronze' | 'top10' | 'none';

export type Tier = {
  kind: TierKind;
  bg: string;
  fg: string;
  medal: string;
  label: string | null;
};

export type EditionWithTier = Edition & { tier: Tier };
```

**Verification:** `npm run typecheck` succeeds.

---

## Step 2 — Add the mock data fixture

Create `apps/pipo-cuida/src/lib/olimpipo/mock-data.ts`:

```ts
import type { Edition } from '@/models/olimpipo';

export const MOCK_OLIMPIPO_EDITIONS: Edition[] = [
  { id: 'mai-26', label: 'Maio/26',     period: '01 — 31 maio 2026',     active: true,
    daysRemaining: 19, participants: 412, myRank: 14, myPoints: 580,  myActivities: 12 },
  { id: 'abr-26', label: 'Abril/26',    period: '01 — 30 abril 2026',    active: false,
    daysRemaining: 0,  participants: 398, myRank: 5,  myPoints: 920,  myActivities: 21 },
  { id: 'mar-26', label: 'Março/26',    period: '01 — 31 março 2026',    active: false,
    daysRemaining: 0,  participants: 376, myRank: 1,  myPoints: 1180, myActivities: 27 },
  { id: 'fev-26', label: 'Fevereiro/26', period: '01 — 28 fevereiro 2026', active: false,
    daysRemaining: 0,  participants: 351, myRank: 22, myPoints: 510,  myActivities: 11 },
  { id: 'jan-26', label: 'Janeiro/26',  period: '01 — 31 janeiro 2026',  active: false,
    daysRemaining: 0,  participants: 312, myRank: 3,  myPoints: 1020, myActivities: 24 },
  { id: 'dez-25', label: 'Dezembro/25', period: '01 — 31 dezembro 2025', active: false,
    daysRemaining: 0,  participants: 289, myRank: 2,  myPoints: 1090, myActivities: 25 },
  { id: 'nov-25', label: 'Novembro/25', period: '01 — 30 novembro 2025', active: false,
    daysRemaining: 0,  participants: 268, myRank: 34, myPoints: 410,  myActivities: 8  },
];
```

**Verification:** `npm run typecheck` succeeds. This is the only file in the repo that holds Olimpipo edition literals.

---

## Step 3 — Implement the pure logic (lib)

Create `apps/pipo-cuida/src/lib/olimpipo/editions.ts`:

```ts
import type { Edition, EditionWithTier, Tier } from '@/models/olimpipo';

export function classifyTier(rank: number): Tier {
  if (rank === 1) return { kind: 'gold',   bg: '#FFE9A8', fg: '#7A5200', medal: '#C69414', label: '🥇 1º lugar' };
  if (rank === 2) return { kind: 'silver', bg: '#ECECEC', fg: '#3C404A', medal: '#9A9A9A', label: '🥈 2º lugar' };
  if (rank === 3) return { kind: 'bronze', bg: '#F4D9BD', fg: '#6B3A14', medal: '#A26431', label: '🥉 3º lugar' };
  if (rank <= 10) return { kind: 'top10',  bg: '#FFEEC2', fg: '#7A4A00', medal: '#C69414', label: '🏅 Top 10' };
  return { kind: 'none', bg: '#F4F2EF', fg: '#3C404A', medal: '#BCBAB5', label: null };
}

export function withTier(edition: Edition): EditionWithTier {
  return { ...edition, tier: classifyTier(edition.myRank) };
}

export type SplitEditions = {
  active: Edition | null;
  past: EditionWithTier[];
};

export function splitEditions(editions: Edition[]): SplitEditions {
  const active = editions.find(e => e.active) ?? null;
  const past = editions.filter(e => !e.active).map(withTier);
  return { active, past };
}
```

Create `apps/pipo-cuida/src/lib/olimpipo/editions.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { classifyTier, splitEditions, withTier } from './editions';
import type { Edition } from '@/models/olimpipo';

function makeEdition(overrides: Partial<Edition>): Edition {
  return {
    id: overrides.id ?? 'edition',
    label: overrides.label ?? 'Edition',
    period: overrides.period ?? 'period',
    active: overrides.active ?? false,
    daysRemaining: overrides.daysRemaining ?? 0,
    participants: overrides.participants ?? 0,
    myRank: overrides.myRank ?? 99,
    myPoints: overrides.myPoints ?? 0,
    myActivities: overrides.myActivities ?? 0,
  };
}

describe('classifyTier', () => {
  it('returns gold for rank 1', () => {
    expect(classifyTier(1).kind).toBe('gold');
    expect(classifyTier(1).label).toBe('🥇 1º lugar');
  });

  it('returns silver for rank 2', () => {
    expect(classifyTier(2).kind).toBe('silver');
    expect(classifyTier(2).label).toBe('🥈 2º lugar');
  });

  it('returns bronze for rank 3', () => {
    expect(classifyTier(3).kind).toBe('bronze');
    expect(classifyTier(3).label).toBe('🥉 3º lugar');
  });

  it('returns top10 for rank 4', () => {
    expect(classifyTier(4).kind).toBe('top10');
    expect(classifyTier(4).label).toBe('🏅 Top 10');
  });

  it('returns top10 for rank 10', () => {
    expect(classifyTier(10).kind).toBe('top10');
  });

  it('returns none for rank 11', () => {
    expect(classifyTier(11).kind).toBe('none');
    expect(classifyTier(11).label).toBeNull();
  });

  it('returns none for very large ranks', () => {
    expect(classifyTier(99).kind).toBe('none');
  });
});

describe('withTier', () => {
  it('attaches the tier matching the rank', () => {
    const edition = makeEdition({ myRank: 1 });
    expect(withTier(edition).tier.kind).toBe('gold');
  });
});

describe('splitEditions', () => {
  it('returns the single active edition and the rest as past with tier', () => {
    const editions: Edition[] = [
      makeEdition({ id: 'a', active: true,  myRank: 14 }),
      makeEdition({ id: 'b', active: false, myRank: 1  }),
      makeEdition({ id: 'c', active: false, myRank: 11 }),
    ];
    const result = splitEditions(editions);
    expect(result.active?.id).toBe('a');
    expect(result.past).toHaveLength(2);
    expect(result.past[0].id).toBe('b');
    expect(result.past[0].tier.kind).toBe('gold');
    expect(result.past[1].id).toBe('c');
    expect(result.past[1].tier.kind).toBe('none');
  });

  it('returns null active when no edition is active', () => {
    const editions: Edition[] = [makeEdition({ id: 'a', active: false })];
    expect(splitEditions(editions).active).toBeNull();
  });

  it('preserves input order in past editions', () => {
    const editions: Edition[] = [
      makeEdition({ id: 'first',  active: false }),
      makeEdition({ id: 'second', active: false }),
      makeEdition({ id: 'third',  active: false }),
    ];
    expect(splitEditions(editions).past.map(e => e.id)).toEqual(['first', 'second', 'third']);
  });
});
```

**Verification:** `npm run test -- editions.spec` — all assertions pass.

> Note on the helper `makeEdition`: it accepts a `Partial<Edition>` and fills the rest with defaults. This is a no-branching helper (single straight-line body that uses `??`). Tests pass the overrides relevant to each scenario; do not introduce mode flags.

---

## Step 4 — Implement the hook

Create `apps/pipo-cuida/src/hooks/use-olimpipo-editions.ts`:

```ts
import { useMemo } from 'react';
import { MOCK_OLIMPIPO_EDITIONS } from '@/lib/olimpipo/mock-data';
import { splitEditions } from '@/lib/olimpipo/editions';
import type { Edition, EditionId, EditionWithTier } from '@/models/olimpipo';

export type OlimpipoEditionsData = {
  activeEdition: Edition | null;
  pastEditions: EditionWithTier[];
};

export function useOlimpipoEditions(): OlimpipoEditionsData {
  return useMemo(() => {
    const { active, past } = splitEditions(MOCK_OLIMPIPO_EDITIONS);
    return { activeEdition: active, pastEditions: past };
  }, []);
}

export function editionPath(editionId: EditionId): string {
  return `/olimpipo/${editionId}`;
}
```

Create `apps/pipo-cuida/src/hooks/use-olimpipo-editions.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOlimpipoEditions, editionPath } from './use-olimpipo-editions';

describe('useOlimpipoEditions', () => {
  it('returns the May/26 edition as active', () => {
    const { result } = renderHook(() => useOlimpipoEditions());
    expect(result.current.activeEdition?.id).toBe('mai-26');
    expect(result.current.activeEdition?.active).toBe(true);
  });

  it('returns six past editions, each with a tier attached', () => {
    const { result } = renderHook(() => useOlimpipoEditions());
    expect(result.current.pastEditions).toHaveLength(6);
    for (const edition of result.current.pastEditions) {
      expect(edition.tier).toBeDefined();
      expect(edition.tier.kind).toMatch(/gold|silver|bronze|top10|none/);
    }
  });

  it('returns a stable reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useOlimpipoEditions());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe('editionPath', () => {
  it('prefixes the id with /olimpipo/', () => {
    expect(editionPath('mai-26')).toBe('/olimpipo/mai-26');
    expect(editionPath('abr-26')).toBe('/olimpipo/abr-26');
  });
});
```

**Verification:** `npm run test -- use-olimpipo-editions.spec` passes. The hook test does not re-assert tier math (the lib test owns it); it asserts only that the hook called the lib and stored the result.

---

## Step 5 — Add the `Stat` primitive

Create `apps/pipo-cuida/src/components/ui/stat/stat.tsx`:

```tsx
import styles from './stat.module.css';

export type StatTone = 'dark' | 'light';

export type StatProps = {
  label: string;
  value: string | number;
  tone?: StatTone;
};

export function Stat({ label, value, tone = 'dark' }: StatProps) {
  return (
    <div className={styles.stat} data-tone={tone}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
```

Create `apps/pipo-cuida/src/components/ui/stat/stat.module.css`:

```css
.stat[data-tone='dark']  { --stat-fg: #000; --stat-meta: var(--fg-3); }
.stat[data-tone='light'] { --stat-fg: #fff; --stat-meta: rgba(255, 255, 255, 0.7); }

.value {
  font: 500 22px/26px var(--font-heading);
  color: var(--stat-fg);
  letter-spacing: -0.2px;
}
.label {
  font: 400 12px/16px var(--font-body);
  color: var(--stat-meta);
  margin-top: 2px;
}
```

Create `apps/pipo-cuida/src/components/ui/stat/stat.spec.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stat } from './stat';

describe('Stat', () => {
  it('renders the value and the label', () => {
    render(<Stat label="Sua posição" value="#14" />);
    expect(screen.getByText('#14')).toBeInTheDocument();
    expect(screen.getByText('Sua posição')).toBeInTheDocument();
  });

  it('reflects the tone prop on data-tone', () => {
    const { container } = render(<Stat label="Pontos" value={580} tone="light" />);
    expect(container.querySelector('[data-tone="light"]')).not.toBeNull();
  });

  it('defaults to dark tone', () => {
    const { container } = render(<Stat label="Pontos" value={580} />);
    expect(container.querySelector('[data-tone="dark"]')).not.toBeNull();
  });
});
```

**Verification:** `npm run test -- stat.spec` passes.

---

## Step 6 — Add the `--font-heading` token alias

Edit `apps/pipo-cuida/src/styles/tokens.css`. Append to the existing alias block at the bottom of the file:

```css
:root {
  /* … existing aliases (--font-display, --font-body, --font-ui, --font-mono, --fg-3, --ease-standard) … */
  --font-heading: var(--pipo-font-display);
}
```

**Verification:** the file still parses (open the running dev server, no console warnings about unknown CSS variables).

---

## Step 7 — Copy the dots illustration

```bash
cp .claude/design/project/assets/illustrations/grafismo-dots-azul-claro.svg \
   apps/pipo-cuida/public/assets/illustrations/
```

**Verification:** `ls apps/pipo-cuida/public/assets/illustrations/` includes `grafismo-dots-azul-claro.svg` (the third file alongside `especialista.svg` and `spot-rede.svg`).

---

## Step 8 — Implement the feature components

Each component lives in `apps/pipo-cuida/src/components/olimpipo/<name>/` with a `.tsx` and a co-located `.module.css`. No specs for the feature components — they are pure presentation; the page-level test covers their integration.

### 8.1 `olimpipo-shell`

`apps/pipo-cuida/src/components/olimpipo/olimpipo-shell/olimpipo-shell.tsx`
```tsx
import type { ReactNode } from 'react';
import styles from './olimpipo-shell.module.css';

export type OlimpipoShellProps = { children: ReactNode };

export function OlimpipoShell({ children }: OlimpipoShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.column}>{children}</div>
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/olimpipo-shell/olimpipo-shell.module.css`
```css
.shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 32px 24px 96px;
  box-sizing: border-box;
}
.column { width: 100%; max-width: 520px; }
```

### 8.2 `olimpipo-header`

`apps/pipo-cuida/src/components/olimpipo/olimpipo-header/olimpipo-header.tsx`
```tsx
import styles from './olimpipo-header.module.css';

export type OlimpipoHeaderProps = {
  eyebrow: string;
  title: string;
  sub?: string;
};

export function OlimpipoHeader({ eyebrow, title, sub }: OlimpipoHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.eyebrow}>
        <img src="/assets/icons/illus-olimpipo.svg" alt="" className={styles.eyebrowIcon} />
        {eyebrow}
      </div>
      <h1 className={styles.title}>{title}</h1>
      {sub && <p className={styles.sub}>{sub}</p>}
    </header>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/olimpipo-header/olimpipo-header.module.css`
```css
.header { margin-bottom: 28px; }
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: 500 12px/16px var(--font-mono);
  color: #9B3A1B;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 12px;
}
.eyebrowIcon { width: 20px; height: 20px; display: block; }
.title {
  margin: 0;
  font: 500 30px/36px var(--font-heading);
  color: #000;
  letter-spacing: -0.4px;
}
.sub {
  margin: 10px 0 0;
  font: 400 15px/22px var(--font-body);
  color: var(--fg-3);
  max-width: 480px;
}
```

### 8.3 `active-edition-card`

`apps/pipo-cuida/src/components/olimpipo/active-edition-card/active-edition-card.tsx`
```tsx
import { Stat } from '@/components/ui/stat/stat';
import type { Edition } from '@/models/olimpipo';
import styles from './active-edition-card.module.css';

export type ActiveEditionCardProps = {
  edition: Edition;
  onOpen: () => void;
};

export function ActiveEditionCard({ edition, onOpen }: ActiveEditionCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <img
        src="/assets/illustrations/grafismo-dots-azul-claro.svg"
        alt=""
        className={styles.dots}
      />
      <div className={styles.body}>
        <div className={styles.pill}>
          <span className={styles.pillDot} aria-hidden="true" />
          Edição ativa
        </div>
        <div className={styles.editionLabel}>{edition.label}</div>
        <div className={styles.editionMeta}>
          {edition.period} · faltam {edition.daysRemaining} dias
        </div>
        <div className={styles.stats}>
          <Stat tone="light" label="Sua posição"  value={`#${edition.myRank}`} />
          <Stat tone="light" label="Seus pontos"  value={edition.myPoints} />
          <Stat tone="light" label="Participantes" value={edition.participants} />
        </div>
        <div className={styles.cta}>
          Ver classificação
          <span aria-hidden="true" className={styles.ctaArrow}>→</span>
        </div>
      </div>
    </button>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/active-edition-card/active-edition-card.module.css`
```css
.card {
  position: relative;
  width: 100%;
  border: none;
  border-radius: 20px;
  padding: 26px 28px;
  text-align: left;
  background: #060D41;
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  display: block;
  font: inherit;
  margin-bottom: 36px;
  transition: box-shadow 160ms var(--ease-standard);
}
.card:hover { box-shadow: 0 6px 28px rgba(6, 13, 65, 0.28); }

.dots {
  position: absolute;
  right: -30px;
  top: -30px;
  width: 200px;
  height: 200px;
  opacity: 0.35;
  pointer-events: none;
}

.body { position: relative; z-index: 1; }

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 8px;
  background: rgba(212, 248, 231, 0.18);
  color: #7AE2B5;
  border-radius: 999px;
  font: 500 11px/1.4 var(--font-mono);
  margin-bottom: 16px;
}
.pillDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7AE2B5;
  box-shadow: 0 0 0 3px rgba(122, 226, 181, 0.25);
}

.editionLabel {
  font: 500 28px/34px var(--font-heading);
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}
.editionMeta {
  font: 400 14px/22px var(--font-body);
  color: #BCC4F5;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.cta {
  margin-top: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: 600 14px/20px var(--font-ui);
  color: #fff;
}
.ctaArrow { font-size: 18px; line-height: 1; }
```

### 8.4 `past-edition-row`

`apps/pipo-cuida/src/components/olimpipo/past-edition-row/past-edition-row.tsx`
```tsx
import type { EditionWithTier } from '@/models/olimpipo';
import styles from './past-edition-row.module.css';

export type PastEditionRowProps = {
  edition: EditionWithTier;
  onOpen: () => void;
};

export function PastEditionRow({ edition, onOpen }: PastEditionRowProps) {
  const { tier } = edition;
  const showStar = tier.kind === 'gold' || tier.kind === 'silver' || tier.kind === 'bronze';

  return (
    <button type="button" className={styles.row} onClick={onOpen}>
      <span
        className={styles.chip}
        data-tier={tier.kind}
        style={{
          background: tier.bg,
          color: tier.fg,
          borderColor: showStar ? tier.medal : 'transparent',
        }}
      >
        <span className={styles.chipLabel}>pos.</span>
        <span className={styles.chipRank}>{edition.myRank}</span>
        {showStar && (
          <span
            className={styles.chipStar}
            style={{ background: tier.medal }}
            aria-hidden="true"
          >
            ★
          </span>
        )}
      </span>

      <span className={styles.body}>
        <span className={styles.headRow}>
          <span className={styles.label}>{edition.label}</span>
          {tier.label !== null && (
            <span
              className={styles.tierPill}
              style={{ background: tier.bg, color: tier.fg }}
            >
              {tier.label}
            </span>
          )}
        </span>
        <span className={styles.meta}>
          {edition.myPoints} pontos · {edition.myActivities} atividades · {edition.participants} participantes
        </span>
      </span>

      <span className={styles.chevron} aria-hidden="true">›</span>
    </button>
  );
}
```

> The `style={{ background: tier.bg, … }}` inline-style attributes are the only inline styles in the feature components — they're data-driven (tier colors come from the model and would otherwise require a CSS variable injection that does the same thing in more steps). The CSS module owns layout/font; runtime colors come from the tier. This is the carve-out documented in `.claude/rules/nextjs-app.md` for one-off data-driven styling.

`apps/pipo-cuida/src/components/olimpipo/past-edition-row/past-edition-row.module.css`
```css
.row {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #E2E1DF;
  padding: 16px 4px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: background 120ms var(--ease-standard);
}
.row:hover { background: #FAFAF9; }

.chip {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.chip[data-tier='top10'],
.chip[data-tier='none'] { border-width: 1px; }
.chipLabel {
  font: 500 9px/1 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  opacity: 0.7;
  margin-bottom: 2px;
}
.chipRank {
  font: 600 20px/1 var(--font-heading);
  letter-spacing: -0.3px;
}
.chipStar {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  border: 2px solid #fff;
}

.body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.headRow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.label { font: 500 15px/22px var(--font-body); color: #000; }
.tierPill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font: 500 10px/1.4 var(--font-mono);
}
.meta { font: 400 13px/18px var(--font-body); color: var(--fg-3); }

.chevron {
  color: #3C404A;
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}
```

### 8.5 `past-editions-list`

`apps/pipo-cuida/src/components/olimpipo/past-editions-list/past-editions-list.tsx`
```tsx
import type { EditionId, EditionWithTier } from '@/models/olimpipo';
import { PastEditionRow } from '@/components/olimpipo/past-edition-row/past-edition-row';
import styles from './past-editions-list.module.css';

export type PastEditionsListProps = {
  editions: EditionWithTier[];
  onOpen: (editionId: EditionId) => void;
};

export function PastEditionsList({ editions, onOpen }: PastEditionsListProps) {
  return (
    <section>
      <h2 className={styles.heading}>Edições anteriores</h2>
      <div className={styles.list}>
        {editions.map(edition => (
          <PastEditionRow
            key={edition.id}
            edition={edition}
            onOpen={() => onOpen(edition.id)}
          />
        ))}
      </div>
    </section>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/past-editions-list/past-editions-list.module.css`
```css
.heading {
  margin: 0 0 14px;
  font: 500 16px/22px var(--font-heading);
  color: #000;
}
.list { border-top: 1px solid #E2E1DF; }
```

**Verification:** `npm run typecheck` succeeds. Components render in Storybook-less isolation only via the page test in Step 10.

---

## Step 9 — Implement the page

`apps/pipo-cuida/src/pages/olimpipo-editions-page.tsx`
```tsx
import { useNavigate } from '@tanstack/react-router';
import { OlimpipoShell } from '@/components/olimpipo/olimpipo-shell/olimpipo-shell';
import { OlimpipoHeader } from '@/components/olimpipo/olimpipo-header/olimpipo-header';
import { ActiveEditionCard } from '@/components/olimpipo/active-edition-card/active-edition-card';
import { PastEditionsList } from '@/components/olimpipo/past-editions-list/past-editions-list';
import { editionPath, useOlimpipoEditions } from '@/hooks/use-olimpipo-editions';
import type { EditionId } from '@/models/olimpipo';

export function OlimpipoEditionsPage() {
  const navigate = useNavigate();
  const { activeEdition, pastEditions } = useOlimpipoEditions();

  const openEdition = (id: EditionId) => navigate({ to: editionPath(id) });

  return (
    <OlimpipoShell>
      <OlimpipoHeader
        eyebrow="Olimpipo"
        title="Suas edições"
        sub="Toda edição da Olimpipo dura um mês. Apenas a edição mais recente está ativa — registre suas atividades e dispute o pódio."
      />
      {activeEdition && (
        <ActiveEditionCard
          edition={activeEdition}
          onOpen={() => openEdition(activeEdition.id)}
        />
      )}
      <PastEditionsList editions={pastEditions} onOpen={openEdition} />
    </OlimpipoShell>
  );
}
```

The page has no CSS module of its own — `OlimpipoShell` owns the layout.

**Verification:** `npm run typecheck` passes.

---

## Step 10 — Wire up the routes

`apps/pipo-cuida/src/routes/olimpipo/index.tsx`
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { OlimpipoEditionsPage } from '@/pages/olimpipo-editions-page';

export const Route = createFileRoute('/olimpipo/')({ component: OlimpipoEditionsPage });
```

`apps/pipo-cuida/src/routes/olimpipo/$editionId.tsx`
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { EmBrevePage } from '@/pages/em-breve-page';

export const Route = createFileRoute('/olimpipo/$editionId')({ component: EmBrevePage });
```

`src/routeTree.gen.ts` regenerates automatically via `@tanstack/router-plugin/vite` on the next `npm run dev` or `npm run build`. If the file is committed by mistake, delete it — it is gitignored.

**Verification:**
- `cd apps/pipo-cuida && npm run dev` — server boots without errors.
- Open `http://localhost:5173/olimpipo` — editions screen renders.
- Open `http://localhost:5173/` and click the "Olimpipo" quick-link row — URL becomes `/olimpipo`, editions screen renders.
- Click the active edition hero — URL becomes `/olimpipo/mai-26`, `EmBrevePage` renders, "Voltar ao início" returns to `/`.
- Click any past edition row — URL becomes `/olimpipo/<id>`, `EmBrevePage` renders.
- `npm run typecheck` passes.

---

## Step 11 — Page-level rendering test

`apps/pipo-cuida/src/pages/olimpipo-editions-page.spec.tsx`
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { OlimpipoEditionsPage } from './olimpipo-editions-page';

function renderOlimpipoEditionsPage() {
  const rootRoute = createRootRoute();
  const editionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/olimpipo',
    component: OlimpipoEditionsPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([editionsRoute]),
    history: createMemoryHistory({ initialEntries: ['/olimpipo'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('OlimpipoEditionsPage', () => {
  it('renders the header, active edition hero and past-editions section', () => {
    renderOlimpipoEditionsPage();
    expect(screen.getByRole('heading', { name: /suas edições/i })).toBeInTheDocument();
    expect(screen.getByText('Maio/26')).toBeInTheDocument();
    expect(screen.getByText(/faltam 19 dias/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /edições anteriores/i })).toBeInTheDocument();
  });

  it('renders the gold tier pill for the rank-1 past edition (Março/26)', () => {
    renderOlimpipoEditionsPage();
    expect(screen.getByText('Março/26')).toBeInTheDocument();
    expect(screen.getByText(/1º lugar/i)).toBeInTheDocument();
  });

  it('renders the three live stats inside the active edition hero', () => {
    renderOlimpipoEditionsPage();
    expect(screen.getByText('Sua posição')).toBeInTheDocument();
    expect(screen.getByText('#14')).toBeInTheDocument();
    expect(screen.getByText('Seus pontos')).toBeInTheDocument();
    expect(screen.getByText('580')).toBeInTheDocument();
    expect(screen.getByText('Participantes')).toBeInTheDocument();
    expect(screen.getByText('412')).toBeInTheDocument();
  });
});
```

The page test does not re-assert tier math or split logic — those layers own their own tests. It only verifies the page wires the hook to the components and the components render the visible text.

**Verification:** `npm run test` — full suite passes, including the new page spec.

---

## Step 12 — Visual diff against the design source

Serve the design source and the running app side by side at 520 px viewport width:

- **Reference:** `python3 -m http.server 8080 --directory .claude/design/project` then `http://localhost:8080/Olimpipo.html` (navigate to the Olimpipo tab if the HTML lists multiple screens).
- **Built app:** `http://localhost:5173/olimpipo`.

Eye-check the following items:

| Item                              | Expected                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| Page padding                      | 32 / 24 / 96 (top / sides / bottom)                                                     |
| Content column                    | 520 px max width, centered                                                              |
| Header eyebrow                    | "OLIMPIPO" in mono uppercase, brick `#9B3A1B`, preceded by 20×20 Olimpipo icon          |
| Header title                      | "Suas edições" 30/36 in `--font-heading`, `-0.4px` letter-spacing                       |
| Active edition card               | `#060D41` background, 20 px radius, decorative dots top-right at 35 % opacity            |
| "Edição ativa" pill               | `rgba(212,248,231,0.18)` bg, `#7AE2B5` text, halo dot                                    |
| Active stats grid                 | Three columns, divider line `rgba(255,255,255,0.12)` above them                          |
| CTA line                          | "Ver classificação →" 14/20 in `--font-ui`, white                                       |
| Past-editions heading             | "Edições anteriores" 16/22                                                               |
| Past-edition row chip             | 52×52, radius 12, tier-colored bg; gold/silver/bronze have 2 px border and star badge   |
| Top10 / none rows                 | No star badge; "none" rows have no tier pill in the title row                            |
| Past-edition meta line            | `${pontos} pontos · ${atividades} atividades · ${participantes} participantes`           |
| Bottom-row chevron                | `#3C404A`, 20 px                                                                         |

Any mismatch — adjust the relevant CSS module before opening the PR.

---

## Done criteria

- All verifications above pass.
- `npm run typecheck`, `npm run test`, and `npm run dev` all succeed; `docker compose up pipo-cuida` continues to boot.
- The home page's "Olimpipo" link navigates to the new editions screen.
- No business logic appears outside `src/lib/olimpipo/`; no mock data appears outside `src/lib/olimpipo/mock-data.ts`.
- No file in `src/components/olimpipo/` or `src/pages/` imports `MOCK_OLIMPIPO_EDITIONS` or calls `classifyTier` directly.
- New test files: `editions.spec.ts`, `use-olimpipo-editions.spec.ts`, `stat.spec.tsx`, `olimpipo-editions-page.spec.tsx`. No branching in tests, helpers, or mocks.

## Handoff

This plan does not include creating a branch, committing, pushing, or opening a PR — those steps belong to the `dev` agent. When the work is complete, hand off to `dev`.
