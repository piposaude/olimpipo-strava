# Next.js App

## Components

### Three-tier structure

**Tier 1 — `packages/ui/src/`** — cross-app primitives shared by every Next.js app (Button, Input, Modal, Table, Badge, StatCard, PageHeader, Card, Tag, StatusDot, Avatar, Segmented, Toast, Icon, etc.)
- Pure presentation, no business logic, no API calls
- Accept only styling/variant props; use `forwardRef` when wrapping native elements
- Imported as `@hub/ui`
- **No unit tests required**

**Tier 2 — `apps/<app>/src/components/ui/`** — app-local presentational shells (`PageShell`, `StatGrid`, `SectionCard`, skeleton primitives, etc.)
- Compose Tier 1 primitives plus app-specific layout decisions (page padding, grid columns, section header borders)
- Live in the app because they encode app-specific layout, not because they belong in the design system yet
- A shell graduates to `packages/ui` only when a second app needs it — never speculatively
- Pure presentation, no business logic, no API calls, no `'use client'` unless they use a browser API
- **No unit tests required**

**Tier 3 — `apps/<app>/src/components/<feature>/`** — feature components (one folder per domain: `professionals/`, `agenda/`, `dashboard/`, …)
- Marked `'use client'` when they use hooks or browser APIs
- Compose Tier 1 primitives and Tier 2 shells; never inline-duplicate the layout primitives
- Receive data via props from a per-feature hook (see "Per-feature hooks" below) — they do **not** call BFF endpoints directly, do **not** read Zustand directly, and do **not** own derived state
- Use `react-hook-form` + Zod for forms
- May manage purely local UI state (`isSubmitting`, `serverError`, hover/focus toggles)
- **Unit tests required** (see Component tests section below)

## Component primitives

When a `packages/ui` primitive exists, **use it instead of the native HTML element**. Reaching for `<button>`, `<input>`, `<table>`, `<tr>`, `<td>`, etc. in app code is a code smell — the primitive carries the design tokens, accessibility defaults, and consistency that custom markup loses.

Current primitives and what they replace:

| Primitive | Replaces |
|---|---|
| `Button` (variants: `primary`, `secondary`, `ghost`, `surface`, `danger`, `outline`, `icon`) | `<button>` |
| `InputField` (variants: `default`, `search` × sizes `sm`, `md`) | `<input>` |
| `Checkbox` | `<input type="checkbox">` |
| `SelectField` | `<select>` |
| `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeader`, `TableCell` | `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` |
| `Modal`, `Toast`, `Badge`, `StatCard`, `Card`, `PageHeader`, `Tag`, `StatusDot`, `Avatar`, `Segmented`, `Icon` | corresponding ad-hoc markup |

### When the primitive does not fit

If a use case does not fit the primitive's API, **extend the primitive in `packages/ui`** instead of falling back to native markup in app code. Add a variant (`Button variant="icon"` for icon-only buttons, `InputField variant="search"` for the header/toolbar search bars), an optional prop, or — for `Table*` — pass `style` to override individual values (the primitives already merge consumer `style` after their defaults).

Going native is justified only when the shape genuinely cannot be expressed by the primitive — for example an inline `<input>` that lives inside a custom stepper container with bespoke width and transparent borders. These are rare; document the reason in a one-line comment when you do it.

### Styling

- **Prefer CSS modules over inline `<style>` blocks.** A component-local `*.module.css` file beats `<style>{`...`}</style>` injected at the top of a component (which the login page used before refactor). The CSS module composes with global tokens (`var(--ic-bg)`, `var(--ic-primary)`, etc. from `@hub/ui/tokens.css`) and survives prettier formatting.
- **For state-based styling, prefer class toggles to conditional inline-style objects.** A boolean `isActive` should switch a `.navLinkActive` class on, not rebuild a 15-property style object on every render. See `apps/web/src/components/sidebar/nav-link.module.css` for the canonical pattern.
- **Inline `style={...}` is fine for one-off layout** (positioning a single element, a `gap`, a `maxWidth`) — the rule is about repeated/stateful styling, not about banning the prop.

