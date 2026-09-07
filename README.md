# Cloud Peek

[![CI](https://github.com/IsaacHatilima/CloudPeek/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/IsaacHatilima/CloudPeek/actions/workflows/ci.yml)
[![License: Source Available](https://img.shields.io/badge/License-Source_Available-blue.svg)](LICENSE)

Source-available community project; not affiliated with or endorsed by Laravel. Early development: see the known limitations below.

A mobile monitor for [Laravel Cloud](https://cloud.laravel.com), built with Expo Router. Connect organizations using securely stored API tokens, browse their applications and environments, review resource details and billing, and manage resources through typed action forms.

## Setup

Use Node.js 22.13+ and pnpm 12.3.4. Native builds need Xcode on macOS for iOS or the Android SDK for Android. No credentials are needed to run the unit tests.

```bash
git clone https://github.com/IsaacHatilima/CloudPeek.git
cd CloudPeek
npm install --global pnpm@12.3.4
pnpm install --frozen-lockfile
pnpm run ios       # development build in the iOS Simulator (needs Xcode)
pnpm run android   # development build on Android
```

The corner-surface native module needs a development build; Expo Go falls back to a fixed corner radius.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run lint` | `expo lint` (eslint-config-expo, with stale-closure, unused-var, and console rules promoted to errors) |
| `pnpm run test` | Jest through `jest-expo`; tests live in `__tests__/` |
| `pnpm run test:coverage` | Same, with the 80% threshold enforced on the logic modules |
| `pnpm run validate` | All of the above |
| `pnpm run test:live` | Read-only requests against the real API; needs `CLOUD_API_TEST_TOKEN` in the environment |
| `pnpm run api:types` | Regenerates `src/services/cloud-api/schema.d.ts` from `contracts/laravel-cloud-openapi.json` |

`tsconfig.json` lists `types: ["jest", "expo/types", "node"]` explicitly because TypeScript 6 no longer pulls `node_modules/@types` in on its own; Expo rewrites this file's `include` on first run, so keep it comment-free.

## How it fits together

```
src/
├── app/                      Expo Router routes: thin re-exports of feature screens
│   ├── _layout.tsx           GestureHandlerRootView › ThemeProvider › ShellLayout › Stack
│   ├── index.tsx             The first screen: the selected application's environments
│   ├── account.tsx           Account modal (avatar button, top right)
│   ├── connect.tsx           Form sheet: paste an organization's API token
│   ├── resources/[resource]  One route for every resource type in the side menu
│   └── scope.tsx             Form sheet: one drill-down for organization › application › environment
├── theme/                    brand.ts (named colour tokens) › palettes.ts › use-app-theme.ts
├── features/
│   ├── shell/                Swipe shell: layout, side menu, header, gesture hook
│   ├── scope/                The header's scope breadcrumb and the drill-down scope sheet (models are pure and tested)
│   ├── cloud-resources/      Side-menu catalog (sections › items › Cloud endpoints) and scope rules
│   ├── workspace/            Active organization/application/environment (zustand, persisted)
│   ├── resources/            The generic resource screen and its state views
│   └── overview/, usage/, billing/, account/   The first screen, the two report screens, and the account modal
├── services/cloud-api/       Typed openapi-fetch client for every Cloud operation, plus list/get helpers
├── features/connections/     Per-organization tokens (keychain), the connect flow
└── lib/                      expo-file-system storage adapter for zustand persist
```

- **The shell wraps the Stack.** The side menu is mounted once underneath a single moving surface; the Stack navigator is that surface, and its first screen is the selected application's environments. There is no bottom tab bar: every screen has the same header and menu, and Usage and Billing are side-menu items like everything else. Menu items push (from the first screen) or replace (between pushed resources), so the stack stays shallow; an item's detail pushes over its list and the header's menu button becomes a back button there. Swipe-back on the Stack is disabled because it is the same motion as opening the menu.
- **Workspace state** (`useWorkspaceStore`) holds the connected organizations, the catalogs for the active organization and application, and the selection. Switching organization resets application and environment; switching application resets environment. The selection and the organization list persist to the document directory, so the app reopens where it was left.
- **Scope is one line and one sheet.** The header shows `organization initial › application › environment` (with the environment's status dot) or, while a level is missing, the prompt for it. Tapping it opens the scope sheet at that level; picking an organization or application descends, picking an environment closes it. Levels with more than eight entries get a search field, and the organization level ends with "Connect an organization". The menu's Organization item lists the connected organizations (tap to switch) with a floating connect button (`src/components/floating-action-button.tsx`, accent-tinted Liquid Glass on iOS 26).
- **The side menu** is data-driven from `src/features/cloud-resources/catalog.ts`. Each item names the Cloud endpoint it will list from and the scope it needs (`organization`, `application`, `environment`, or a parent such as an instance or bucket). Items whose scope is not yet selected are dimmed and say what to select.
- **Colours** are named tokens in `src/theme/brand.ts`: `laravelRed` (`#FF2D20`) and `cloudBlue` (`#006AFF`, Laravel's public `--cloud-*-9` token), plus the pressed and on-dark steps. Neutral surfaces in `src/theme/palettes.ts` separate the canvas, cards, and controls in light and dark mode. Components read semantic palette keys, never hex values.

## Laravel Cloud API facts the shell relies on

Verified against the docs and the OpenAPI document (`https://cloud.laravel.com/api-docs/api.json`) on 2026-09-05:

- Base URL `https://cloud.laravel.com/api`, `Authorization: Bearer <token>`, JSON:API responses (`data`, `links`, `meta`).
- API tokens are created per organization and there is no endpoint listing a user's organizations. Cloud Peek therefore models "connected organizations", one token each; `GET /meta/organization` resolves a token to its organization.
- Environments belong to applications: `GET /applications/{application}/environments`.
- Database Restores has no list endpoint (only `POST /databases/clusters/{database}/restore`). The menu item explains this instead of listing.

## Connecting an organization

Tokens are minted per organization in Cloud's organization settings (API tokens). In the app, open the organization switcher and tap **Connect an organization**, paste the token, and Cloud Peek asks `GET /meta/organization` which organization it belongs to, stores the token in the device keychain (`expo-secure-store`) under that organization's id, and selects it. Every screen then reads with that organization's token; switching organization switches token.

Development and production use the same connection flow and secure token storage. No API token is read from `.env.local` or bundled into the app. For optional live CLI tests, supply `CLOUD_API_TEST_TOKEN` directly to the test process.

The last resource screen (including item and parent context) is saved alongside its workspace scope and restored on a normal relaunch. Incoming links take precedence; sheets and action forms are never restored.

## The API layer

- `contracts/laravel-cloud-openapi.json` is the vendored OpenAPI document; `pnpm run api:types` turns it into `schema.d.ts` (openapi-typescript), after sanitising three quirks in the document (empty property names, `null` entries in `required`, and discriminator mappings to schemas that do not exist).
- `createCloudApi({ token })` returns `{ client, list, get }`. `client` is an openapi-fetch instance typed for all 113 operations, writes included, e.g. `api.client.POST("/environments/{environment}/deployments", { params: { path: { environment } }, body })`. `list`/`get` are what the catalog-driven screens use, with the JSON:API envelope validated.
- Reads are verified live by `pnpm run test:live` with a view-only token. With the test key used on 2026-09-05, 21 read endpoints answered; `/edge-networks` and `/secrets` returned 403 for that key (permission-scoped tokens), and environment logs require a `from`/`to` window, which the catalog supplies as the last hour.
- Applications have no status of their own, so the applications list asks for `include=environments` and shows a status derived from them (`running`, `1/2 running`, or the environments' state), with the same coloured dot the environment and deployment lists use.
- Writes are typed and exposed through action forms. Unit tests use a fake fetch; live write operations have not been verified.

## Writes: create, update, delete, and commands

Every non-GET operation in Cloud's OpenAPI document (60 of them, the
deprecated "Databases (Legacy)" routes excluded) has a screen:

- `scripts/generate-cloud-api-operations.mjs` reduces each request body to a
  flat field list (`src/services/cloud-api/write-operations.generated.ts`,
  regenerated by `pnpm run api:types`). Nested objects flatten one level
  (`config.queue`); arrays of objects and `oneOf` configs become a JSON field
  with a sample document; the avatar upload is the one multipart body.
- `src/features/actions/action-catalog.ts` assigns operations to side-menu
  resources from two hand-written paths per resource (`createPath`,
  `itemPath`): the POST on the create path is the "+" button on that list, the
  PATCH/PUT and DELETE on the item path are Update and Delete on the item's
  detail screen, and anything else under the item path (start, stop, verify,
  pause, avatar…) is a command there. A test checks every generated operation
  lands in exactly one place.
- Tapping a row opens `/resources/[resource]/[id]`: the item's attributes,
  related lists (a cluster's databases, snapshots, and restore; an instance's
  background processes; a bucket's keys; a WebSocket cluster's applications),
  and its actions. Commands that need nothing (deploy, stop, verify, delete)
  confirm with a native alert; anything with a body, a query input, or a path
  id the scope cannot fill (a failed job's id) opens the `/action` form sheet.
- Forms validate against the contract (required, enum, ranges, lengths,
  patterns, JSON) and send only what changed on an update; a cleared nullable
  field is sent as `null`. Every write invalidates the organization's cached
  reads on success.
- Application rows, the scope sheet, and the detail header show the
  application's `avatar_url`, or its initials ("LW" for landeni-website) when
  Cloud has none.

Writes are covered by unit tests with a fake fetch only. Previous live checks used
a view-only token; no write was sent to Laravel Cloud during those checks.

## What is still open

- Sign-in beyond pasting a token (no OAuth exists for Cloud's API).
- Pagination past the first page (an item past it shows "Not found" on its detail screen).
- Writes have not been verified against Laravel Cloud with a write-enabled token.
- Arrays of objects (environment variables, bucket attachments, a database's `config`) are edited as JSON text rather than as structured rows.
- The account screen lists connected organizations; disconnecting one is not exposed in the UI yet.
- Bundle identifier `com.cloudpeek.app` is a placeholder.

The swipe interaction was adapted from an open-source Expo example; see `THIRD_PARTY_NOTICES.md`. The design record is in `docs/superpowers/specs/`.

- **Console design** uses a shared type scale (`src/theme/design.ts`), borderless surfaces, readable status badges, and consistent press feedback. Resource lists filter the loaded page by name, metadata, or status; counts describe only those loaded results. Initial loads use skeleton cards, while failed refreshes keep available results visible with a retry. The welcome and connection screens explain secure device storage without requiring environment tokens. Motion stays on the UI thread and respects the system Reduce Motion preference.

Resource details format nested settings as labeled groups and mask environment-variable values. Repository metadata includes a browser link and default branch. Display timestamps use the supplied calendar date and clock time without timezone conversion, timezone labels, or fractional seconds; API requests and form values retain the original data.

## Contributing and community

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, validation, and pull requests, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards. Use [issues](https://github.com/IsaacHatilima/CloudPeek/issues) for bugs and feature requests and [discussions](https://github.com/IsaacHatilima/CloudPeek/discussions) for questions. Report vulnerabilities privately using [SECURITY.md](SECURITY.md).

## License

Cloud Peek Source Available License 1.0 — see [LICENSE](LICENSE).

- Personal use and internal use by teams and companies, including for-profit companies, are allowed.
- Free, noncommercial redistribution and community forks are allowed, with the required notices.
- Resale, paid distribution, bundling in paid offerings, and paid hosted access to Cloud Peek are not permitted without separate permission. Using Cloud Peek internally to operate your own paid products or services is allowed.

This is source-available software, not OSI-approved open-source software. The license text controls; this summary is not a substitute for it. Versions through commit `a5f76af` remain available under their original [MIT license](licenses/CloudPeek-MIT-legacy.txt); the new terms do not revoke those grants. Third-party copyrights and licenses remain in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Laravel and other third-party names and marks belong to their respective owners.
