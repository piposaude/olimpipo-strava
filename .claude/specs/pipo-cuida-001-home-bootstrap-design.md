**Task:** pipo-cuida-001
**Area:** web
**Title:** Bootstrap the pipo-cuida web app with the home screen

## Goal

Stand up a new Vite + React + TypeScript application at `apps/pipo-cuida/` that renders the Pipo Cuida member home screen pixel-faithful to the design source in `.claude/design/project/`. The home is the landing page of the member portal; every other route is out of scope for this iteration and falls through to a placeholder "Em breve" screen so the menu is clickable end-to-end without 404s.

## Why now

The design source (`HomeScreen.jsx`, `Chrome.jsx`, `Primitives.jsx`) is a Babel-standalone prototype that can't be deployed. The Olimpipo Strava integration that lives in this repo plugs into Pipo Cuida as one menu item, and the next iteration will replace the catch-all with the real Olimpipo screens. Shipping the home first establishes the application shell, the design-token wiring, the asset pipeline, and the component conventions that every later screen will reuse.

## Scope

### In scope

- A new Vite-scaffolded React + TypeScript app at `apps/pipo-cuida/`.
- The home screen as it appears in `.claude/design/project/HomeScreen.jsx`, with the top bar from `Chrome.jsx`.
- Reusable UI primitives extracted from the design: `Button`, `Logo`, `BannerCard`, `BigTile`, `LinkRow`, `OlimpipoLinkRow`, `PartnerCard`, `TopBar`. Each primitive lives in `src/components/ui/` with a co-located CSS module.
- A `useHome` per-feature hook that returns the shape the page consumes (`user`, `helpTiles`, `quickLinks`, `partners`, `olimpipoActiveEdition`). Data is mocked inline in the hook; no network calls.
- TanStack Router with file-based routing, the Vite plugin, two routes: `/` (home) and `*` catch-all (`<EmBreve />`), wrapped by a root layout that renders `<TopBar />` and the page outlet.
- Design tokens from `.claude/design/project/tokens.css` copied to `apps/pipo-cuida/src/styles/tokens.css` and imported once from `main.tsx`. Component CSS modules consume tokens via `var(--pipo-*)`.
- Static assets (icons, illustrations, logos) copied into `apps/pipo-cuida/public/assets/` mirroring the directory layout used by the design source so `<img src="/assets/icons/..." />` paths line up with the source markup.
- A `Dockerfile` and `docker-compose.yml` service entry so the app boots alongside the existing services with `docker compose up`.
- One Vitest + Testing Library smoke test per primitive plus a single `HomePage` rendering test, following the rule's component-test rules (no branching in tests/mocks/helpers; `randomUUID()` for any id literals).

### Out of scope

- Real authentication, real `Meus dados` / `Sair` behavior (they render but their handlers are no-ops, with an inline comment marking the next iteration).
- Real navigation targets — `plan`, `network`, `claims`, `olimpipo`, `Carteirinhas`, `Fazer check-up`, `Tirar dúvidas`, `Programa Pinguim` all route to the catch-all.
- The Olimpipo edition/ranking/activities screens from `OlimpipoScreens.jsx`.
- `src/models/`, `src/schemas/`, `src/lib/<feature>/` directories. They will appear in the iteration that introduces fetch + forms — creating them empty now would be premature.
- BFF / API routes, middleware, server-env. Vite has no equivalent and the rule in `.claude/rules/nextjs-app.md` explicitly scopes those sections to Next.js apps with a backend.
- Storybook, Chromatic, visual-regression tooling.

## Architecture

### Stack

- **Vite 5** + **React 18** + **TypeScript 5** (strict).
- **TanStack Router 1.x** with `@tanstack/router-plugin/vite` for file-based routes and `routeTree.gen.ts` auto-generation.
- **Vitest** + **@testing-library/react** + **jsdom** for unit tests.
- **CSS Modules** (Vite native) per component, plus one global `tokens.css` imported once.

### Directory layout