## Navigation

Use Next.js `<Link>` for any in-app navigation. **Never** use `<button onClick={() => router.push(href)}>` to navigate — it is a button pretending to be a link, and it loses:

- Cmd/Ctrl-click and middle-click "open in new tab"
- Right-click → "Open in new tab"
- Next.js automatic prefetching on hover/viewport
- Implicit `role="link"` and the `<a>` semantics screen readers expect

`<Link>` renders a real `<a>`. Style it like a button via a CSS module class if you need a button-shaped link (see `nav-link.tsx` / `nav-link.module.css`). Add `aria-current="page"` when the link matches the current route so screen readers announce the active item.

`router.push()` is still the right tool for **post-action navigation** — e.g. redirecting after a successful login submit, where the navigation is the consequence of an async result, not a user clicking on something link-shaped.

## Per-feature hooks

When a `'use client'` page does any async work (BFF call via `fetch('/api/...')`, the `lib/http-client.ts` wrapper, a Zustand selector for non-trivial state, or any data-derived calculation that isn't a one-line render expression), the fetch + state + derived calcs live in a per-feature hook at `apps/<app>/src/hooks/use-<feature>.ts`. The `page.tsx` becomes **pure composition**: it imports the hook, the shells, and the feature components, and renders them.

What goes in the hook:
- Calls to `/api/...` BFF routes (or `lib/http-client.ts` for authenticated XHRs)
- React state for the feature (`useState`, `useReducer`, debounced inputs, pagination cursors)
- Reads from `useAuthStore` / `useCurrentUser`
- Derived calculations (`appointmentsToday`, `pendingCommission`, totals, formatted labels)
- Feature-local maps that are part of the data model (status → label, status → tone) — **unless** they are the responsibility of a single row component, in which case they live next to that component

What does NOT go in the hook:
- JSX
- Layout decisions (grid templates, padding, gaps) — that's a shell's job
- Imports from `@hub/ui` — the hook returns plain data, not React nodes

The rule applies as soon as **any** async or non-trivial state appears in the page. A page that renders only mock-data constants from a sibling file may keep its derived expressions inline; the moment it reads `useCurrentUser` or fetches anything, extract a hook.

Reference patterns: `apps/web/src/hooks/use-professionals.ts`, `apps/web/src/hooks/use-agenda.ts`.

See **Component / hook / lib separation** below for the full rule set, including where transforms and formatters belong.

## Component / hook / lib separation

### Principle

**Hooks orchestrate** (call `bff()`, call lib transformers, manage state, expose handlers). **Lib does heavy lifting** (transforms, validators, formatters, lookup tables). **Components are pure JSX composition** (markup, layout, trivial inline event handlers, subcomponents).

### Four rules

**Rule 1 — Components must not call APIs directly.** All `bff()` and `fetch('/api/...')` calls live in per-feature hooks at `apps/<app>/src/hooks/use-<feature>.ts`.

> **Carve-out:** an unauthenticated public endpoint called by a single form (e.g. `login-form.tsx` calling `/api/auth/login`) may stay inline. Extract a hook the moment a second component needs to share state, errors, or refresh logic.

**Rule 2 — Lib modules own data transformation. Schemas live in `/schemas`. Data types live in `/models`.** Anything that transforms a fetch response, formats values for display, or converts between API shape and UI shape lives in `apps/<app>/src/lib/<feature>/` (or `apps/<app>/src/lib/format/` for cross-cutting formatters). Lib modules are pure: no React imports, no hooks, no JSX. They export functions and constants.

Zod schemas (form validation, response validation) live in `apps/<app>/src/schemas/<name>.schema.ts` — flat, one file per schema, suffixed `.schema.ts`. Schemas are imported by both forms (`useZodForm(schema)`) and any lib validators that need them.

**All non-trivial data types — domain entities (`Customer`, `Service`, `Professional`, `Appointment`, `Membership`, `User`), API page envelopes (`CustomersPage`, `ServicesPage`), and UI-row shapes derived from those entities (`ProfessionalRow`, `ProfessionalMock`, `MockAppointment`) — live in `apps/<app>/src/schemas/`'s sibling: `apps/<app>/src/models/<entity>.ts`.** One file per entity, named after the entity (singular: `customer.ts`, not `customers.ts`). The app owns its own data type definitions; do not inline entity shapes in BFF routes, hooks, components, or mock-data files. Form-input types (`CreateCustomerFormData`) stay in `/schemas` because they're inferred from the Zod schema there.

> **What does NOT go in `/models`:** hook contracts (`UseCustomersResult`, `UseProfessionalsOptions`), component prop interfaces, store-internal state (`AuthState`), formatter output types (`RelativeDate`), and module-internal aliases. These stay co-located with the code that defines them.

**Rule 3 — Inside components, the only functions allowed are functions that return another component** (subcomponents, render helpers). No data-massaging helpers, no formatters, no event-handler factories.

> **Carve-out:** trivial inline event handlers like `onClick={() => setOpen(true)}` are fine — the rule targets named functions and multi-line lambdas that do data work. Status-label maps and similar lookup tables are data, not JSX, and move to lib.
>
> **Stays in the component:** `useZodForm(schema)` wiring, `useWatch` + `safeParse` `isValid` derivations, local UI state (`useState` for hover, open/close, focus). These are JSX-side glue, not data work.

**Rule 4 — Fetch responses come back in the shape the component expects.** The transform runs inside the per-feature hook, after `bff()` returns and before storing in state. Components consume already-shaped data; never `.map()` raw API rows into UI rows inside JSX.

### Layout

```
apps/<app>/src/
├── models/                        # all domain data types, flat (one file per entity)
│   ├── customer.ts                # Customer, CustomerMembership, CustomersPage, CustomerStatus
│   ├── service.ts
│   ├── professional.ts            # entity + UI-shape (ProfessionalRow, ProfessionalMock)
│   ├── appointment.ts
│   ├── membership.ts
│   ├── user.ts                    # CurrentUser, UserRole
│   └── dashboard.ts
├── schemas/                       # all Zod schemas, flat
│   ├── login.schema.ts
│   ├── customer-form.schema.ts
│   └── professional-form.schema.ts
└── lib/
    ├── http-client.ts             # bff() wrapper
    ├── format/                    # cross-cutting formatters
    │   ├── currency.ts
    │   └── date.ts
    └── <feature>/                 # mirrors hooks/use-<feature>.ts and components/<feature>/
        ├── transformers.ts        # API-shape → UI-shape mappers (functions only)
        └── status-maps.ts         # lookup tables (status → label, status → tone)
```

### Before / after — extracted helper

```ts
// Before — formatter inside the component
function ProfessionalDrawer({ professional }: Props) {
  function brl0(n: number) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return <span>{brl0(professional.mock.grossTotal30)}</span>;
}

// After — formatter in lib, component consumes it
import { formatBRL0 } from '@/lib/format/currency';
function ProfessionalDrawer({ professional }: Props) {
  return <span>{formatBRL0(professional.mock.grossTotal30)}</span>;
}
```

### Before / after — fetch transform

```ts
// Before — hook returns raw rows; component would .map() at render time
useEffect(() => {
  bff(url).then(r => r.json()).then((json) => setRows(json.data));
}, []);

// After — hook owns the transform; component consumes UI-shape
import { toProfessionalRow } from '@/lib/professionals/transformers';
useEffect(() => {
  bff(url)
    .then(r => r.json())
    .then((json: ProfessionalsPage) => setRows((json.data ?? []).map(toProfessionalRow)));
}, []);
```

### Before / after — form schema

```ts
// Before — schema inlined in form component
const schema = z.object({ name: z.string().min(2), email: z.string().email() });
export function CreateCustomerForm() { const methods = useZodForm(schema); /* ... */ }

// After — schema in /schemas, wiring stays in component
import { customerFormSchema } from '@/schemas/customer-form.schema';
export function CreateCustomerForm() { const methods = useZodForm(customerFormSchema); /* ... */ }
```

### Test isolation per layer

Each layer owns its own tests, scoped to its own responsibility. **A failure in one layer must not break tests in another layer.** This is what enables refactoring with confidence.

| Layer | Source | Test path | What to assert | What NOT to assert |
|---|---|---|---|---|
| **lib** | `src/lib/<feature>/*.ts`, `src/lib/format/*.ts` | `tests/lib/<feature>/<file>.spec.ts` | Pure-function input → output. No React. | Hook orchestration, component rendering. |
| **hook** | `src/hooks/use-<feature>.ts` | `tests/hooks/use-<feature>.spec.ts` | State transitions, fetch wiring (mock `bff`), error handling, derived values. Use `renderHook` from `@testing-library/react`. | Internal lib transformer logic — assume it returns what its own tests prove it returns. |
| **component** | `src/components/**/*.tsx` | `tests/components/**/*.spec.tsx` | Rendering, user interaction, conditional UI, accessibility. Pass already-shaped data via props or via a mocked hook. | Transformer math, schema validation, hook fetch logic — assume the (mocked) hook returned the right data. |
| **schema** | `src/schemas/*.schema.ts` | `tests/schemas/<name>.spec.ts` | Optional. Add when the schema has non-trivial refinements (regex, transforms, conditional logic). Trivial `z.string().email()` schemas are exercised through the form component test that drives invalid input. | n/a — when the schema is trivial, skip the dedicated test entirely. |
| **BFF route** | `src/app/api/**/route.ts` | `tests/app/api/**/route.spec.ts` | Status forwarding, cookie behavior, payload shaping. `@jest-environment node`. Mock upstream `fetch`. | Hook or component behavior. |
| **models** | `src/models/*.ts` | — | **No tests.** Types only, no runtime. | n/a |

**Cross-layer leakage to avoid:**
- A component test calling a transformer directly to assert on its result. If you need a fixture, *use* the transformer to build the fixture — don't *assert* on its output. The lib test owns those assertions.
- A hook test asserting on the shape of a transformer's return. The hook test asserts that the hook called the transformer with the right input and stored what came back; it does not re-verify the transform.
- A test file misfiled under the wrong layer (e.g. lib tests living under `tests/hooks/`). When you move code between layers, move the test with it.

**Fixture imports vs logic-under-test imports:** importing `mockProfessionalContact` from a component test to construct a `ProfessionalRow` fixture is fine. Importing it to assert *what it produces* belongs in the lib test. The line is whether the test would still pass if the imported function's internal logic changed but its return type did not.

## Loading states

**Every dashboard page must ship with a sibling `loading.tsx`.** Use the Next.js `loading.tsx` file convention to render a route-level skeleton during navigation and Suspense waits. Place `loading.tsx` next to the matching `page.tsx`. Adding a new page without its `loading.tsx` is a missing-file bug — treat it as you would treat shipping a component without its required test.

Rules:
- **Every `app/(dashboard)/<route>/page.tsx` MUST have an adjacent `loading.tsx`.** The only carve-out is a page that renders zero hooks and zero async work — i.e. pure static constants only. The moment the page imports `useCurrentUser`, a `use-<feature>` hook, or any other client-side fetcher, the `loading.tsx` is mandatory. Code review and PR templates should call this out explicitly.
- The skeleton **renders the same shell composition as the real page** — `PageShell` + `PageHeaderSkeleton` + `StatGridSkeleton` + `SectionCardSkeleton` (with N row skeletons matching the average list height). The user should perceive the layout as "settling," not "popping in."
- Never use a plain spinner or "Carregando..." text at the route level. Spinners are reserved for inline async actions (button submit, modal confirm).
- Skeletons are Tier 2 components — pure presentation, **no unit tests required**.
- Do not duplicate skeleton CSS. Build composite skeletons (`SectionCardSkeleton`, `StatGridSkeleton`) on top of the base `Skeleton` primitive in `apps/<app>/src/components/ui/skeleton.tsx`.
- Match the skeleton's `StatGridSkeleton cards={N}` and `SectionCardSkeleton rows={N}` props to the real page's stat-card count and average list length. The skeleton lying about the layout is worse than no skeleton.

Reference implementations (canonical, copy-paste shape for new pages):
- `apps/web/src/app/(dashboard)/profissionais/loading.tsx` — 4 stat cards (default), 8 row skeletons
- `apps/web/src/app/(dashboard)/clientes/loading.tsx` — 3 stat cards, 10 row skeletons
- `apps/web/src/app/(dashboard)/servicos/loading.tsx` — 4 stat cards (default), 8 row skeletons

### `loading.tsx` is not enough — gate the page on `isInitialLoading`

Next.js shows `loading.tsx` only during server-side navigation/Suspense waits. Once the client-rendered page mounts, the route-level skeleton vanishes — even though `useCurrentUser` and the per-feature data hook are still in flight. Without an in-page guard, the user sees an empty layout for ~100–800ms while data loads, with stat cards and tables flashing zeroed values before snapping to the real numbers.

**Rule:** every per-feature data hook (`use-customers`, `use-services`, `use-professionals`, …) MUST expose an `isInitialLoading: boolean` flag. The flag is `true` from mount until the first fetch resolves (or until `establishmentId` becomes available and the first fetch completes). It does NOT flip back to `true` for subsequent refetches — those are signaled by `isLoading`, which the page can show inline (e.g. on the table) without unmounting.

The page guards rendering on **both** flags and renders the same skeleton composition as `loading.tsx` while either is true:

```tsx
'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useServices } from '@/hooks/use-services';
import { PageShell } from '@/components/ui/page-shell';
import { PageHeaderSkeleton } from '@/components/ui/page-header-skeleton';
import { StatGridSkeleton } from '@/components/ui/stat-grid-skeleton';
import { SectionCardSkeleton } from '@/components/ui/section-card-skeleton';

export default function ServicosPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { services, isInitialLoading, /* ... */ } = useServices({
    establishmentId: user?.establishmentId,
  });

  if (userLoading || isInitialLoading) {
    return (
      <PageShell>
        <PageHeaderSkeleton />
        <StatGridSkeleton />
        <SectionCardSkeleton rows={8} />
      </PageShell>
    );
  }

  return (
    <PageShell>{/* real content */}</PageShell>
  );
}
```

**Forbidden:**
- `if (userLoading) return <div>Carregando...</div>` — text spinners are banned at the route level (see "Loading states" above) and they leave data-loading invisible.
- Gating only on `userLoading` — the page renders empty stats during the data hook's first fetch.
- Flipping `isInitialLoading` back to `true` on user-driven refetches (filters, search, pagination). Those are `isLoading`, scoped to the table/list inline.

**Hook implementation pattern:** track a `hasLoadedOnce` boolean in `useState`, flip it to `true` in `.finally()` of the first successful fetch, and derive `isInitialLoading: !establishmentId || !hasLoadedOnce` in the return value.

## HTTP client

The custom fetch wrapper lives at `lib/http-client.ts` and exports a single function `bff(path, options?)`. Use it for authenticated calls from client components:

- **Strict `/api/*` enforcement**: `bff()` throws `http-client: only BFF paths (/api/*) are allowed` for any path that does not start with `/api/`. There is no fallback to a backend URL.
- Automatically attaches `Authorization: Bearer {token}` from the Zustand store.
- Intercepts `401` responses, calls `/api/auth/refresh`, then retries the original request.
- Queues concurrent requests during token refresh to prevent multiple refresh calls.
- Sets `credentials: 'include'`.

Browser code never calls the NestJS API directly. Two consequences:

1. **`bff()` is the only client-side path to authenticated endpoints.** Public BFF routes (login) may use plain `fetch('/api/...')` since they do not need an access token.
2. **The browser bundle must not know the backend URL.** `clientEnv` does not export `NEXT_PUBLIC_API_URL`; only `serverEnv.API_URL` (used by BFF routes) exists. Any new client-readable env var must be added to `client-env.ts`'s Zod schema and consumed via `clientEnv`.

When mocking `bff` in tests, the import path and key are `'@/lib/http-client'` and `bff`:

```ts
jest.mock('@/lib/http-client', () => ({
  bff: (...args: unknown[]) => mockBff(...args),
}));
```

## BFF (API routes)

API routes live at `app/api/`. They act as a thin proxy between the browser and the NestJS backend.

Rules:
- Forward requests to `serverEnv.API_URL` (never hardcode the backend URL)
- Set httpOnly cookies (`refreshToken`, `userRole`) — never expose these to client JS
- Return `access_token` in the response body for the client to store in Zustand
- Decode JWT with `btoa`/`atob` to extract claims (e.g. `role`) without a JWT library
- Forward error status and body from the backend unchanged
- Catch network failures and return a `500`

```ts
// app/api/auth/login/route.ts pattern
import { serverEnv } from '@/config/server-env';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${serverEnv.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const response = NextResponse.json({ access_token: data.access_token });
  response.cookies.set('refreshToken', data.refresh_token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
    secure: serverEnv.isProd,
  });
  return response;
}
```

### Env access

Never reference `process.env` outside `src/config/server-env.ts` or `src/config/client-env.ts`. Server-only code (BFF routes, middleware, server components) imports `serverEnv`; browser code imports `clientEnv`. Both modules validate with Zod and crash fast on missing/malformed values. The ESLint rule `no-restricted-syntax` enforces this — adding a new `process.env.X` reference outside the two config files produces a lint error.

## Store

Auth state is managed with Zustand + `persist` middleware (`store/auth.store.ts`):
- Stores `accessToken`, `userId`, `role`
- `setToken(token)` parses the JWT to extract claims
- `clearToken()` wipes state on logout
- Persisted to `localStorage` under key `auth-storage`

Access in components via `useAuthStore(selector)`. Access outside React (e.g. http-client) via `useAuthStore.getState()`.

## Middleware

`middleware.ts` runs on every request to protected routes:
- Checks for `refreshToken` cookie to determine session presence
- Reads `userRole` cookie for role-based redirects
- Redirects unauthenticated users to `/login`
- Redirects logged-in users away from `/login`
- Restricts admin-only routes (`/users`, `/pairs`) to the `admin` role

---

## Unit tests

### Component tests (`tests/unit/components/`)

Use React Testing Library. Mock all external dependencies at the top of the file.

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyComponent } from '@/components/my-component';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn((cb) => cb({ setToken: jest.fn() })),
}));

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('MyComponent', () => {
  it('should render ...', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should call fetch and redirect on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'token' }),
    });

    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('should show error message on failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    });

    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/error message/i),
    );
  });
});
```

### BFF route tests (`tests/unit/app/api/`)

Add `@jest-environment node` at the top. Import and call the exported handler directly.

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/auth/login/route';

function makeJwt(payload: object) {
  return `header.${btoa(JSON.stringify(payload))}.sig`;
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_URL = 'http://localhost:3001';
  });

  it('should return access_token and set cookies on success', async () => {
    const accessToken = makeJwt({ sub: 'user-1', role: 'admin' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ access_token: accessToken, refresh_token: 'r-xyz' }),
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ access_token: accessToken });
    expect(response.cookies.get('refreshToken')).toMatchObject({ value: 'r-xyz' });
    expect(response.cookies.get('userRole')).toMatchObject({ value: 'admin' });
  });

  it('should forward error status from backend', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ message: 'Invalid credentials' }),
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@x.com', password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({ message: 'Invalid credentials' });
  });
});
```

