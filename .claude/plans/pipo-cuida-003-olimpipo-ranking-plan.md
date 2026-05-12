**Task:** pipo-cuida-003
**Spec:** `.claude/specs/pipo-cuida-003-olimpipo-ranking-design.md`
**Area:** web

Implementation plan for the Olimpipo edition ranking page at `/olimpipo/$editionId`. Steps are sequential; each ends with a verification gate.

Layers are built bottom-up so each layer's tests pass before the next one consumes it: models → mock fixture → lib + spec → hook + spec → new UI primitive + spec → feature components → page → routes → page test → visual diff. Feature components are implemented without their own spec files — the page-level test in Step 9 covers their integration, matching the precedent set by `pipo-cuida-002`. The four test files required by AC 13 are `ranking.spec.ts`, `use-olimpipo-ranking.spec.ts`, `avatar.spec.tsx`, and `olimpipo-ranking-page.spec.tsx`.

**Blocked by:** `pipo-cuida-002`. This plan assumes the files created by 002 are in place: `src/models/olimpipo.ts`, `src/lib/olimpipo/mock-data.ts` (with `MOCK_OLIMPIPO_EDITIONS`), `src/lib/olimpipo/editions.ts`, `src/hooks/use-olimpipo-editions.ts` (with the exported `editionPath` helper), `src/components/olimpipo/olimpipo-shell/`, `src/components/olimpipo/olimpipo-header/`, `src/components/ui/stat/`, `src/routes/olimpipo/index.tsx`, `src/routes/olimpipo/$editionId.tsx` (re-exporting `EmBrevePage`), and the `--font-heading` alias in `src/styles/tokens.css`. If any of these are missing, stop and finish 002 first.

---

## Step 1 — Add domain models

Create `apps/pipo-cuida/src/models/ranking.ts`:

```ts
import type { Edition } from '@/models/olimpipo';

export type Participant = {
  rank: number;
  name: string;
  dept: string;
  points: number;
  activities: number;
};

export type RankingRow = Participant & { me: boolean };

export type TabKind = 'all' | 'dept' | 'friends';

export type Ranking = {
  edition: Edition;
  rows: RankingRow[];
  topThree: RankingRow[];
  meRow: RankingRow | null;
  myDept: string | null;
};
```

**Verification:** `npm run typecheck` succeeds.

---

## Step 2 — Extend the mock data fixture

Append to `apps/pipo-cuida/src/lib/olimpipo/mock-data.ts` (the file 002 created). Add the `Participant` import to the existing imports block at the top of the file, and add the new export at the bottom:

```ts
import type { Participant } from '@/models/ranking';

export const MOCK_OLIMPIPO_RANKING: Participant[] = [
  { rank: 1,  name: 'Mariana Costa',     dept: 'Produto',    points: 1240, activities: 28 },
  { rank: 2,  name: 'Rafael Lima',       dept: 'Engenharia', points: 1180, activities: 26 },
  { rank: 3,  name: 'Camila Souza',      dept: 'Comercial',  points: 1095, activities: 24 },
  { rank: 4,  name: 'Bruno Almeida',     dept: 'Engenharia', points: 980,  activities: 22 },
  { rank: 5,  name: 'Letícia Ferreira',  dept: 'Design',     points: 945,  activities: 21 },
  { rank: 6,  name: 'João Pereira',      dept: 'Operações',  points: 880,  activities: 19 },
  { rank: 7,  name: 'Isabela Martins',   dept: 'Marketing',  points: 845,  activities: 18 },
  { rank: 8,  name: 'Diego Ribeiro',     dept: 'Engenharia', points: 790,  activities: 17 },
  { rank: 9,  name: 'Patrícia Nunes',    dept: 'RH',         points: 745,  activities: 16 },
  { rank: 10, name: 'Felipe Cardoso',    dept: 'Comercial',  points: 720,  activities: 15 },
  { rank: 11, name: 'Beatriz Rocha',     dept: 'Produto',    points: 680,  activities: 14 },
  { rank: 12, name: 'Lucas Mendes',      dept: 'Engenharia', points: 645,  activities: 13 },
  { rank: 13, name: 'Aline Barbosa',     dept: 'Design',     points: 610,  activities: 12 },
  { rank: 14, name: 'Ana Silva',         dept: 'Produto',    points: 580,  activities: 12 },
  { rank: 15, name: 'Marcelo Tavares',   dept: 'Operações',  points: 545,  activities: 11 },
  { rank: 16, name: 'Renata Pinto',      dept: 'Comercial',  points: 520,  activities: 10 },
  { rank: 17, name: 'Gustavo Henrique',  dept: 'Engenharia', points: 495,  activities: 10 },
  { rank: 18, name: 'Juliana Castro',    dept: 'Marketing',  points: 470,  activities: 9  },
];
```

**Verification:** `npm run typecheck` succeeds. `MOCK_OLIMPIPO_RANKING` appears only in this file (grep `MOCK_OLIMPIPO_RANKING` returns one source-file hit plus its consumers later).

---

## Step 3 — Implement the pure logic (lib)

Create `apps/pipo-cuida/src/lib/olimpipo/ranking.ts`:

