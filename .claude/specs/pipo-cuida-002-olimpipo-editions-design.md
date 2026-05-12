**Task:** pipo-cuida-002
**Area:** web
**Title:** Build the Olimpipo editions list page

## Goal

Render the `OlimpipoEditionsScreen` from `.claude/design/project/OlimpipoScreens.jsx` (lines 140–334) as a real route at `/olimpipo` inside `apps/pipo-cuida/`. The page surfaces one hero card for the active monthly edition and a list of past editions with medal-tier badges derived from each edition's final rank. Clicking any edition navigates to `/olimpipo/<editionId>`, which still falls back to the existing `Em breve` placeholder — the ranking and activity screens stay out of scope and become `pipo-cuida-003` / `pipo-cuida-004`.

The pipo-cuida home (shipped in `pipo-cuida-001`) already links to `/olimpipo` from the `QuickLinksSection` row. Today that click lands on the catch-all; after this task it lands on the real editions screen.

## Why now

This task introduces three structural pieces the next iterations will reuse:

- The first domain models for this app live under `src/models/olimpipo.ts`, instead of being co-located with the hook (the shortcut `pipo-cuida-001` took for `HomeData`). Future tasks (ranking, activities, member profile) will add their own files alongside.
- The first pure-logic module lives under `src/lib/olimpipo/`. Tier classification (gold / silver / bronze / top10 / none) and the active-vs-past split are not React state — they are deterministic functions of the edition data and belong outside the hook. This sets the precedent for the rule in `.claude/rules/nextjs-app.md` ("Hooks orchestrate, lib does heavy lifting, components compose").
- Mock data moves out of inline literals inside the hook and into a dedicated `src/lib/olimpipo/mock-data.ts` fixture. The hook reads the fixture and runs it through the lib — the same shape it will use the day the mock is replaced by a fetch.

## Scope

### In scope

- A new route `/olimpipo` rendered by `OlimpipoEditionsPage` in `apps/pipo-cuida/src/pages/`.
- Domain models in `src/models/olimpipo.ts` (`Edition`, `Tier`, `TierKind`, `EditionWithTier`).
- Pure logic in `src/lib/olimpipo/editions.ts` (`classifyTier`, `withTier`, `splitEditions`) with full unit tests in `src/lib/olimpipo/editions.spec.ts`.
- Mock data fixture in `src/lib/olimpipo/mock-data.ts` (seven editions translated from `OLIMPIPO_EDITIONS` in the design source, snake_case → camelCase).
- A per-feature hook `useOlimpipoEditions` at `src/hooks/use-olimpipo-editions.ts` returning `{ activeEdition, pastEditions }` already shaped for the UI, plus a `editionPath(id)` helper. Hook spec covers the shape it returns and the helper output.
- One new UI primitive `Stat` (`src/components/ui/stat/`) with a `tone` variant — reused later by the ranking screen.
- Four feature components in `src/components/olimpipo/`:
  - `olimpipo-shell/` — centered 520px column wrapper.
  - `olimpipo-header/` — eyebrow + title + optional subtitle.
  - `active-edition-card/` — dark navy hero with the decorative dots SVG and three `Stat`s.
  - `past-edition-row/` and `past-editions-list/` — medal-chip row + list wrapper.
- File-based routes: `src/routes/olimpipo/index.tsx` for the editions page; `src/routes/olimpipo/$editionId.tsx` re-using `EmBrevePage` so deep links to `/olimpipo/<id>` resolve cleanly without changing the existing root-level catch-all.
- One new asset copied into `public/assets/illustrations/`: `grafismo-dots-azul-claro.svg`.
- One new CSS-token alias `--font-heading` mapped to `--pipo-font-display` (the new design source uses `--font-heading`; mapping it in `tokens.css` keeps the CSS modules verbatim from the source).
- Page-level rendering test that renders the page through an in-memory router and asserts the visible content.

### Out of scope

- `OlimpipoRankingScreen` and `OlimpipoActivitiesScreen` (the next two screens in the design source). Tracked as `pipo-cuida-003` and `pipo-cuida-004`.
- Real auth / a real user identity. `myRank`, `myPoints`, `myActivities` come from the mock fixture; no current-user lookup.
- Replacing the mock with a fetch. The hook keeps the same return type the day real data lands — only the data source changes.
- Any change to the existing `QuickLinksSection` link from the home (it already targets `/olimpipo`).
- Storybook / visual regression tooling.

## Architecture

### Stack

Same as `pipo-cuida-001`: Vite 5 + React 18 + TypeScript (strict), TanStack Router file-based routing, CSS Modules, Vitest + Testing Library. No additional dependencies.