```
apps/pipo-cuida/
├── Dockerfile
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── public/
│   └── assets/
│       ├── icons/        ← copied from .claude/design/project/assets/icons
│       ├── illustrations/← copied from .claude/design/project/assets/illustrations
│       └── logos/        ← copied from .claude/design/project/assets/logos
└── src/
    ├── main.tsx
    ├── styles/
    │   ├── tokens.css
    │   └── global.css
    ├── routes/
    │   ├── __root.tsx          ← layout: <TopBar /> + <Outlet />
    │   ├── index.tsx           ← /
    │   └── $.tsx               ← catch-all → <EmBreve />
    ├── routeTree.gen.ts        ← generated, gitignored
    ├── components/
    │   ├── ui/                 ← Tier-1-equivalent primitives, one folder per component
    │   │   ├── button/
    │   │   │   ├── button.tsx
    │   │   │   └── button.module.css
    │   │   ├── logo/
    │   │   ├── top-bar/
    │   │   ├── banner-card/
    │   │   ├── big-tile/
    │   │   ├── link-row/
    │   │   ├── olimpipo-link-row/
    │   │   └── partner-card/
    │   └── home/               ← feature components specific to the home
    │       ├── help-section/
    │       │   ├── help-section.tsx
    │       │   └── help-section.module.css
    │       ├── quick-links-section/
    │       └── partners-section/
    ├── pages/
    │   ├── home-page.tsx
    │   └── em-breve-page.tsx
    └── hooks/
        └── use-home.ts
```

### Component tiers (nextjs-app.md adapted to a single-app Vite project)

The rule's three tiers collapse to two because there is no `packages/ui` workspace:

| Tier | Location | Rule |
| --- | --- | --- |
| **Primitives** | `src/components/ui/<name>/` | Pure presentation, no business logic, no async, no router imports. CSS module co-located. Accept variant/styling props only. |
| **Feature components** | `src/components/<feature>/<name>/` | Compose primitives. Consume data via props from the per-feature hook. May own local UI state (hover, open/close). No direct fetch, no direct router-data access. |
| **Pages** | `src/pages/<name>.tsx` | Pure composition: import the per-feature hook, the feature sections, render. No data work in JSX. |

### Per-feature hook

`src/hooks/use-home.ts` returns:

```ts
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

export function useHome(): HomeData { /* mocked */ }
```

`NavTarget` is the union of menu destinations (`'plan' | 'network' | 'claims' | 'olimpipo' | ...`). The hook returns a static object today; when real data lands the signature stays stable.

### Routing

TanStack Router with file-based routes:

- `routes/__root.tsx` — root layout, renders `<TopBar />` and `<Outlet />`. No data loader.
- `routes/index.tsx` — matches `/`, renders `<HomePage />`.
- `routes/$.tsx` — catch-all, renders `<EmBreveScreen />` with a `Voltar ao início` link back to `/`.

Navigation inside the app uses TanStack's `Link` component (real `<a>`, prefetch on hover). Programmatic navigation uses `useNavigate()`. The `onNavigate(target)` API in the design source becomes `<Link to={resolveTarget(target)}>`; `resolveTarget` maps `'plan' | 'network' | ...` to `/plan`, `/network`, … so every link renders a real anchor.

### Styling

- `src/styles/tokens.css` — verbatim copy of `.claude/design/project/tokens.css` plus a small additions block for the `--font-display`, `--font-body`, `--font-ui`, `--font-mono`, and `--ease-standard` aliases the design source uses directly (the source pulls them from `colors_and_type.css`; we consolidate so a single import gives every component the variables it needs).
- `src/styles/global.css` — body reset, `font-family: var(--pipo-font-body)`, background, scrollbar styling (mirrors the `<style>` block in `Olimpipo.html`).
- Per-primitive `*.module.css` — translation of the inline-style object in `Primitives.jsx`/`HomeScreen.jsx`/`Chrome.jsx`. One CSS module per primitive; hover/focus states implemented as class toggles + `:hover` pseudo, not as inline `boxShadow` swaps on mouse events.
- Inline `style={...}` allowed only for one-off layout in pages (e.g. the 2-column `display: grid` for the help tiles, the section gaps in `HomePage`). The CSS-modules-vs-inline rule from `.claude/rules/nextjs-app.md` carves this out explicitly.

### Assets

The design's image paths are relative (`assets/icons/...`). We mirror that by copying the directory under `apps/pipo-cuida/public/`, so a primitive's `<img src="/assets/icons/illus-checkup.svg" />` matches Vite's serving convention with a leading slash.

Copied subsets (the rest stay in `.claude/design/` for future iterations):