```ts
import type { Edition } from '@/models/olimpipo';
import type { Participant, Ranking, RankingRow, TabKind } from '@/models/ranking';

export function applyMe(rows: Participant[], edition: Edition): RankingRow[] {
  return rows.map(row => ({ ...row, me: row.rank === edition.myRank }));
}

export function computeWindow(
  rows: RankingRow[],
  windowSize: number,
): { start: number; end: number } {
  const meIdx = rows.findIndex(r => r.me);
  if (meIdx === -1) {
    return { start: 0, end: Math.min(windowSize, rows.length) };
  }
  const half = Math.floor(windowSize / 2);
  let start = Math.max(0, meIdx - half);
  let end = start + windowSize;
  if (end > rows.length) {
    end = rows.length;
    start = Math.max(0, end - windowSize);
  }
  return { start, end };
}

export function filterByTab(
  rows: RankingRow[],
  tab: TabKind,
  myDept: string | null,
): RankingRow[] {
  if (tab === 'all') return rows;
  if (tab === 'friends') return [];
  // tab === 'dept'
  if (myDept === null) return [];
  return rows.filter(r => r.dept === myDept);
}

export function buildRankingFor(rows: Participant[], edition: Edition): Ranking {
  const withMe = applyMe(rows, edition);
  const meRow = withMe.find(r => r.me) ?? null;
  return {
    edition,
    rows: withMe,
    topThree: withMe.slice(0, 3),
    meRow,
    myDept: meRow ? meRow.dept : null,
  };
}
```

Create `apps/pipo-cuida/src/lib/olimpipo/ranking.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { applyMe, buildRankingFor, computeWindow, filterByTab } from './ranking';
import type { Edition } from '@/models/olimpipo';
import type { Participant, RankingRow } from '@/models/ranking';

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

function makeParticipants(count: number, dept = 'Engenharia'): Participant[] {
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    name: `User ${i + 1}`,
    dept,
    points: 1000 - i * 10,
    activities: 20 - i,
  }));
}

function makeRows(count: number, meRank: number | null = null): RankingRow[] {
  return makeParticipants(count).map(p => ({ ...p, me: p.rank === meRank }));
}

describe('applyMe', () => {
  it('flags the row whose rank matches edition.myRank', () => {
    const rows = makeParticipants(5);
    const result = applyMe(rows, makeEdition({ myRank: 3 }));
    expect(result.map(r => r.me)).toEqual([false, false, true, false, false]);
  });

  it('flags nothing when edition.myRank is out of range', () => {
    const rows = makeParticipants(5);
    const result = applyMe(rows, makeEdition({ myRank: 99 }));
    expect(result.every(r => r.me === false)).toBe(true);
  });

  it('returns a new array (does not mutate the input)', () => {
    const rows = makeParticipants(3);
    const result = applyMe(rows, makeEdition({ myRank: 2 }));
    expect(result).not.toBe(rows);
    expect(rows[1]).not.toHaveProperty('me');
  });
});

describe('computeWindow', () => {
  it('centers a 5-row window on the me row in the middle', () => {
    const rows = makeRows(18, 14);
    expect(computeWindow(rows, 5)).toEqual({ start: 11, end: 16 });
  });

  it('clamps to start 0 when me is near the top', () => {
    const rows = makeRows(18, 2);
    expect(computeWindow(rows, 5)).toEqual({ start: 0, end: 5 });
  });

  it('clamps to end rows.length when me is near the bottom', () => {
    const rows = makeRows(18, 17);
    expect(computeWindow(rows, 5)).toEqual({ start: 13, end: 18 });
  });

  it('returns the first windowSize rows when there is no me row', () => {
    const rows = makeRows(18);
    expect(computeWindow(rows, 5)).toEqual({ start: 0, end: 5 });
  });

  it('returns the full range when windowSize is larger than rows.length', () => {
    const rows = makeRows(3, 1);
    expect(computeWindow(rows, 5)).toEqual({ start: 0, end: 3 });
  });
});

describe('filterByTab', () => {
  it('returns the input unchanged for tab="all"', () => {
    const rows = makeRows(3, 2);
    expect(filterByTab(rows, 'all', 'Engenharia')).toBe(rows);
  });

  it('filters by myDept for tab="dept" when myDept is set', () => {
    const rows: RankingRow[] = [
      { rank: 1, name: 'A', dept: 'Produto',    points: 10, activities: 1, me: false },
      { rank: 2, name: 'B', dept: 'Engenharia', points: 9,  activities: 1, me: true  },
      { rank: 3, name: 'C', dept: 'Produto',    points: 8,  activities: 1, me: false },
    ];
    expect(filterByTab(rows, 'dept', 'Produto').map(r => r.rank)).toEqual([1, 3]);
  });

  it('returns an empty list for tab="dept" when myDept is null', () => {
    const rows = makeRows(3);
    expect(filterByTab(rows, 'dept', null)).toEqual([]);
  });

  it('returns an empty list for tab="friends" regardless of state', () => {
    const rows = makeRows(3, 1);
    expect(filterByTab(rows, 'friends', 'Produto')).toEqual([]);
  });
});

describe('buildRankingFor', () => {
  it('returns meRow, myDept, topThree, and rows when me is in range', () => {
    const rows: Participant[] = [
      { rank: 1, name: 'A', dept: 'Eng',     points: 100, activities: 10 },
      { rank: 2, name: 'B', dept: 'Produto', points: 90,  activities: 9  },
      { rank: 3, name: 'C', dept: 'Eng',     points: 80,  activities: 8  },
      { rank: 4, name: 'D', dept: 'Produto', points: 70,  activities: 7  },
    ];
    const result = buildRankingFor(rows, makeEdition({ myRank: 2 }));
    expect(result.meRow?.rank).toBe(2);
    expect(result.myDept).toBe('Produto');
    expect(result.topThree.map(r => r.rank)).toEqual([1, 2, 3]);
    expect(result.rows).toHaveLength(4);
  });

  it('returns meRow null and myDept null when myRank is out of range', () => {
    const rows = makeParticipants(3);
    const result = buildRankingFor(rows, makeEdition({ myRank: 99 }));
    expect(result.meRow).toBeNull();
    expect(result.myDept).toBeNull();
    expect(result.rows).toHaveLength(3);
    expect(result.topThree).toHaveLength(3);
  });
});
```

