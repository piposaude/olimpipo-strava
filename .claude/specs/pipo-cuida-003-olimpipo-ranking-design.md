**Task:** pipo-cuida-003
**Area:** web
**Title:** Build the Olimpipo edition ranking screen
**Blocked by:** pipo-cuida-002

## Goal

Render `OlimpipoRankingScreen` from `.claude/design/project/OlimpipoScreens.jsx` (lines 391–564) as the real component at route `/olimpipo/$editionId`, replacing the `EmBrevePage` re-export that `pipo-cuida-002` placed on that route. The page covers: a "Você" highlight card with a CTA to my activities; a 2-1-3 podium for the top three; three tabs (`Geral` / `Meu time` / `Amigos`) that change the visible list; a windowed ranking list (5 rows centered on the user) with a toggle that expands to the full 18-row list.

After this task, the "Ver classificação →" CTA on the active-edition card in `/olimpipo` (002) lands on the real screen, and the past-edition rows resolve to their own (mock-derived) ranking. The "Ver minhas atividades →" CTA inside this screen navigates to `/olimpipo/$editionId/activities`, which is still a placeholder (full feature is `pipo-cuida-004`).

## Why now

This task continues the structural precedents established by `pipo-cuida-002` and adds two new patterns the next iterations will reuse:

- **Edition-parameterized derivation.** `buildRankingFor(rows, edition)` takes both inputs and returns a fully-shaped `Ranking` object. The result is what the hook stores; the component consumes it as-is. This is the precedent for any future "derive UI-shape from API rows + context" in this app.
- **Discriminated view-model for not-found.** The hook returns `{ state: 'not-found' } | { state: 'ready', ... }`. The page switches on `state` and renders the not-found branch without re-asserting on the absence of fields. Trial run for the rule "fetch responses come back in the shape the component expects" from `.claude/rules/nextjs-app.md`.

It also introduces one new app-local primitive (`Avatar`) that future profile-style screens will reuse.

## Scope

### In scope

- Route flip: `routes/olimpipo/$editionId.tsx` swaps `EmBrevePage` for `OlimpipoRankingPage`.
- New placeholder route `routes/olimpipo/$editionId/activities.tsx` re-exports `EmBrevePage` (TanStack root catch-all `/$` only matches single-segment; multi-segment needs an explicit file).
- Models in `src/models/ranking.ts` (`Participant`, `RankingRow`, `Ranking`, `TabKind`).
- Pure logic in `src/lib/olimpipo/ranking.ts` (`applyMe`, `computeWindow`, `filterByTab`, `buildRankingFor`) with full unit tests in `src/lib/olimpipo/ranking.spec.ts`.
- Mock data extension in `src/lib/olimpipo/mock-data.ts`: `MOCK_OLIMPIPO_RANKING: Participant[]` (the 18 entries translated to camelCase). No new fixture file.
- Per-feature hook `src/hooks/use-olimpipo-ranking.ts` that resolves the edition by id, builds the ranking via lib, owns tab + show-all state, and exposes `activitiesPath`.
- One new UI primitive: `Avatar` in `src/components/ui/avatar/` (consumed by ranking rows; will be reused by future profile screens).
- Feature components in `src/components/olimpipo/`: `my-position-card/`, `podium/` (composed of three `PodiumCard`s in 2-1-3 order), `ranking-tabs/`, `ranking-list/` (header + rows + empty state), and `full-list-toggle/`.
- Page `src/pages/olimpipo-ranking-page.tsx` + `.module.css` + `.spec.tsx`.
- Page-level rendering test that drives the page through an in-memory router and asserts the visible content (active-edition path, past-edition paths, unknown-id path).

### Out of scope

- `pipo-cuida-004` — submitted activities at `/olimpipo/$editionId/activities` (the CTA lands on a placeholder; the real screen ships later).
- Real auth — `me` is derived from `edition.myRank`; no JWT/session lookup.
- Replacing the mock with a fetch — same hook return shape; only the data source flips.
- Friends graph as data source — the `Amigos` tab is intentionally an empty state.
- Sorting, search inside the list, pagination beyond the simple show-all toggle.

## Architecture

### Stack