### Directory layout (additions only)

```
apps/pipo-cuida/
├── public/assets/illustrations/
│   └── grafismo-dots-azul-claro.svg          ← new asset copy
└── src/
    ├── models/
    │   └── olimpipo.ts                       ← new
    ├── lib/
    │   └── olimpipo/
    │       ├── mock-data.ts                  ← new
    │       ├── editions.ts                   ← new
    │       └── editions.spec.ts              ← new
    ├── hooks/
    │   ├── use-olimpipo-editions.ts          ← new
    │   └── use-olimpipo-editions.spec.ts     ← new
    ├── components/
    │   ├── ui/
    │   │   └── stat/                         ← new primitive
    │   │       ├── stat.tsx
    │   │       ├── stat.module.css
    │   │       └── stat.spec.tsx
    │   └── olimpipo/                         ← new feature folder
    │       ├── olimpipo-shell/
    │       ├── olimpipo-header/
    │       ├── active-edition-card/
    │       ├── past-edition-row/
    │       └── past-editions-list/
    ├── pages/
    │   ├── olimpipo-editions-page.tsx        ← new
    │   ├── olimpipo-editions-page.module.css
    │   └── olimpipo-editions-page.spec.tsx
    └── routes/
        └── olimpipo/                         ← new folder
            ├── index.tsx                     ← /olimpipo
            └── $editionId.tsx                ← /olimpipo/<id> → EmBrevePage
```

### Hook / lib / UI separation (non-negotiable)

This is the principal architectural rule that distinguishes `pipo-cuida-002` from `pipo-cuida-001`. The three layers have no overlap:

| Layer | Path | What lives here | What does NOT live here |
| --- | --- | --- | --- |
| **Models** | `src/models/olimpipo.ts` | Plain TypeScript types: `Edition`, `Tier`, `TierKind`, `EditionWithTier`. No runtime code. | Functions, React, mock data. |
| **Lib (pure logic)** | `src/lib/olimpipo/editions.ts` | Pure, deterministic functions: tier classification, active/past split, any derivation of the UI shape from the model shape. Imports models only. Tested without any DOM or React. | React imports, `useState`, `useMemo`, JSX, fetch, mock literals. |
| **Mock fixture** | `src/lib/olimpipo/mock-data.ts` | `MOCK_OLIMPIPO_EDITIONS: Edition[]` — the only place this literal exists. | Derivations, functions, React, the hook's return shape. |
| **Hook (orchestration)** | `src/hooks/use-olimpipo-editions.ts` | Reads the fixture, runs it through `splitEditions`, exposes the UI-ready shape `{ activeEdition, pastEditions }`. Also exports the `editionPath(id)` helper used by the page for navigation. | JSX, layout decisions, CSS imports, inline filtering / mapping that should have been in lib, mock data literals duplicated from the fixture. |
| **Feature components** | `src/components/olimpipo/<name>/` | Pure JSX composition. Receive already-shaped data via props. May own local UI state if it appears (none in this task). | Direct fetch, direct hook reads of other features, business-logic `if`/filter/map over domain data, hard-coded mock data. |
| **Page** | `src/pages/olimpipo-editions-page.tsx` | Import the hook, import the feature components, render. The function body is essentially the JSX tree plus a one-line `openEdition` handler that calls `navigate({ to: editionPath(id) })`. | Any `.filter`/`.map`/`.find` on `editions`. Any tier resolution. Any mock literal. |

If any chunk of logic feels like it could live in two places, the lib wins. The lib's tests assert the math; the hook's tests assert that the hook called the lib and stored what came back; the component tests assert the rendered output given already-shaped props.

### Models

```ts
// src/models/olimpipo.ts

export type EditionId = string;

export type Edition = {
  id: EditionId;
  label: string;          // "Maio/26"
  period: string;         // "01 — 31 maio 2026"
  active: boolean;
  daysRemaining: number;  // 0 for past editions
  participants: number;
  myRank: number;
  myPoints: number;
  myActivities: number;
};

export type TierKind = 'gold' | 'silver' | 'bronze' | 'top10' | 'none';

export type Tier = {
  kind: TierKind;
  bg: string;             // tile background hex
  fg: string;             // tile foreground hex
  medal: string;          // medal accent hex
  label: string | null;   // "🥇 1º lugar" | "🥈 2º lugar" | "🥉 3º lugar" | "🏅 Top 10" | null
};

export type EditionWithTier = Edition & { tier: Tier };
```

`Tier.label` is `null` only for the `none` kind — the past-edition row shows the tier pill if and only if `label !== null`.

### Lib

`src/lib/olimpipo/editions.ts` exports three pure functions:

- `classifyTier(rank: number): Tier` — the conditional ladder from the design source (lines 244–249), encoded once.
- `withTier(edition: Edition): EditionWithTier` — shallow-merges the tier in.
- `splitEditions(editions: Edition[]): { active: Edition | null; past: EditionWithTier[] }` — `find` the active one (no tier), `filter` and `map(withTier)` the rest.

These are the only places where the active/past separation or the tier ladder may appear. If a future component or hook needs to re-derive either, it imports from this module.

### Mock data

`src/lib/olimpipo/mock-data.ts` exports `MOCK_OLIMPIPO_EDITIONS: Edition[]` — the seven entries from `OLIMPIPO_EDITIONS` in the design source, translated to camelCase. The fixture is the only file in the app that holds Olimpipo edition literals.

### Hook

```ts
// src/hooks/use-olimpipo-editions.ts

export type OlimpipoEditionsData = {
  activeEdition: Edition | null;
  pastEditions: EditionWithTier[];
};

export function useOlimpipoEditions(): OlimpipoEditionsData;
export function editionPath(editionId: string): string;
```

`useOlimpipoEditions` calls `splitEditions(MOCK_OLIMPIPO_EDITIONS)` inside a `useMemo(..., [])` so the result is stable across renders. `editionPath` returns `/olimpipo/${editionId}` — kept as a function so a future change to nested routing only touches one place.

### Components

#### `Stat` primitive (`src/components/ui/stat/`)

A small block that renders a large numeric value above a label. Props:

```ts
type StatProps = {
  label: string;
  value: string | number;
  tone?: 'dark' | 'light';   // dark = black text on light bg; light = white text on dark bg
};
```

Variant comes through `data-tone`; CSS picks the colors. No business logic.

#### `olimpipo-shell` (feature)

Centered 520px column with `padding: 32px 24px 96px`. Identical purpose to the home's wrapper but its own component so the page composition reads as `<OlimpipoShell>…</OlimpipoShell>`.

#### `olimpipo-header` (feature)

Renders an eyebrow row (small monospace label preceded by the Olimpipo icon), an h1 title, and an optional subtitle paragraph. Props: `{ eyebrow: string; title: string; sub?: string }`.

#### `active-edition-card` (feature)

The dark navy hero (`#060D41`). Receives `edition: Edition` and `onOpen: () => void`. Renders:

- Decorative dots SVG positioned top-right via CSS (no inline style for repeated values — class on the `<img>`).
- "Edição ativa" pill with the light-green halo dot.
- Edition label (large heading).
- Period + "faltam N dias" subline.
- 3-column `<Stat tone="light" />` grid: Sua posição (`#${myRank}`), Seus pontos (`myPoints`), Participantes (`participants`).
- "Ver classificação →" CTA line at the bottom.

Whole card is one `<button>`; pressing it fires `onOpen()`.

#### `past-edition-row` (feature)

Receives `edition: EditionWithTier` and `onOpen: () => void`. Renders:

- 52×52 medal chip with `tier.bg`/`tier.fg`. Top-3 tiers get a 2px `tier.medal` border and a star badge overlay top-right.
- Edition label + tier pill (rendered iff `tier.label !== null`).
- Meta line: `${myPoints} pontos · ${myActivities} atividades · ${participants} participantes`.
- Chevron `›` on the right.

Whole row is one `<button>`.

#### `past-editions-list` (feature)

Wraps the section heading "Edições anteriores" and the list of `<PastEditionRow />`s.

```ts
type PastEditionsListProps = {
  editions: EditionWithTier[];
  onOpen: (editionId: EditionId) => void;
};
```

### Page

```tsx
export function OlimpipoEditionsPage() {
  const navigate = useNavigate();
  const { activeEdition, pastEditions } = useOlimpipoEditions();
  const openEdition = (id: string) => navigate({ to: editionPath(id) });

  return (
    <OlimpipoShell>
      <OlimpipoHeader
        eyebrow="Olimpipo"
        title="Suas edições"
        sub="Toda edição da Olimpipo dura um mês. Apenas a edição mais recente está ativa — registre suas atividades e dispute o pódio."
      />
      {activeEdition && (
        <ActiveEditionCard edition={activeEdition} onOpen={() => openEdition(activeEdition.id)} />
      )}
      <PastEditionsList editions={pastEditions} onOpen={openEdition} />
    </OlimpipoShell>
  );
}
```

No filtering, no mapping, no tier resolution inside the page. The body is composition + one navigation handler.

### Routing

TanStack Router resolves the existing root catch-all `routes/$.tsx` only for single-segment paths. To make `/olimpipo` render the editions page and `/olimpipo/<id>` continue to render `Em breve`, we add a `routes/olimpipo/` folder with two files:

- `routes/olimpipo/index.tsx` → `OlimpipoEditionsPage`.
- `routes/olimpipo/$editionId.tsx` → `EmBrevePage` (re-export).

When `pipo-cuida-003` lands, `$editionId.tsx` swaps its component for the real ranking page. The route file is the only thing that changes; the page itself never imported `EmBrevePage` directly.

### Styling & assets

- `grafismo-dots-azul-claro.svg` is copied from `.claude/design/project/assets/illustrations/` into `apps/pipo-cuida/public/assets/illustrations/`.
- `src/styles/tokens.css` gains one alias appended to the existing alias block:

  ```css
  :root {
    /* … existing aliases … */
    --font-heading: var(--pipo-font-display);
  }
  ```

  The design source for Olimpipo screens uses `var(--font-heading)`; aliasing keeps the CSS modules byte-identical to the source where possible.
- All component styling lives in co-located `*.module.css` files. Inline `style={...}` is allowed only for the one-off `transform: translateY(-10px)` on the podium card — and that lives in `pipo-cuida-003`, not here.

### Mock fixture sample

```ts
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

## Acceptance criteria

1. `docker compose up pipo-cuida` (or `npm run dev`) serves `http://localhost:5173/olimpipo` rendering the editions screen.
2. Visiting `/` and clicking the "Olimpipo" quick-link row now navigates to `/olimpipo` and renders the new screen (instead of falling back to `Em breve`).
3. The active edition appears as the dark navy hero with the green "Edição ativa" pill, three `Stat`s, and the "Ver classificação →" line. Clicking it navigates to `/olimpipo/mai-26` and renders `Em breve` with the `← Voltar ao início` link.
4. Six past editions render below the heading "Edições anteriores". Their medal chips show:
   - Rank 1 → gold (`#FFE9A8` bg, gold star badge).
   - Rank 2 → silver (`#ECECEC` bg, silver star).
   - Rank 3 → bronze (`#F4D9BD` bg, bronze star).
   - Ranks 4–10 → top10 yellow (`#FFEEC2` bg, no badge ring).
   - Rank > 10 → none (`#F4F2EF` bg, no tier pill displayed).
5. Past-edition rows match: label + tier pill (when present), `${myPoints} pontos · ${myActivities} atividades · ${participants} participantes` meta line, right-side chevron.
6. `npm run typecheck` and `npm run test` pass. New tests:
   - `editions.spec.ts` — tier classification for every threshold (1, 2, 3, 10, 11), `splitEditions` returns one active and six past sorted as the fixture provides.
   - `use-olimpipo-editions.spec.ts` — hook returns the active edition (id `mai-26`) and six past editions, each past edition has its tier already attached.
   - `stat.spec.tsx` — primitive renders the value and the label, `data-tone` attribute reflects the prop.
   - `olimpipo-editions-page.spec.tsx` — page renders the active hero title "Maio/26", the "Edições anteriores" heading, and at least the gold-tier label `1º lugar` once.
7. No business-logic `if`/filter/map over edition data appears outside `src/lib/olimpipo/`. Code review of `src/pages/`, `src/hooks/`, and `src/components/olimpipo/` finds none.
8. No copy of the mock fixture exists outside `src/lib/olimpipo/mock-data.ts`.

## Out-of-scope follow-ups

- `pipo-cuida-003` — ranking screen at `/olimpipo/$editionId`, replaces the `EmBrevePage` re-export in `routes/olimpipo/$editionId.tsx`. Reuses `Stat`, `OlimpipoShell`, `OlimpipoHeader`, `editionPath`.
- `pipo-cuida-004` — submitted activities screen at `/olimpipo/$editionId/activities`. Adds `ActivityIcon` primitive and the `OLIMPIPO_ACTIVITIES` mock under `src/lib/olimpipo/`.
- Real-data swap — replace `MOCK_OLIMPIPO_EDITIONS` import with a fetch in the hook. Lib and components do not change.

## References

- Design source: `.claude/design/project/OlimpipoScreens.jsx` lines 10–25 (data), 140–334 (`OlimpipoEditionsScreen`), 336–349 (`Stat`).
- Decorative SVG: `.claude/design/project/assets/illustrations/grafismo-dots-azul-claro.svg`.
- Conventions: `.claude/rules/nextjs-app.md` — sections "Component / hook / lib separation", "Test isolation per layer", "Test structure: no branching", "ID values".
- Previous task: `.claude/specs/pipo-cuida-001-home-bootstrap-design.md`, `.claude/plans/pipo-cuida-001-home-bootstrap-plan.md`.