**Verification:** `npm run typecheck` succeeds. `npm run test -- src/lib/olimpipo/ranking.spec.ts` passes (15 it blocks).

---

## Step 4 — Implement the hook

Create `apps/pipo-cuida/src/hooks/use-olimpipo-ranking.ts`:

```ts
import { useCallback, useMemo, useState } from 'react';
import type { Edition, EditionId } from '@/models/olimpipo';
import type { RankingRow, TabKind } from '@/models/ranking';
import { MOCK_OLIMPIPO_EDITIONS, MOCK_OLIMPIPO_RANKING } from '@/lib/olimpipo/mock-data';
import { buildRankingFor, computeWindow, filterByTab } from '@/lib/olimpipo/ranking';

const WINDOW_SIZE = 5;

export type OlimpipoRankingView =
  | { state: 'not-found'; editionId: EditionId }
  | {
      state: 'ready';
      edition: Edition;
      topThree: RankingRow[];
      meRow: RankingRow | null;
      myDept: string | null;
      visibleRows: RankingRow[];
      visibleTotal: number;
      activeTab: TabKind;
      setActiveTab: (t: TabKind) => void;
      showAll: boolean;
      toggleShowAll: () => void;
      activitiesPath: string;
    };

export function useOlimpipoRanking(editionId: EditionId): OlimpipoRankingView {
  const edition = useMemo(
    () => MOCK_OLIMPIPO_EDITIONS.find(e => e.id === editionId) ?? null,
    [editionId],
  );

  const [activeTab, setActiveTab] = useState<TabKind>('all');
  const [showAll, setShowAll] = useState(false);
  const toggleShowAll = useCallback(() => setShowAll(v => !v), []);

  const ranking = useMemo(
    () => (edition ? buildRankingFor(MOCK_OLIMPIPO_RANKING, edition) : null),
    [edition],
  );

  const tabRows = useMemo(
    () => (ranking ? filterByTab(ranking.rows, activeTab, ranking.myDept) : []),
    [ranking, activeTab],
  );

  const visibleRows = useMemo(() => {
    if (showAll) return tabRows;
    const { start, end } = computeWindow(tabRows, WINDOW_SIZE);
    return tabRows.slice(start, end);
  }, [tabRows, showAll]);

  if (!edition || !ranking) {
    return { state: 'not-found', editionId };
  }

  return {
    state: 'ready',
    edition,
    topThree: ranking.topThree,
    meRow: ranking.meRow,
    myDept: ranking.myDept,
    visibleRows,
    visibleTotal: tabRows.length,
    activeTab,
    setActiveTab,
    showAll,
    toggleShowAll,
    activitiesPath: `/olimpipo/${edition.id}/activities`,
  };
}
```

Create `apps/pipo-cuida/src/hooks/use-olimpipo-ranking.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useOlimpipoRanking } from './use-olimpipo-ranking';

describe('useOlimpipoRanking', () => {
  it('returns state="not-found" when the edition id is unknown', () => {
    const { result } = renderHook(() => useOlimpipoRanking('does-not-exist'));
    expect(result.current.state).toBe('not-found');
    if (result.current.state === 'not-found') {
      expect(result.current.editionId).toBe('does-not-exist');
    }
  });

  it('returns the active edition with the user windowed and myDept populated', () => {
    const { result } = renderHook(() => useOlimpipoRanking('mai-26'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.edition.id).toBe('mai-26');
    expect(result.current.meRow?.rank).toBe(14);
    expect(result.current.myDept).toBe('Produto');
    expect(result.current.topThree.map(r => r.rank)).toEqual([1, 2, 3]);
    expect(result.current.activeTab).toBe('all');
    expect(result.current.showAll).toBe(false);
    expect(result.current.visibleRows.map(r => r.rank)).toEqual([12, 13, 14, 15, 16]);
    expect(result.current.visibleTotal).toBe(18);
  });

  it('filters to dept rows when activeTab switches to dept', () => {
    const { result } = renderHook(() => useOlimpipoRanking('mai-26'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    act(() => result.current.setActiveTab('dept'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.visibleRows.map(r => r.rank)).toEqual([1, 11, 14]);
    expect(result.current.visibleTotal).toBe(3);
  });

  it('returns an empty list when activeTab is friends', () => {
    const { result } = renderHook(() => useOlimpipoRanking('mai-26'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    act(() => result.current.setActiveTab('friends'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.visibleRows).toEqual([]);
    expect(result.current.visibleTotal).toBe(0);
  });

  it('toggleShowAll expands to the full filtered list and back', () => {
    const { result } = renderHook(() => useOlimpipoRanking('mai-26'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    act(() => result.current.toggleShowAll());
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.visibleRows).toHaveLength(18);
    act(() => result.current.toggleShowAll());
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.visibleRows).toHaveLength(5);
  });

  it('returns meRow null and myDept null for an edition where myRank is out of range', () => {
    const { result } = renderHook(() => useOlimpipoRanking('nov-25'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.meRow).toBeNull();
    expect(result.current.myDept).toBeNull();
    expect(result.current.visibleRows.map(r => r.rank)).toEqual([1, 2, 3, 4, 5]);
    act(() => result.current.setActiveTab('dept'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.visibleRows).toEqual([]);
  });

  it('exposes activitiesPath built from the edition id', () => {
    const { result } = renderHook(() => useOlimpipoRanking('mai-26'));
    if (result.current.state !== 'ready') throw new Error('expected ready state');
    expect(result.current.activitiesPath).toBe('/olimpipo/mai-26/activities');
  });
});
```