Same as `pipo-cuida-001` / `pipo-cuida-002`: Vite 5 + React 18 + TypeScript (strict), TanStack Router file-based routing, CSS Modules, Vitest + Testing Library. No additional dependencies.

### Directory layout (additions only)

```
apps/pipo-cuida/src/
├── models/
│   └── ranking.ts                          ← new
├── lib/
│   └── olimpipo/
│       ├── mock-data.ts                    ← extended (append MOCK_OLIMPIPO_RANKING)
│       ├── ranking.ts                      ← new
│       └── ranking.spec.ts                 ← new
├── hooks/
│   ├── use-olimpipo-ranking.ts             ← new
│   └── use-olimpipo-ranking.spec.ts        ← new
├── components/
│   ├── ui/
│   │   └── avatar/                         ← new primitive
│   │       ├── avatar.tsx
│   │       ├── avatar.module.css
│   │       └── avatar.spec.tsx
│   └── olimpipo/                           ← extended (folder created by 002)
│       ├── my-position-card/
│       │   ├── my-position-card.tsx
│       │   ├── my-position-card.module.css
│       │   └── my-position-card.spec.tsx
│       ├── podium/
│       │   ├── podium.tsx
│       │   ├── podium.module.css
│       │   ├── podium.spec.tsx
│       │   ├── podium-card.tsx
│       │   └── podium-card.module.css
│       ├── ranking-tabs/
│       │   ├── ranking-tabs.tsx
│       │   ├── ranking-tabs.module.css
│       │   └── ranking-tabs.spec.tsx
│       ├── ranking-list/
│       │   ├── ranking-list.tsx
│       │   ├── ranking-list.module.css
│       │   ├── ranking-list.spec.tsx
│       │   ├── ranking-list-header.tsx
│       │   ├── ranking-list-row.tsx
│       │   └── ranking-list-empty.tsx
│       └── full-list-toggle/
│           ├── full-list-toggle.tsx
│           ├── full-list-toggle.module.css
│           └── full-list-toggle.spec.tsx
├── pages/
│   ├── olimpipo-ranking-page.tsx           ← new
│   ├── olimpipo-ranking-page.module.css
│   └── olimpipo-ranking-page.spec.tsx
└── routes/
    └── olimpipo/
        ├── $editionId.tsx                  ← edited (swap component)
        └── $editionId/
            └── activities.tsx              ← new (placeholder)
```

### Layer separation (non-negotiable)

The rule that `pipo-cuida-002` cravou continues: hook orchestrates, lib does the heavy lifting, components compose. The mapping for this task:

| Layer | Path | What lives here | What does NOT live here |
| --- | --- | --- | --- |
| **Models** | `src/models/ranking.ts` | Plain TS types: `Participant`, `RankingRow`, `Ranking`, `TabKind`. | Functions, React, mock data. |
| **Lib (pure logic)** | `src/lib/olimpipo/ranking.ts` | `applyMe`, `computeWindow`, `filterByTab`, `buildRankingFor`. Imports models only. Tested without DOM/React. | React, `useState`, JSX, fetch, mock literals. |
| **Mock fixture** | `src/lib/olimpipo/mock-data.ts` (extended) | `MOCK_OLIMPIPO_RANKING: Participant[]` — the 18 entries; only place this literal exists. | Derivations, functions, React. |
| **Hook (orchestration)** | `src/hooks/use-olimpipo-ranking.ts` | Resolves edition by id from `MOCK_OLIMPIPO_EDITIONS`, calls `buildRankingFor(MOCK_OLIMPIPO_RANKING, edition)`, owns `activeTab` + `showAll` state, returns the discriminated view-model and `activitiesPath`. | JSX, CSS imports, inline filtering/mapping, mock literals duplicated. |
| **Feature components** | `src/components/olimpipo/<name>/` | Pure JSX composition. Receive already-shaped data via props. | Direct lib calls beyond the hook, business-logic `if`/filter/map on ranking data, hard-coded mocks. |
| **Page** | `src/pages/olimpipo-ranking-page.tsx` | `useParams` + `useOlimpipoRanking(editionId)` + composition. One `openActivities` handler that calls `navigate({ to: activitiesPath })`. Renders the not-found branch when the hook returns `state: 'not-found'`. | Any `.filter`/`.map`/`.find` on ranking data. Any tab filtering, windowing, or `me` resolution. |