### Mocking rules

| Target | Approach |
|--------|----------|
| `next/navigation` | `jest.mock('next/navigation', () => ({ useRouter: jest.fn() }))` |
| Zustand store | `jest.mock('@/store/auth.store', () => ({ useAuthStore: jest.fn((cb) => cb({ ... })) }))` |
| `fetch` | `global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => data })` |
| Environment variables | Set directly: `process.env.API_URL = '...'` in `beforeEach` |

- Always call `jest.clearAllMocks()` in `beforeEach`
- Use `screen.getByRole` over `getByTestId` — prefer accessible queries
- Use `waitFor` for async assertions after user events
- Use `toMatchObject` for response body and cookie assertions — only assert the fields relevant to the test, not every property

### Test structure: no branching in tests, helpers, or mocks

Tests, test helpers, and mocks must be straight-line code. Do not use `if`/`else`, `switch`, or branching ternaries inside a test body, a helper, or a mock implementation.

Branching turns the test into a mini-program — readers have to mentally execute paths to know what is being asserted, and a shared mock that branches on input becomes a second source of truth competing with the production code.

How to apply:

- **Mocks that vary per test:** write the mock in the test (or use `mockResolvedValueOnce` / `mockReturnValueOnce` per `it`). Do not write one shared mock that branches on its arguments.
- **Helpers / fixtures:** no "mode" or "shape" flags. If two tests need different shapes, write two helpers (`makeProfessionalUser()`, `makeOwnerUser()`) — not one `makeUser({ role })` whose body branches.
- **Test bodies:** no `if (condition) expect(...)`. Each `it` asserts the one path it was written for; cover other paths in their own `it`.