**Verification:** `npm run typecheck` succeeds. `npm run test -- src/hooks/use-olimpipo-ranking.spec.ts` passes (7 it blocks).

---

## Step 5 — Add the `Avatar` primitive

Create `apps/pipo-cuida/src/components/ui/avatar/avatar.tsx`:

```tsx
import styles from './avatar.module.css';

export type AvatarProps = {
  name: string;
  size?: number;
  mode?: 'initial' | 'initials';
  bg?: string;
  fg?: string;
  bordered?: boolean;
};

function getInitials(name: string, mode: 'initial' | 'initials'): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  if (mode === 'initial' || parts.length === 1) return first.toUpperCase();
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  size = 32,
  mode = 'initial',
  bg = '#fff',
  fg = '#000',
  bordered = true,
}: AvatarProps) {
  const className = bordered ? `${styles.avatar} ${styles.bordered}` : styles.avatar;
  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.round(size * 0.4),
      }}
      aria-hidden
    >
      {getInitials(name, mode)}
    </span>
  );
}
```

Create `apps/pipo-cuida/src/components/ui/avatar/avatar.module.css`:

```css
.avatar {
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
}
.bordered { border: 1px solid var(--pipo-border); }
```

Create `apps/pipo-cuida/src/components/ui/avatar/avatar.spec.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Avatar } from './avatar';

describe('Avatar', () => {
  it('renders the first initial of the name by default', () => {
    const { getByText } = render(<Avatar name="Ana Silva" />);
    expect(getByText('A')).toBeInTheDocument();
  });

  it('renders two initials when mode is "initials"', () => {
    const { getByText } = render(<Avatar name="Ana Silva" mode="initials" />);
    expect(getByText('AS')).toBeInTheDocument();
  });

  it('renders a single initial when mode is "initials" and the name has one word', () => {
    const { getByText } = render(<Avatar name="Mariana" mode="initials" />);
    expect(getByText('M')).toBeInTheDocument();
  });

  it('falls back to "?" when the name is empty or only whitespace', () => {
    const { getByText } = render(<Avatar name="   " />);
    expect(getByText('?')).toBeInTheDocument();
  });

  it('reflects size in inline width and height', () => {
    const { container } = render(<Avatar name="A" size={48} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('omits the bordered class when bordered is false', () => {
    const { container } = render(<Avatar name="A" bordered={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).not.toMatch(/bordered/);
  });
});
```

**Verification:** `npm run typecheck` succeeds. `npm run test -- src/components/ui/avatar/avatar.spec.tsx` passes (6 it blocks).

---

## Step 6 — Implement the feature components

Each component lives in `apps/pipo-cuida/src/components/olimpipo/<name>/` with a `.tsx` and a co-located `.module.css`. No specs for the feature components — they are pure presentation; the page-level test in Step 9 covers their integration.

### 6.1 `my-position-card`

`apps/pipo-cuida/src/components/olimpipo/my-position-card/my-position-card.tsx`
```tsx
import { Button } from '@/components/ui/button';
import styles from './my-position-card.module.css';

export type MyPositionCardProps = {
  rank: number;
  points: number;
  activities: number;
  onOpenActivities: () => void;
};

export function MyPositionCard({ rank, points, activities, onOpenActivities }: MyPositionCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.rankChip}>#{rank}</div>
      <div className={styles.body}>
        <div className={styles.title}>Você</div>
        <div className={styles.meta}>
          {points} pontos · {activities} atividades
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={onOpenActivities}>
        Ver minhas atividades
        <span aria-hidden>→</span>
      </Button>
    </section>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/my-position-card/my-position-card.module.css`
```css
.card {
  background: #F7F3EB;
  border-radius: 16px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.rankChip {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 600 16px/1 var(--font-mono);
  color: #000;
  flex-shrink: 0;
}
.body { flex: 1; min-width: 0; }
.title {
  font: 500 16px/22px var(--font-body);
  color: #000;
}
.meta {
  font: 400 13px/18px var(--font-body);
  color: var(--fg-3);
  margin-top: 2px;
}
```

### 6.2 `podium` and `podium-card`