If any chunk of logic feels like it could live in two places, the lib wins. Lib tests assert the math; the hook spec asserts the hook called the lib and stored what came back; component specs assert the rendered output given already-shaped props.

### Models

```ts
// src/models/ranking.ts
import type { Edition, EditionId } from '@/models/olimpipo';

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
  rows: RankingRow[];          // full sorted list with `me` applied
  topThree: RankingRow[];      // ranks 1..3, ordered ascending
  meRow: RankingRow | null;    // the row flagged me, or null if edition.myRank is outside the fixture range
  myDept: string | null;       // dept of meRow, used by the 'dept' tab
};
```

The discriminated `state: 'not-found' | 'ready'` union lives only in the hook return type — it carries view-only fields (`activeTab`, `showAll`, etc.) that don't belong in the domain model.

`RankingRow.me` is `true` for at most one row — and only when `edition.myRank` falls within the fixture's rank range (1..18). For editions where `myRank > 18` (e.g. `nov-25` with rank 34), `meRow` is `null`, `myDept` is `null`, and the `Meu time` tab degrades to an empty state.

### Lib

`src/lib/olimpipo/ranking.ts` exports four pure functions. The fixture `MOCK_OLIMPIPO_RANKING` is **not** imported here — the hook passes the rows in. Lib stays decoupled from any specific fixture.

```ts
export function applyMe(rows: Participant[], edition: Edition): RankingRow[];
export function computeWindow(rows: RankingRow[], windowSize: number): { start: number; end: number };
export function filterByTab(rows: RankingRow[], tab: TabKind, myDept: string | null): RankingRow[];
export function buildRankingFor(rows: Participant[], edition: Edition): Ranking;
```

Contracts:

- **`applyMe(rows, edition)`** — returns a new array with `me: true` set on the row whose `rank === edition.myRank`, all others `me: false`. If no row matches, every row has `me: false`. Does not mutate input. Does not sort (caller passes already-sorted rows).
- **`computeWindow(rows, windowSize)`** — finds the index of the `me === true` row. Returns `{ start, end }` such that the window is `windowSize` rows centered on `me`, clamped at both ends. If no `me` row exists, returns `{ start: 0, end: Math.min(windowSize, rows.length) }`. Fixture-agnostic.
- **`filterByTab(rows, tab, myDept)`** — `'all'` returns rows unchanged. `'dept'` returns `rows.filter(r => r.dept === myDept)` when `myDept !== null`, else `[]`. `'friends'` always returns `[]` (honest empty for the mock).
- **`buildRankingFor(rows, edition)`** — composes the above: applies `me`, picks `rows.slice(0, 3)` for `topThree` (fixture is already rank-sorted ascending), resolves `meRow` and `myDept`, and returns the `Ranking` object. The only place that knows the windowing default size is the hook — not this function — because windowing depends on `showAll` runtime state.

### Lib tests

`src/lib/olimpipo/ranking.spec.ts` — one `describe` per function. Per the no-branching rule in `nextjs-app.md`, each `it` covers a single path; no `if` inside test bodies, no flag-driven helpers. Cases:

- `applyMe` — flags the matching row; flags nothing when `edition.myRank` is out of range; returns a new array (input unmutated).
- `computeWindow` — me in the middle (start = meIdx - 2); me near the top (clamps to start 0); me near the bottom (clamps to end rows.length); no me row (defaults to first 5); windowSize larger than rows (start 0, end rows.length).
- `filterByTab` — `'all'` is identity; `'dept'` filters when myDept is set; `'dept'` returns empty when myDept is null; `'friends'` returns empty regardless.
- `buildRankingFor` — for an edition where me is in range: meRow + myDept populated, topThree is rows 1..3, rows length unchanged. For an edition where me is out of range: meRow null, myDept null, rows still complete.

### Mock data

Append to `src/lib/olimpipo/mock-data.ts` (the file 002 created):

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