```ts
// ❌ branching mock — what does this test actually assert?
jest.mock('@/lib/http-client', () => ({
  bff: jest.fn(async (path) => {
    if (path.includes('/professionals')) return { ok: true, json: async () => ({ data: [] }) };
    if (path.includes('/services')) return { ok: false, status: 500 };
    return { ok: true, json: async () => ({}) };
  }),
}));

// ✅ direct, per-test mocks
const mockBff = jest.fn();
jest.mock('@/lib/http-client', () => ({ bff: (...args: unknown[]) => mockBff(...args) }));

it('should render professionals', async () => {
  mockBff.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
  // ...
});

it('should show error on 500', async () => {
  mockBff.mockResolvedValueOnce({ ok: false, status: 500 });
  // ...
});
```

```ts
// ❌ helper with a flag that branches
function makeUser(role: 'OWNER' | 'PROFESSIONAL') {
  return role === 'OWNER'
    ? { id: 'u1', role, professionalMembershipId: null }
    : { id: 'u1', role, professionalMembershipId: 'pm1' };
}

// ✅ one helper per shape
function makeOwnerUser() {
  return { id: randomUUID(), role: 'OWNER' as const, professionalMembershipId: null };
}
function makeProfessionalUser() {
  return { id: randomUUID(), role: 'PROFESSIONAL' as const, professionalMembershipId: randomUUID() };
}
```

### ID values

Generate every id used in a frontend test (entity ids, JWT `sub`, props that the component treats as a UUID) with `randomUUID()` from the Node `crypto` module:

```ts
import { randomUUID } from 'crypto';

it('should pass establishmentId to the hook', () => {
  const establishmentId = randomUUID();
  render(<ProfessionalsPage establishmentId={establishmentId} />);
  expect(mockUseProfessionals).toHaveBeenCalledWith({ establishmentId });
});
```

- Never hardcode UUID literals (`'00000000-0000-0000-0000-000000000001'`) or fake-id strings (`'u1'`, `'pm-1'`, `'estab-1'`) in tests, helpers, or mock fixtures.
- When the same id must appear in multiple places within one test, bind it to a `const` once and reuse.
- When several tests in a file share an id, declare a module-level `const FOO_ID = randomUUID();` instead of repeating literals.

Non-id strings (emails, slugs, names, role labels) stay as plain literals — the rule is specifically about ids.