`apps/pipo-cuida/src/components/olimpipo/podium/podium-card.tsx`
```tsx
import styles from './podium-card.module.css';

export type PodiumCardProps = {
  rank: 1 | 2 | 3;
  firstName: string;
  dept: string;
  points: number;
};

const RANK_LABEL: Record<1 | 2 | 3, string> = { 1: '1º', 2: '2º', 3: '3º' };

export function PodiumCard({ rank, firstName, dept, points }: PodiumCardProps) {
  return (
    <div className={styles.card} data-rank={rank}>
      <div className={styles.medal} data-rank={rank}>{RANK_LABEL[rank]}</div>
      <div className={styles.name}>{firstName}</div>
      <div className={styles.dept}>{dept}</div>
      <div className={styles.points}>{points} pts</div>
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/podium/podium-card.module.css`
```css
.card {
  flex: 1;
  min-width: 0;
  border-radius: 14px;
  padding: 14px 12px 16px;
  text-align: center;
}
.card[data-rank='1'] { background: #FFE9A8; transform: translateY(-10px); }
.card[data-rank='2'] { background: #ECECEC; }
.card[data-rank='3'] { background: #F4D9BD; }

.medal {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: 600 13px/1 var(--font-mono);
  margin-bottom: 8px;
}
.medal[data-rank='1'] { background: #C69414; }
.medal[data-rank='2'] { background: #6B6663; }
.medal[data-rank='3'] { background: #A26431; }

.name {
  font: 500 14px/18px var(--font-body);
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dept {
  font: 400 11px/16px var(--font-body);
  color: var(--fg-3);
}
.points {
  margin-top: 8px;
  font: 500 15px/20px var(--font-heading);
  color: #000;
}
```

`apps/pipo-cuida/src/components/olimpipo/podium/podium.tsx`
```tsx
import type { RankingRow } from '@/models/ranking';
import { PodiumCard } from './podium-card';
import styles from './podium.module.css';

export type PodiumProps = { topThree: RankingRow[] };

function firstName(name: string): string {
  return name.split(' ')[0];
}

export function Podium({ topThree }: PodiumProps) {
  const [first, second, third] = topThree;
  return (
    <div className={styles.podium}>
      <PodiumCard rank={2} firstName={firstName(second.name)} dept={second.dept} points={second.points} />
      <PodiumCard rank={1} firstName={firstName(first.name)}  dept={first.dept}  points={first.points} />
      <PodiumCard rank={3} firstName={firstName(third.name)}  dept={third.dept}  points={third.points} />
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/podium/podium.module.css`
```css
.podium {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-top: 20px;
  margin-bottom: 24px;
}
```

### 6.3 `ranking-tabs`

`apps/pipo-cuida/src/components/olimpipo/ranking-tabs/ranking-tabs.tsx`
```tsx
import type { TabKind } from '@/models/ranking';
import styles from './ranking-tabs.module.css';

export type RankingTabsProps = {
  active: TabKind;
  onChange: (tab: TabKind) => void;
};

const TABS: { id: TabKind; label: string }[] = [
  { id: 'all',     label: 'Geral' },
  { id: 'dept',    label: 'Meu time' },
  { id: 'friends', label: 'Amigos' },
];

export function RankingTabs({ active, onChange }: RankingTabsProps) {
  return (
    <div className={styles.tabs} role="tablist">
      {TABS.map(t => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          data-active={active === t.id}
          className={styles.tab}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/ranking-tabs/ranking-tabs.module.css`
```css
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  background: #F4F2EF;
  border-radius: 999px;
  padding: 4px;
}
.tab {
  flex: 1;
  border: none;
  background: transparent;
  color: #000;
  font: 600 13px/20px var(--font-ui);
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 120ms var(--ease-standard);
}
.tab[data-active='true'] {
  background: #fff;
  box-shadow: inset 0 0 0 1px #E2E1DF;
}
```

### 6.4 `ranking-list` (header, row, empty, list)

`apps/pipo-cuida/src/components/olimpipo/ranking-list/ranking-list-header.tsx`
```tsx
import styles from './ranking-list.module.css';

export function RankingListHeader() {
  return (
    <div className={styles.header}>
      <span className={styles.headerRank}>#</span>
      <span className={styles.headerName}>Participante</span>
      <span className={styles.headerPoints}>Pontos</span>
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/ranking-list/ranking-list-row.tsx`
```tsx
import type { RankingRow } from '@/models/ranking';
import { Avatar } from '@/components/ui/avatar/avatar';
import styles from './ranking-list.module.css';

export type RankingListRowProps = { row: RankingRow };

export function RankingListRow({ row }: RankingListRowProps) {
  const className = row.me ? `${styles.row} ${styles.rowMe}` : styles.row;
  return (
    <div
      className={className}
      data-me={row.me ? 'true' : undefined}
    >
      <span className={styles.rank} data-podium={row.rank <= 3}>{row.rank}</span>
      <Avatar name={row.name} size={32} />
      <div className={styles.body}>
        <div className={styles.name}>
          {row.me ? `${row.name} (você)` : row.name}
        </div>
        <div className={styles.meta}>
          {row.dept} · {row.activities} atividades
        </div>
      </div>
      <span className={styles.points}>{row.points}</span>
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/ranking-list/ranking-list-empty.tsx`
```tsx
import styles from './ranking-list.module.css';

export type RankingListEmptyProps = { message: string };

export function RankingListEmpty({ message }: RankingListEmptyProps) {
  return <div className={styles.empty}>{message}</div>;
}
```