- `assets/icons/icon-arrow.svg`, `icon-chevron.svg` (everything else under `icons/` already includes `illus-*` files used by the home).
- `assets/illustrations/especialista.svg`, `spot-rede.svg`.
- `assets/logos/pipo-wordmark.svg`.
- All five `illus-*.svg` icons referenced by `LinkRow` and `OlimpipoLinkRow` (`illus-benefit-card`, `illus-checkup`, `illus-chat-questions`, `illus-programa-pinguim`, `illus-olimpipo`).

### Fonts

- Manrope via Google Fonts CDN (`@import` in `global.css`), matching what the design `tokens.css` already does.
- Season Serif is proprietary — fallback chain is `"Manrope", Georgia, serif` with `font-style: italic` for display headings, mirroring the substitution flag the design source documents.

### Mock data

```ts
const useHome = (): HomeData => ({
  user: { name: 'Ana Silva' },
  helpTiles: [
    { title: 'Falar com o time de saúde', illustrationSrc: '/assets/illustrations/especialista.svg', target: 'plan' },
    { title: 'Buscar rede credenciada', illustrationSrc: '/assets/illustrations/spot-rede.svg', target: 'network' },
  ],
  quickLinks: [
    { label: 'Carteirinhas', iconSrc: '/assets/icons/illus-benefit-card.svg', target: 'plan' },
    { label: 'Fazer check-up', iconSrc: '/assets/icons/illus-checkup.svg', target: 'plan' },
    { label: 'Tirar dúvidas', iconSrc: '/assets/icons/illus-chat-questions.svg', target: 'claims' },
    { label: 'Programa Pinguim', iconSrc: '/assets/icons/illus-programa-pinguim.svg', target: 'plan' },
    { label: 'Olimpipo', iconSrc: '/assets/icons/illus-olimpipo.svg', target: 'olimpipo', badge: { label: 'Edição ativa', tone: 'success' } },
  ],
  partners: [
    { eyebrow: 'Pipo + Beep Saúde', title: 'Vacinas à domicílio com desconto.', subtitle: 'Acesse o benefício com cupom PIPOSAUDE' },
  ],
});
```

### Docker integration

A new compose service so the home boots with the rest of the stack:

```yaml
pipo-cuida:
  build: ./apps/pipo-cuida
  ports:
    - "5173:5173"
  volumes:
    - ./apps/pipo-cuida/src:/app/src
    - ./apps/pipo-cuida/public:/app/public
  command: npm run dev -- --host 0.0.0.0
```

Dockerfile is a node-20 base image with `npm ci`, source copy, exposes 5173.

## Acceptance criteria

1. `docker compose up --build pipo-cuida` boots and serves `http://localhost:5173/` with the rendered home screen.
2. Visually, the home matches `.claude/design/project/HomeScreen.jsx` at 520px max content width: banner card, "Oi, como podemos te ajudar?" heading, two help tiles, five quick-link rows (with Olimpipo badge), one partner card. Section spacing is 48px, the same as the source.
3. Top bar matches `Chrome.jsx`: wordmark left, `Meus dados | Sair` right with a vertical divider, white background, 64px height.
4. Clicking any menu item navigates the URL (visible in the browser's address bar) and renders the `<EmBreve />` screen with a `← Voltar ao início` link that returns to `/`.
5. The Olimpipo row shows the `Edição ativa` pill in the success palette (`#D4F8E7` background, green dot, monospace label).
6. `npm run typecheck` and `npm run test` both pass.
7. No primitive imports from another primitive's internals; primitives consume tokens via `var(--pipo-*)` only.

## Open questions deferred to next iteration

- Real auth + `Meus dados` route.
- Replace `useHome` mock with a fetch (likely BFF since there is no React-side backend in this repo today).
- Olimpipo edition/ranking/activities screens — code already exists in `OlimpipoScreens.jsx` and will graduate into `src/components/olimpipo/` + `src/pages/olimpipo/*` when the catch-all is replaced.
- Move tokens.css into a shared package the moment a second Pipo Cuida-shaped app appears in this monorepo.

## References

- Design source: `.claude/design/project/{HomeScreen,Chrome,Primitives}.jsx`, `tokens.css`, `colors_and_type.css`.
- Conventions: `.claude/rules/nextjs-app.md` (component tiers, hook/component/lib separation, test layering, no-branching-in-tests).
- Backend architecture rule (does not apply to this frontend task but listed for completeness): `.claude/agents/tech-lead.md` § "Arquitetura hexagonal em tarefas de backend".