The design's literal `me: true` on rank 14 is **not** stored in the fixture — it is derived per edition by `applyMe`. The fixture is pure `Participant[]`; only the `RankingRow` type carries `me`.

### Hook

```ts
// src/hooks/use-olimpipo-ranking.ts

const WINDOW_SIZE = 5;

export type OlimpipoRankingView =
  | { state: 'not-found'; editionId: EditionId }
  | {
      state: 'ready';
      edition: Edition;
      topThree: RankingRow[];
      meRow: RankingRow | null;
      myDept: string | null;
      visibleRows: RankingRow[];   // tab-filtered + (windowed when showAll === false)
      visibleTotal: number;        // count after tab filter, before windowing — used by toggle label
      activeTab: TabKind;
      setActiveTab: (t: TabKind) => void;
      showAll: boolean;
      toggleShowAll: () => void;
      activitiesPath: string;
    };

export function useOlimpipoRanking(editionId: EditionId): OlimpipoRankingView;
```

Behavior:

- Looks up `edition` by id in `MOCK_OLIMPIPO_EDITIONS`. If not found, returns `{ state: 'not-found', editionId }`. The page renders the not-found branch.
- On the ready path:
  - `ranking = useMemo(() => buildRankingFor(MOCK_OLIMPIPO_RANKING, edition), [edition])`.
  - `activeTab` defaults to `'all'`; `showAll` defaults to `false`.
  - `tabRows = useMemo(() => filterByTab(ranking.rows, activeTab, ranking.myDept), [ranking.rows, activeTab, ranking.myDept])`.
  - `visibleRows = useMemo(() => { if (showAll) return tabRows; const { start, end } = computeWindow(tabRows, WINDOW_SIZE); return tabRows.slice(start, end); }, [tabRows, showAll])`.
  - `visibleTotal = tabRows.length` — what the toggle label shows ("Ver classificação completa (N) ▾").
  - `activitiesPath = `/olimpipo/${edition.id}/activities``.

The hook is the only place that knows `WINDOW_SIZE = 5`.

### Hook tests

`src/hooks/use-olimpipo-ranking.spec.ts` — uses `renderHook` from `@testing-library/react`. No mocks for lib or fixtures — the hook composes them and the tests assert the integration. Cases:

- Unknown editionId returns `{ state: 'not-found', editionId }`.
- Known active edition (`mai-26`, myRank 14): `state: 'ready'`, `meRow.rank === 14`, `myDept === 'Produto'`, `topThree.length === 3` with ranks `[1, 2, 3]`, `activeTab === 'all'`, `showAll === false`, `visibleRows.length === 5` (window around #14), `visibleTotal === 18`.
- After `setActiveTab('dept')`: `visibleRows` only contains rows where `dept === 'Produto'`, `visibleTotal` equals that count.
- After `setActiveTab('friends')`: `visibleRows.length === 0`, `visibleTotal === 0`.
- After `toggleShowAll()`: `visibleRows.length === 18` (Geral), then `toggleShowAll()` again returns to windowed.
- Edition where `myRank > 18` (`nov-25`, myRank 34): `meRow === null`, `myDept === null`, `visibleRows` defaults to the first 5 rows of the full list (no `me` highlight), `setActiveTab('dept')` produces an empty list.
- `activitiesPath` for `mai-26` is `/olimpipo/mai-26/activities`.

### Components

#### `Avatar` primitive (`src/components/ui/avatar/`)

A circular avatar that renders one or two initial letters of `name`. Used in `ranking-list-row`; future profile screens will reuse it.

```ts
type AvatarProps = {
  name: string;
  size?: number;            // px, default 32
  mode?: 'initial' | 'initials';  // default 'initial' — single letter
  bg?: string;              // default '#fff'
  fg?: string;              // default '#000'
  bordered?: boolean;       // default true — 1px solid var(--pipo-border)
};
```

The spec asserts the rendered letter(s), the inline `width`/`height` matching `size`, and that `bordered === false` removes the border class.

#### `MyPositionCard` (feature)

```ts
type MyPositionCardProps = {
  rank: number;
  points: number;
  activities: number;
  onOpenActivities: () => void;
};
```

Renders the `#F7F3EB` rounded card: circle chip with `#${rank}`, "Você" + `${points} pontos · ${activities} atividades`, black "Ver minhas atividades →" button. The whole card is **not** a button (only the CTA inside is) so users can read the card without accidentally navigating away.

#### `Podium` + `PodiumCard` (feature)

```ts
type PodiumCardProps = {
  rank: 1 | 2 | 3;
  firstName: string;
  dept: string;
  points: number;
};
```

`Podium` props: `{ topThree: RankingRow[] }`. The component picks `topThree[0]`, `[1]`, `[2]` and renders them in 2-1-3 visual order. `firstName` is computed in the component (`name.split(' ')[0]`) — a one-line display formatter, not domain logic. The rank-1 raised `translateY(-10px)` is applied as a class `podiumCardFirst` in the CSS module, not inline.

`Podium` is a thin wrapper that assumes `topThree.length === 3`. If the lib ever returned fewer, the component renders whatever was passed (no fallback rendering — let the bug surface).

#### `RankingTabs` (feature)

```ts
type RankingTabsProps = {
  active: TabKind;
  onChange: (tab: TabKind) => void;
};
```

Renders the segmented pill with three options. The labels live in a module-level `const TABS: { id: TabKind; label: string }[]` next to the component — presentation strings, not domain data.

#### `RankingList`, `RankingListHeader`, `RankingListRow`, `RankingListEmpty` (feature)

```ts
type RankingListProps = {
  rows: RankingRow[];
  emptyMessage: string;     // shown when rows.length === 0
};
```

`RankingList` renders `RankingListHeader` always, and either the rows or `RankingListEmpty` with the message.

```ts
type RankingListRowProps = { row: RankingRow };
```

`RankingListRow` renders the rank cell (orange `#9B3A1B` when `rank <= 3`, black otherwise — class toggle, no inline conditional style object), an `Avatar`, the name (with `(você)` suffix when `row.me`), the dept · `${activities} atividades` meta line, and the right-aligned points. When `row.me` is true, the row gets a `rowMe` class that paints `#F7F3EB` background, `3px solid #000` left border, and `font-weight: 600` on the name. Class toggle, not inline style. The row root also sets `data-me="true"` (only when `row.me` is true) so page tests can target the "me" row without depending on the hashed CSS-module class name.

#### `FullListToggle` (feature)

```ts
type FullListToggleProps = {
  expanded: boolean;
  total: number;
  onToggle: () => void;
};
```

Renders the rounded outline button. Label is `expanded ? 'Mostrar somente próximos a mim ▴' : \`Ver classificação completa (${total}) ▾\``.

### Page

```tsx
// src/pages/olimpipo-ranking-page.tsx
import { useParams, useNavigate } from '@tanstack/react-router';
import { useOlimpipoRanking } from '@/hooks/use-olimpipo-ranking';
import { OlimpipoShell } from '@/components/olimpipo/olimpipo-shell';
import { OlimpipoHeader } from '@/components/olimpipo/olimpipo-header';
import { MyPositionCard } from '@/components/olimpipo/my-position-card';
import { Podium } from '@/components/olimpipo/podium';
import { RankingTabs } from '@/components/olimpipo/ranking-tabs';
import { RankingList } from '@/components/olimpipo/ranking-list';
import { FullListToggle } from '@/components/olimpipo/full-list-toggle';
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

  return (
    <OlimpipoShell>
      <OlimpipoHeader
        eyebrow={`Olimpipo · ${edition.label}`}
        title="Classificação"
        sub={`${edition.period} · ${edition.participants} pessoas participando.${
          edition.active ? ` Faltam ${edition.daysRemaining} dias.` : ''
        }`}
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

The page has no `.filter` / `.map` / `.find` over ranking data. The only branching is the `state === 'not-found'` guard, which is a discriminated-union narrow, not domain logic. `EMPTY_MESSAGE` is presentation-only copy; it travels with the page.

The `MyPositionCard` reads from `edition.myRank` / `myPoints` / `myActivities` — **not** from `meRow`. Reason: `meRow` is the row in the ranking list (which may be absent when the user is outside the fixture range), while `edition.myRank` is always present for the edition.

### Page test

`src/pages/olimpipo-ranking-page.spec.tsx` — drives the page through an in-memory `MemoryRouter` configured with the three real routes (`/`, `/olimpipo/$editionId`, `/olimpipo/$editionId/activities`). No mocking of the hook — the page test exercises the full vertical slice for the rendered output. Cases:

- `/olimpipo/mai-26` renders the header "Classificação", the eyebrow `Olimpipo · Maio/26`, the "Você" card with `#14`, the podium with three first names from ranks 1–3, the three tab labels, and 5 rows in the table (Geral, default).
- Clicking the `Meu time` tab swaps the visible rows to the Produto-dept entries (Mariana, Beatriz, Ana).
- Clicking `Amigos` shows the empty-state copy `Adicione amigos para comparar — em breve.`.
- Clicking the `Ver classificação completa (18) ▾` toggle expands to 18 rows and the label flips.
- Clicking `Ver minhas atividades →` navigates to `/olimpipo/mai-26/activities` and the placeholder renders.
- `/olimpipo/mar-26` (rank #1): the "Você" card shows `#1`, the meta line shows that edition's points/activities. Rank 1 has `data-me="true"` (and the `rowMe` highlight styling) on its row.
- `/olimpipo/nov-25` (rank #34, out of fixture range): the "Você" card shows `#34`; `Meu time` tab shows the dept-empty message; no row has `data-me="true"`.
- `/olimpipo/foobar` (unknown id): renders `EmBrevePage`.

### Routing

```
src/routes/olimpipo/
├── index.tsx                ← unchanged (created by 002)
├── $editionId.tsx           ← swap EmBrevePage → OlimpipoRankingPage
└── $editionId/
    └── activities.tsx       ← NEW, re-exports EmBrevePage
```

```tsx
// src/routes/olimpipo/$editionId.tsx (after the swap)
import { createFileRoute } from '@tanstack/react-router';
import { OlimpipoRankingPage } from '@/pages/olimpipo-ranking-page';

export const Route = createFileRoute('/olimpipo/$editionId')({ component: OlimpipoRankingPage });
```

```tsx
// src/routes/olimpipo/$editionId/activities.tsx (new)
import { createFileRoute } from '@tanstack/react-router';
import { EmBrevePage } from '@/pages/em-breve-page';

export const Route = createFileRoute('/olimpipo/$editionId/activities')({ component: EmBrevePage });
```

When `pipo-cuida-004` lands, only the `activities.tsx` component import flips — the route stays put. The page itself never imported `EmBrevePage` for the activities CTA; it navigated to the path string.

### Styling & assets

- No new SVG assets. The screen uses only colors, shapes, and the `Avatar` initial.
- The medal-tier hexes (`#FFE9A8` gold, `#ECECEC` silver, `#F4D9BD` bronze, `#FFEEC2` top10) already established in 002 are reused as-is by `PodiumCard`. `PodiumCard` only needs gold/silver/bronze, so the three values live in the component's CSS module (not promoted to tokens until a third feature consumes them).
- All component styling lives in co-located `*.module.css` files. Inline `style={...}` is used only on the `Avatar` for `width`/`height`/`background`/`color` (the four values that legitimately vary by prop and can't be expressed by class alone).
- No additions to `src/styles/tokens.css`. `--font-heading` was aliased in 002.
- The "Você" highlight row uses a class toggle (`rowMe`), not conditional inline style.

## Acceptance criteria

1. `docker compose up pipo-cuida` (or `npm run dev`) serves `http://localhost:5173/olimpipo/mai-26` and renders the ranking screen.
2. Visiting `/olimpipo` (002's editions list) and clicking the active "Ver classificação →" CTA navigates to `/olimpipo/mai-26` and renders the new screen (instead of `EmBrevePage`).
3. The "Você" card shows `#14`, `580 pontos · 12 atividades`, and a black "Ver minhas atividades →" CTA. Clicking the CTA navigates to `/olimpipo/mai-26/activities` and renders `EmBrevePage` with its `← Voltar ao início` link.
4. The podium renders three cards in visual order rank-2, rank-1, rank-3, with rank-1 raised `-10px`. Each card shows: medal chip with `1º`/`2º`/`3º`, first name, dept, and `${points} pts`. Background tints match `#FFE9A8` / `#ECECEC` / `#F4D9BD`.
5. Three tabs render — "Geral", "Meu time", "Amigos" — as a segmented pill. The active tab gets the white pill background.
6. Default view (Geral, windowed): 5 rows are visible, centered on rank 14 (#12 to #16). The row at rank 14 has `data-me="true"` (and the `rowMe` highlight styling) — `#F7F3EB` background, `3px solid #000` left border, name reads `Ana Silva (você)`.
7. Toggle button label is `Ver classificação completa (18) ▾`. Clicking expands the list to 18 rows and the label flips to `Mostrar somente próximos a mim ▴`. Clicking again restores the window.
8. Clicking "Meu time" filters the list to dept `Produto` (rows 1, 11, 14). Toggle label updates to `Ver classificação completa (3) ▾`.
9. Clicking "Amigos" shows only the empty state `Adicione amigos para comparar — em breve.` and the toggle label updates to `Ver classificação completa (0) ▾`.
10. Opening `/olimpipo/mar-26` (myRank #1): "Você" card shows `#1`; the row at rank 1 has `data-me="true"` (and the `rowMe` highlight styling).
11. Opening `/olimpipo/nov-25` (myRank #34, outside fixture range): "Você" card shows `#34`. No row has `data-me="true"` (and the `rowMe` highlight styling). "Meu time" tab renders the empty-state copy `Sem dados do seu time para esta edição.`.
12. Opening `/olimpipo/foobar` (unknown id) renders `EmBrevePage`.
13. `npm run typecheck` and `npm run test` pass. New tests:
    - `ranking.spec.ts` — covers `applyMe`, `computeWindow`, `filterByTab`, `buildRankingFor` per the cases in the lib section.
    - `use-olimpipo-ranking.spec.ts` — covers not-found, active edition default state, tab switches, toggle, out-of-range edition, `activitiesPath`.
    - `avatar.spec.tsx` — renders the initial(s), reflects `size`, omits border when `bordered={false}`.
    - `olimpipo-ranking-page.spec.tsx` — drives the page through an in-memory router and asserts the visible output for all eight cases in the page-spec section.
14. No business-logic `if`/filter/map over ranking data appears outside `src/lib/olimpipo/ranking.ts`. Code review of `src/pages/`, `src/hooks/`, `src/components/olimpipo/` and `src/components/ui/` finds none.
15. `MOCK_OLIMPIPO_RANKING` exists only in `src/lib/olimpipo/mock-data.ts`. No duplicate fixture anywhere.

## Out-of-scope follow-ups

- `pipo-cuida-004` — submitted activities at `/olimpipo/$editionId/activities`. Swaps `EmBrevePage` for the real page in `routes/olimpipo/$editionId/activities.tsx`. Adds `ActivityIcon` primitive, `MOCK_OLIMPIPO_ACTIVITIES` fixture, and `activities.ts` lib for the totals derivation.
- Real auth — `me` from a real user identity instead of `edition.myRank`-based derivation. The lib signature changes from `(rows, edition)` to `(rows, edition, currentUserId)`; everything else stays.
- Replacing mocks with a fetch — same hook return shape; only the data source flips.
- Friends graph — real source for the `Amigos` tab. The component already takes any `rows: RankingRow[]`, so only the hook's filter changes.

## References

- Design source: `.claude/design/project/OlimpipoScreens.jsx` lines 27–47 (`OLIMPIPO_RANKING` fixture), 355–389 (`PodiumCard`), 391–564 (`OlimpipoRankingScreen`).
- Conventions: `.claude/rules/nextjs-app.md` — "Component / hook / lib separation", "Test isolation per layer", "Test structure: no branching", "ID values".
- Previous tasks: `.claude/specs/pipo-cuida-001-home-bootstrap-design.md`, `.claude/specs/pipo-cuida-002-olimpipo-editions-design.md`, `.claude/plans/pipo-cuida-001-home-bootstrap-plan.md`, `.claude/plans/pipo-cuida-002-olimpipo-editions-plan.md`.