`apps/pipo-cuida/src/components/olimpipo/ranking-list/ranking-list.tsx`
```tsx
import type { RankingRow } from '@/models/ranking';
import { RankingListHeader } from './ranking-list-header';
import { RankingListRow } from './ranking-list-row';
import { RankingListEmpty } from './ranking-list-empty';
import styles from './ranking-list.module.css';

export type RankingListProps = {
  rows: RankingRow[];
  emptyMessage: string;
};

export function RankingList({ rows, emptyMessage }: RankingListProps) {
  return (
    <div className={styles.list}>
      <RankingListHeader />
      {rows.length === 0
        ? <RankingListEmpty message={emptyMessage} />
        : rows.map(row => <RankingListRow key={row.rank} row={row} />)}
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/ranking-list/ranking-list.module.css`
```css
.list {
  margin-top: 8px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 4px;
  font: 500 11px/16px var(--font-mono);
  color: var(--fg-3);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 1px solid #E2E1DF;
}
.headerRank { width: 36px; }
.headerName { flex: 1; }
.headerPoints { width: 70px; text-align: right; }

/* Row */
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #E2E1DF;
  border-left: 3px solid transparent;
}
.rowMe {
  background: #F7F3EB;
  border-radius: 10px;
  margin: 4px 0;
  border-left: 3px solid #000;
}
.rank {
  width: 30px;
  text-align: center;
  font: 500 14px/1 var(--font-mono);
  color: #000;
}
.rank[data-podium='true'] { color: #9B3A1B; }
.body { flex: 1; min-width: 0; }
.name {
  font: 500 14px/18px var(--font-body);
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rowMe .name { font-weight: 600; }
.meta {
  font: 400 12px/16px var(--font-body);
  color: var(--fg-3);
}
.points {
  width: 70px;
  text-align: right;
  font: 600 14px/1 var(--font-mono);
  color: #000;
}

/* Empty */
.empty {
  padding: 24px 12px;
  text-align: center;
  font: 400 13px/18px var(--font-body);
  color: var(--fg-3);
}
```

### 6.5 `full-list-toggle`

`apps/pipo-cuida/src/components/olimpipo/full-list-toggle/full-list-toggle.tsx`
```tsx
import { Button } from '@/components/ui/button';
import styles from './full-list-toggle.module.css';

export type FullListToggleProps = {
  expanded: boolean;
  total: number;
  onToggle: () => void;
};

export function FullListToggle({ expanded, total, onToggle }: FullListToggleProps) {
  const label = expanded
    ? 'Mostrar somente próximos a mim'
    : `Ver classificação completa (${total})`;
  const arrow = expanded ? '▴' : '▾';
  return (
    <div className={styles.wrap}>
      <Button variant="secondary" size="sm" onClick={onToggle}>
        {label}
        <span aria-hidden>{arrow}</span>
      </Button>
    </div>
  );
}
```

`apps/pipo-cuida/src/components/olimpipo/full-list-toggle/full-list-toggle.module.css`
```css
.wrap {
  margin-top: 16px;
  text-align: center;
}
```

**Verification:** `npm run typecheck` succeeds. `npm run test` still passes (no new specs added in this step).

---

## Step 7 — Implement the page

Create `apps/pipo-cuida/src/pages/olimpipo-ranking-page.tsx`:

```tsx
import { useNavigate, useParams } from '@tanstack/react-router';
import { useOlimpipoRanking } from '@/hooks/use-olimpipo-ranking';
import { OlimpipoShell } from '@/components/olimpipo/olimpipo-shell/olimpipo-shell';
import { OlimpipoHeader } from '@/components/olimpipo/olimpipo-header/olimpipo-header';
import { MyPositionCard } from '@/components/olimpipo/my-position-card/my-position-card';
import { Podium } from '@/components/olimpipo/podium/podium';
import { RankingTabs } from '@/components/olimpipo/ranking-tabs/ranking-tabs';
import { RankingList } from '@/components/olimpipo/ranking-list/ranking-list';
import { FullListToggle } from '@/components/olimpipo/full-list-toggle/full-list-toggle';
import { EmBrevePage } from '@/pages/em-breve-page';
import type { TabKind } from '@/models/ranking';

const EMPTY_MESSAGE: Record<TabKind, (myDept: string | null) => string> = {
  all: () => 'Sem participantes ainda.',
  dept: (myDept) => myDept
    ? 'Sua equipe ainda não tem participantes nesta edição.'
    : 'Sem dados do seu time para esta edição.',
  friends: () => 'Adicione amigos para comparar — em breve.',
};

export function OlimpipoRankingPage() {
  const { editionId } = useParams({ from: '/olimpipo/$editionId' });
  const navigate = useNavigate();
  const view = useOlimpipoRanking(editionId);

  if (view.state === 'not-found') {
    return <EmBrevePage />;
  }

  const {
    edition, topThree, myDept,
    visibleRows, visibleTotal,
    activeTab, setActiveTab, showAll, toggleShowAll,
    activitiesPath,
  } = view;

  const activeSuffix = edition.active ? ` Faltam ${edition.daysRemaining} dias.` : '';

  return (
    <OlimpipoShell>
      <OlimpipoHeader
        eyebrow={`Olimpipo · ${edition.label}`}
        title="Classificação"
        sub={`${edition.period} · ${edition.participants} pessoas participando.${activeSuffix}`}
      />
      <MyPositionCard
        rank={edition.myRank}
        points={edition.myPoints}
        activities={edition.myActivities}
        onOpenActivities={() => navigate({ to: activitiesPath })}
      />
      <Podium topThree={topThree} />
      <RankingTabs active={activeTab} onChange={setActiveTab} />
      <RankingList rows={visibleRows} emptyMessage={EMPTY_MESSAGE[activeTab](myDept)} />
      <FullListToggle expanded={showAll} total={visibleTotal} onToggle={toggleShowAll} />
    </OlimpipoShell>
  );
}
```

