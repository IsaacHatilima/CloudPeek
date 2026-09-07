# CloudPeek navigation shell — design

**Date:** 2026-09-05 · **Status:** implemented in this pass · **Scope:** navigation shell, multi-org/env structure, side-menu information architecture. No auth, no token storage, no data fetching.

CloudPeek is a mobile monitor for [Laravel Cloud](https://cloud.laravel.com). This document is the design that the first pass was built from and doubles as the architecture reference until a dedicated `docs/ARCHITECTURE.md` exists.

## 1. Origin and what was kept

The project started as a copy of `Developer/swipe-menu-example` (Code with Beto, MIT). Three things were kept because they *are* the interaction being reused:

| Kept | Now lives at | Why |
| --- | --- | --- |
| Pan-gesture + spring + reveal interpolation hook | `src/features/shell/hooks/use-swipe-menu.ts` | The whole point of the reuse. Unchanged apart from import paths. |
| Two-layer composition (menu mounted underneath, single moving surface) | `src/features/shell/shell-layout.tsx` | Keeps the "display slides right" feel. |
| `screen-corner-surface` local Expo module | `modules/screen-corner-surface/` | Gives the moving surface the device's concentric corner radius on iOS 26, with named fallbacks elsewhere. |

Everything else from the example was template content and is gone: offerings, lessons, chats, profile modal, the "New chat" dock, CWB branding, the example icons, the Apple-blue accent. A test (`__tests__/template-cleanup.test.ts`) fails if any template identifier reappears in `src/`, `modules/`, `app.json`, `package.json`, or `README.md`.

The original MIT notice is preserved in `THIRD_PARTY_NOTICES.md` (required by the licence for the retained code).

## 2. Facts verified on 2026-09-05

Everything below was checked against live sources rather than assumed.

- **API base:** `https://cloud.laravel.com/api`, bearer token in `Authorization`, JSON:API responses (`application/vnd.api+json`) with `data`, `links`, `meta` (Laravel paginator). Source: `laravel.com/cloud/docs/api/introduction`, OpenAPI at `https://cloud.laravel.com/api-docs/api.json` (note: the `laravel.com/api-docs/api.json` URL that the docs' YAML blocks cite returns 404; the `cloud.laravel.com` host works).
- **Tokens are minted per organization** ("generate an API token from your Laravel Cloud organization settings"; a token "has full access to your organization"). There is no endpoint that lists a user's organizations. `GET /meta/organization` returns the one organization the token belongs to. **Consequence:** "the user belongs to multiple organizations" is modelled as *connected organizations*, one token each; the org switcher switches between locally registered organizations, and a future auth pass resolves each token to `{ id, name, slug }` via `/meta/organization`.
- **Environments belong to applications:** `GET /applications/{application}/environments`. Switching organization or application therefore resets the environment list.
- **Every list endpoint in the menu exists in the spec** with the exact path and `operationId` used in `src/features/cloud-resources/catalog.ts`. The attached draft config had three entries marked "pattern-inferred"; all three are confirmed (`/environments/{environment}/instances`, `/databases/clusters/{database}/snapshots`, `/websocket-servers/{websocketServer}/applications`). Two corrections to the draft: Usage's operationId is `public.usage` (not `public.usage.show`), and Edge Networks / Secrets *do* have documented list endpoints (`/edge-networks`, `/secrets`).
- **Database Restores has no list endpoint.** Only `POST /databases/clusters/{database}/restore` exists. The menu item is kept (the brief asks for it) but carries `endpoint: null` and an explanatory note; its screen says so instead of pretending.
- **Colours:** Laravel red `#FF2D20` (as specified). Cloud blue `#006AFF` is the solid brand step in Laravel's public design tokens (`--cloud-light-9` and `--cloud-dark-9` on `laravel.com/cloud`; `--background-color-brand` resolves to it). Supporting steps kept as tokens: `#005CEC` (`--cloud-light-10`, pressed/hover; also the link colour on the Cloud sign-in page) and `#83B7FF` (`--cloud-dark-11`, legible blue on dark surfaces). The dashboard itself is behind sign-in, so the tokens come from the public marketing CSS, not the authenticated app bundle. Laravel's dark-theme token `--color-laravel-red` is `#F61500`, slightly different from `#FF2D20`; the spec value wins, and both live in one file. Neutral surfaces deliberately do **not** use Laravel's `--cloud-dark-*` navy scale: after seeing the first build, the request was for industry-standard dark-mode colours, so both palettes use the platform's system greys (`#000000` / `#1C1C1E` / `#2C2C2E` dark, `#FFFFFF` / `#F2F2F7` / `#E5E5EA` light) and brand colour appears only through `primary`, `accent`, and `link`.

## 3. Architecture

```
src/
├── app/                         Expo Router routes (thin: import a screen, export default)
│   ├── _layout.tsx              GestureHandlerRootView › ThemeProvider › ShellLayout › Stack
│   ├── (tabs)/_layout.tsx       NativeTabs: index (Home) | usage | billing
│   ├── (tabs)/index.tsx         Overview
│   ├── (tabs)/usage.tsx         Usage (the same screen the menu's Usage item shows)
│   ├── (tabs)/billing.tsx       Billing (summary section of the usage report)
│   ├── account.tsx              Modal from the header's avatar button
│   ├── resources/[resource].tsx One route for every resource type in the catalog
│   └── switch/[kind].tsx        Form sheet: organization | application | environment
├── theme/                       brand.ts (named tokens) › palettes.ts › use-app-theme.ts
├── features/
│   ├── shell/                   Swipe shell: layout › surface + side menu; pure swipe-decision, menu-item-state, context-chips; hooks split into gesture, reveal styles, actions
│   ├── cloud-resources/         Menu catalog (sections › items › endpoints) + scope resolution
│   ├── workspace/               Active organization/application/environment (zustand, persisted)
│   ├── resources/               Generic resource list screen; one small component per state
│   ├── overview/                Landing screen (Home tab)
│   ├── usage/, billing/         The other two tabs
│   └── account/                 Account modal: sections as data, cards as components
├── services/cloud-api/          Request builder + client (transport works; token is always null here)
└── lib/                         file-storage (expo-file-system adapter), storage-failure
```

### 3.1 Routing: the shell wraps the Stack

The root layout renders the swipe shell *around* the Stack navigator. The menu is mounted once underneath; the Stack is the moving surface. Resource screens are ordinary stack routes, so "each menu item routes to a screen" is literally true, and the swipe interaction is available on every screen without remounting.

- The Stack's first screen is the `(tabs)` group (native bottom tabs: Home, Usage, Billing), so the tab bar lives inside the moving surface and slides aside with it. Menu press → `openResource(id)`: `push` from any tab, `replace` when already on a pushed resource, `navigate` for a resource that lives on a tab (Usage), no-op when already there. The stack is therefore at most `[tabs, resource]`; Android back returns to the tabs.
- Stack screens set `gestureEnabled: false` because the iOS swipe-back gesture and the open-menu gesture are the same motion. The menu is the app's primary navigation, so it wins.
- Switchers are `presentation: "formSheet"` routes on the same Stack (`/switch/organization` etc.). They are presented natively above the shell, so the pan gesture underneath does not interfere.
- The header (menu button, current resource title, context bar with the three switcher chips) lives in the shell, outside the Stack, and derives its title from the pathname, or from the route beneath an open switcher sheet via the root navigation state.

### 3.2 Workspace state (`useWorkspaceStore`)

One zustand store, created through `createWorkspaceStore(storage)` so tests can inject in-memory storage.

| Field | Persisted | Notes |
| --- | --- | --- |
| `organizations: OrganizationRef[]` | yes | Connected organizations. Populated by the future auth pass. |
| `applications: ApplicationRef[]` | no | Catalog for the active organization. Cleared when the organization changes. |
| `environments: EnvironmentRef[]` | no | Catalog for the active application. Cleared when the application changes. |
| `selection: { organization, application, environment }` | yes | Refs (`{ id, name, slug? }`), not just IDs, so the header can render on a cold start before anything is fetched. |

Rules (all tested): selecting a different organization resets application + environment and both dependent catalogs; re-selecting the same one keeps them; selecting a different application resets the environment; replacing the organization list with one that no longer contains the selected organization clears the selection. Every update returns new objects.

Persistence: `zustand/middleware` `persist` over `lib/file-storage` (an `expo-file-system` `File` adapter ported from a proven pattern in the author's other Expo app). Reads are synchronous, so hydration completes during store creation and the app reopens exactly where it was left, with no "empty" frame. Not the keychain: a selection is not a secret, keychain items survive uninstall, and they are unreadable while the device is locked.

### 3.3 Resource catalog and scope

`RESOURCE_MENU` is an ordered list of sections; each item is `{ id, label, icon, scope, endpoint | null, note? }`. `scope` says what must be selected before the list can be requested:

| scope | needs | path param |
| --- | --- | --- |
| `organization` | organization | — |
| `application` | + application | `application` |
| `environment` | + environment | `environment` |
| `instance` | environment + an instance id | `instance` |
| `databaseCluster` | organization + a cluster id | `database` |
| `websocketCluster` | organization + a cluster id | `websocketServer` |
| `bucket` | organization + a bucket id | `filesystem` |

`resolveScope(scope, selection, parentId?)` returns either the path params or the *first* missing requirement, and `describeMissingScope` turns that into the sentence the screen shows. The four deeper scopes need a parent picked on the screen itself (e.g. Bucket Keys needs a bucket); this pass renders the requirement and stops, because picking a parent means fetching a list.

### 3.4 Resource list screen (one component, four states)

`ResourceListScreen` for `/resources/[resource]`:

1. Unknown id → "No such resource" (validated at the route boundary).
2. `endpoint: null` → the item's note (Database Restores).
3. Scope unmet → requirement sentence + a button that opens the relevant switcher (organization/application/environment) or, for deeper scopes, explains what must be chosen.
4. Scope met → **"Cloud API not connected"** state. The request is fully described (`GET` + built path) but nothing is sent because the client has no token. No sample data anywhere.

### 3.5 Cloud API service

`createCloudApiClient({ token, baseUrl? }, fetchImpl)` builds URLs with `buildUrl`, sends `Authorization: Bearer …` and `Accept: application/vnd.api+json`, and validates the JSON:API envelope. The exported default `cloudApi` has `token: null`, so every call rejects with `CloudApiNotConnectedError` until the auth pass supplies one. The transport is implemented (and tested with a fake `fetch`) so the auth pass only has to provide a token; it is not "wired" anywhere in the UI.

## 4. Testing

- Jest via `jest-expo`, tests in `__tests__/`, `@/` alias mapped to `src/`. Pure-logic modules are the test surface: catalog integrity, path building, scope resolution, store rules + persistence round trip, storage adapter (mocked `expo-file-system`), API client (fake `fetch`), theme tokens, resource navigation rule, plus two contract tests (routes registered with the right options; no template strings remain).
- Coverage threshold 80% is enforced on the logic modules (`collectCoverageFrom` in `jest.config.js`). Presentation components are covered by `tsc --noEmit`, `expo lint`, and a simulator run; a component/E2E suite is a follow-up once there is data to drive it.

## 5. Added the same day: tabs, account, icons

- **Bottom tabs** (`NativeTabs`, Liquid Glass on iOS 26, Material 3 on Android): Home (overview), Usage, Billing. Cloud has no separate billing endpoint; Billing is the `summary` section of the same `/usage` report, and both tabs show the scope and not-connected states until a token exists.
- **Account** (`/account`, modal): avatar button top-right in the shell header. Shows "Not signed in", the connected organizations (none yet), the app version and a link to the API docs. Sign-in itself belongs to the auth pass.
- **Icons**: the supplied artwork replaces the placeholders. iOS gets light (sky) and dark (midnight) variants; Android gets the adaptive foreground rasterised from the SVG without its background on `#0EA5E9`; the menu shows the mark next to a wordmark with "Peek" in Laravel red.
- **Header title under a sheet** now resolves through the tab group's active tab as well as pushed resources (`shellTitle`).

## 6. Data layer (added later on 2026-09-05)

- **Typed client.** `createCloudApi` wraps an openapi-fetch client typed from the vendored OpenAPI document (`bun run api:types`), so all 113 operations, writes included, are available and compile-checked. Middleware adds the bearer token and JSON:API `Accept`, turns non-2xx into `CloudApiError`, and never returns the Response object (React Native's fails openapi-fetch's `instanceof` check).
- **Per-organization tokens.** `connectOrganization(token)` resolves the organization via `/meta/organization`, stores the token in the keychain (`expo-secure-store`) keyed by organization id, and registers the organization as active. `useCloudApi()` builds the client for the active organization from the vault. A dev seed connects `EXPO_PUBLIC_CLOUD_DEV_TOKEN` on first launch in `__DEV__` builds.
- **Screens.** Resource screens query through TanStack Query (`["cloud", organizationId, operationId, params, query]`), present rows per JSON:API type (`presenters.ts`), and show loading, error, empty and list states. Application and environment switchers fill from `/applications` and `/applications/{application}/environments`. Usage and Billing render rows from the `/usage` report.
- **Form-sheet layout contract.** react-native-screens (iOS 26) finds a ScrollView among a form sheet's direct subviews and sizes it to the sheet, tolerating one header sibling; a wrapper View is flattened or hides it. The switcher sheet is therefore a root ScrollView with its title, rows, and connect action inside.
- **Verified live** with a view-only key: 21 read endpoints answer; `/edge-networks` and `/secrets` are 403 for that key; environment logs require `from`/`to`, supplied as the last hour (`log-window.ts`).

## 7. Scope picker redesign (later on 2026-09-05)

The three chips and three switcher sheets read as unrelated filters, wrapped onto two lines, and repeated the selection in four places. Replaced by:

- **A breadcrumb in the header** (`features/scope/breadcrumb-model.ts`): organization initial › application › environment with a status dot, or the prompt for the first missing level ("Connect an organization", "Choose an application", "Choose an environment"). Each segment opens the sheet at its level; the row as a whole opens the deepest useful level.
- **One drill-down sheet** (`/scope?level=…`, `features/scope/scope-model.ts`): crumbs for the chosen levels above, the current level's list with status dots and a checkmark, a search field above eight entries, and "Connect an organization" as the organization level's footer. Requests for a level whose parent is unselected are pulled up to that parent. Picking descends; picking an environment dismisses.
- **Home is the environments list** of the selected application; the "Monitoring scope" card is gone because the header already says where you are. The `environments` resource therefore lives on the Home tab the way `usage` lives on its tab.

## 8. Out of scope (deliberately)

Resource detail screens, parent pickers for instance/cluster/bucket scopes, pagination past the first page, write actions in the UI, and an E2E suite.

## Addendum (2026-09-05, evening): writes and avatars

Every POST/PATCH/PUT/DELETE in the Cloud contract is reachable from the UI
without a hand-written form per operation:

- **Generated field lists.** `scripts/generate-cloud-api-operations.mjs`
  reduces each request body to flat `FieldSchema`s (kinds: string, integer,
  number, boolean, enum, string-list, json, file). Objects flatten one level;
  arrays of objects and `oneOf` configs are JSON fields with a sample.
- **Catalog by path.** `WRITE_TARGETS` names a `createPath` and an `itemPath`
  per resource. Create is the POST on the create path (the list's "+"),
  update/delete are the PATCH/PUT and DELETE on the item path, and any other
  operation under `itemPath/…` is a command of that item. A test proves every
  generated operation is claimed exactly once.
- **Screens.** Rows open `/resources/[resource]/[id]` (attributes, related
  child lists via `?parent=`, actions). Commands without input confirm with a
  native alert; anything with input opens the `/action` form sheet, which is
  prefilled from the cached list for updates and sends only changed fields.
- **Avatars.** `RowModel.avatar` / `ScopeItem.avatar` carry `avatar_url`;
  `Avatar` falls back to initials from `initialsFor` ("LW").
- **Not verified live.** The development token is view-only; writes are tested
  with a fake fetch only.