No page-level CSS module is created — every child component owns its own spacing, so the page is pure composition. The directory layout in the spec lists `olimpipo-ranking-page.module.css` aspirationally; if a future task introduces page-level overrides, add the file then. YAGNI for now.

**Verification:** `npm run typecheck` succeeds.

---

## Step 8 — Wire the routes

Edit `apps/pipo-cuida/src/routes/olimpipo/$editionId.tsx` (the file 002 created — swap the component):

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { OlimpipoRankingPage } from '@/pages/olimpipo-ranking-page';

export const Route = createFileRoute('/olimpipo/$editionId')({ component: OlimpipoRankingPage });
```

Create the directory `apps/pipo-cuida/src/routes/olimpipo/$editionId/` and add `activities.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { EmBrevePage } from '@/pages/em-breve-page';

export const Route = createFileRoute('/olimpipo/$editionId/activities')({ component: EmBrevePage });
```

The TanStack Router Vite plugin regenerates `src/routeTree.gen.ts` automatically on the next dev run / build. If running `npm run typecheck` before starting the dev server, run `npm run dev -- --host 0.0.0.0 --port 5173` once to trigger generation (or invoke the plugin's CLI directly per the project's existing convention).

**Verification:**
- `npm run typecheck` succeeds.
- `npm run dev` boots without route-tree errors.
- Manual: `http://localhost:5173/olimpipo/mai-26` renders the ranking page (header "Classificação"). `http://localhost:5173/olimpipo/mai-26/activities` renders the `EmBreve` placeholder. `http://localhost:5173/olimpipo/foobar` renders the `EmBreve` placeholder (the `state: 'not-found'` branch of the page).

---

## Step 9 — Page-level rendering test

Create `apps/pipo-cuida/src/pages/olimpipo-ranking-page.spec.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { OlimpipoRankingPage } from './olimpipo-ranking-page';
import { EmBrevePage } from './em-breve-page';

function renderAt(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const rankingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/olimpipo/$editionId',
    component: OlimpipoRankingPage,
  });
  const activitiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/olimpipo/$editionId/activities',
    component: EmBrevePage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([rankingRoute, activitiesRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('OlimpipoRankingPage', () => {
  it('renders the active edition with the windowed list and Você card', async () => {
    renderAt('/olimpipo/mai-26');
    expect(await screen.findByRole('heading', { name: 'Classificação' })).toBeInTheDocument();
    expect(screen.getByText('Olimpipo · Maio/26')).toBeInTheDocument();
    expect(screen.getByText('#14')).toBeInTheDocument();
    expect(screen.getByText('580 pontos · 12 atividades')).toBeInTheDocument();
    // Podium first names (top 3 by rank)
    expect(screen.getByText('Mariana')).toBeInTheDocument();
    expect(screen.getByText('Rafael')).toBeInTheDocument();
    expect(screen.getByText('Camila')).toBeInTheDocument();
    // 5 windowed rows around rank 14 — assert presence of the me marker
    const meRow = document.querySelector('[data-me="true"]');
    expect(meRow).not.toBeNull();
    expect(within(meRow as HTMLElement).getByText('Ana Silva (você)')).toBeInTheDocument();
  });

  it('switches to the Meu time tab and shows only Produto rows', async () => {
    renderAt('/olimpipo/mai-26');
    await screen.findByRole('heading', { name: 'Classificação' });
    fireEvent.click(screen.getByRole('tab', { name: 'Meu time' }));
    expect(screen.getByText('Mariana Costa')).toBeInTheDocument();
    expect(screen.getByText('Beatriz Rocha')).toBeInTheDocument();
    expect(screen.getByText('Ana Silva (você)')).toBeInTheDocument();
    expect(screen.queryByText('Rafael Lima')).toBeNull();
    expect(screen.getByRole('button', { name: /Ver classificação completa \(3\)/ })).toBeInTheDocument();
  });

  it('shows the empty state on the Amigos tab', async () => {
    renderAt('/olimpipo/mai-26');
    await screen.findByRole('heading', { name: 'Classificação' });
    fireEvent.click(screen.getByRole('tab', { name: 'Amigos' }));
    expect(screen.getByText('Adicione amigos para comparar — em breve.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver classificação completa \(0\)/ })).toBeInTheDocument();
  });

  it('toggles to the full list and back', async () => {
    renderAt('/olimpipo/mai-26');
    await screen.findByRole('heading', { name: 'Classificação' });
    fireEvent.click(screen.getByRole('button', { name: /Ver classificação completa \(18\)/ }));
    expect(screen.getByText('Mariana Costa')).toBeInTheDocument();
    expect(screen.getByText('Juliana Castro')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Mostrar somente próximos a mim/ }));
    expect(screen.queryByText('Juliana Castro')).toBeNull();
  });

  it('navigates to the activities placeholder when the CTA is clicked', async () => {
    renderAt('/olimpipo/mai-26');
    await screen.findByRole('heading', { name: 'Classificação' });
    fireEvent.click(screen.getByRole('button', { name: /Ver minhas atividades/ }));
    expect(await screen.findByText('Em breve')).toBeInTheDocument();
  });

  it('renders rank 1 as me for the março edition', async () => {
    renderAt('/olimpipo/mar-26');
    await screen.findByRole('heading', { name: 'Classificação' });
    expect(screen.getByText('#1')).toBeInTheDocument();
    const meRow = document.querySelector('[data-me="true"]');
    expect(meRow).not.toBeNull();
    expect(within(meRow as HTMLElement).getByText('Mariana Costa (você)')).toBeInTheDocument();
  });

  it('does not flag any row as me for the novembro edition (rank out of range)', async () => {
    renderAt('/olimpipo/nov-25');
    await screen.findByRole('heading', { name: 'Classificação' });
    expect(screen.getByText('#34')).toBeInTheDocument();
    expect(document.querySelector('[data-me="true"]')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Meu time' }));
    expect(screen.getByText('Sem dados do seu time para esta edição.')).toBeInTheDocument();
  });

  it('renders the EmBreve placeholder for an unknown edition id', async () => {
    renderAt('/olimpipo/foobar');
    expect(await screen.findByText('Em breve')).toBeInTheDocument();
  });
});
```

Note on the "Em breve" assertion: it must match the text currently rendered by `EmBrevePage` (created in `pipo-cuida-001`). If the actual copy differs, update the assertion to match — but do not change `EmBrevePage` to fit the test.

**Verification:** `npm run test -- src/pages/olimpipo-ranking-page.spec.tsx` passes (8 it blocks). Full `npm run test` is green and `npm run typecheck` succeeds.

---

## Step 10 — Manual visual diff against the design source

Boot the dev server (`docker compose up pipo-cuida` or `npm run dev`) and walk the three primary paths in a browser:

1. `http://localhost:5173/olimpipo/mai-26` — confirm the screen matches `OlimpipoRankingScreen` in `.claude/design/project/OlimpipoScreens.jsx:391–564`:
   - Header eyebrow "Olimpipo · Maio/26", title "Classificação", subtitle includes "Faltam 19 dias."
   - "Você" card: `#F7F3EB` background, `#14` chip, black "Ver minhas atividades →" CTA.
   - Podium: rank 2 / 1 / 3 visual order, rank 1 raised, gold/silver/bronze tints.
   - Tabs pill: "Geral" active by default.
   - Default windowed list: ranks 12 through 16 visible. Rank 14 highlighted with `#F7F3EB` background and `3px solid #000` left border, name reads "Ana Silva (você)".
   - Toggle button below: "Ver classificação completa (18) ▾".
2. Click "Meu time" — list shrinks to ranks 1, 11, 14 (Produto dept). Toggle label updates.
3. Click "Amigos" — empty state copy shows. Toggle label `(0)`.
4. Click toggle when on Geral — list expands to 18 rows. Click again — back to window.
5. Click "Ver minhas atividades →" — URL switches to `/olimpipo/mai-26/activities`, `EmBreve` placeholder renders, "← Voltar ao início" link works.
6. Open `/olimpipo/mar-26` — "Você" card shows `#1`, rank 1 row gets the me highlight.
7. Open `/olimpipo/nov-25` — "Você" card shows `#34`, no row is highlighted, "Meu time" tab shows the dept-empty message.
8. Open `/olimpipo/foobar` — `EmBreve` placeholder renders.
9. From `/olimpipo` (002's editions list), click the "Ver classificação →" CTA on the active edition card — lands on `/olimpipo/mai-26` and renders the new screen.
10. Same list, click any past-edition row — lands on `/olimpipo/<that-id>` and renders the ranking page (different `myRank` per edition).

**Verification:** All 10 steps match the design source visually and behaviorally. `npm run typecheck` and `npm run test` are both green.

---

## Cross-check against acceptance criteria

| AC  | Covered by                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------ |
| 1   | Step 10 walkthrough item 1                                                                             |
| 2   | Step 10 walkthrough item 9                                                                             |
| 3   | Step 9 it block "navigates to the activities placeholder" + Step 10 walkthrough item 5                 |
| 4   | Step 6.2 `podium-card.module.css` (tints + transform) + Step 10 walkthrough item 1                     |
| 5   | Step 6.3 `ranking-tabs` + Step 9 first it block                                                        |
| 6   | Step 9 first it block (data-me + Ana Silva (você)) + Step 10 walkthrough item 1                        |
| 7   | Step 9 "toggles to the full list and back" + Step 10 walkthrough item 4                                |
| 8   | Step 9 "switches to the Meu time tab" + Step 10 walkthrough item 2                                     |
| 9   | Step 9 "shows the empty state on the Amigos tab" + Step 10 walkthrough item 3                          |
| 10  | Step 9 "renders rank 1 as me for the março edition" + Step 10 walkthrough item 6                       |
| 11  | Step 9 "does not flag any row as me for the novembro edition" + Step 10 walkthrough item 7             |
| 12  | Step 9 "renders the EmBreve placeholder for an unknown edition id" + Step 10 walkthrough item 8        |
| 13  | Steps 3, 4, 5, 9 produce the four required test files                                                  |
| 14  | Hexagonal rule honored: only `src/lib/olimpipo/ranking.ts` filters/maps over ranking data              |
| 15  | `MOCK_OLIMPIPO_RANKING` defined once in `src/lib/olimpipo/mock-data.ts` (Step 2)                       |
