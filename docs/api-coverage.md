# Laravel Cloud API coverage

Contract refreshed on 2026-09-18 from [Laravel Cloud OpenAPI](https://cloud.laravel.com/api-docs/api.json), using the [official API reference](https://laravel.com/cloud/docs/api/introduction).

The contract has 113 operations: 108 current operations and five deprecated database operations. Cloud Peek wires 98 current operations into its screens and forms: 38 reads and 60 writes. Local contract/transport tests verify paths, methods, path parameters, bearer headers, and operation ownership. They do not prove that live writes will succeed with a particular token or resource configuration.

## Implemented flows

- All 24 menu resources have named feature screens, including organization connections, Usage, Billing, and database restores.
- Resource lists support page pagination; environment logs support cursor pagination with the same time window. The scope picker loads all application and environment pages.
- Fifteen resource types use their documented GET item endpoint. Resources without an item endpoint search all list pages. Missing records and failed refreshes have separate states.
- Application details link to environments; environment details link to deployments, commands, instances, domains, and logs. Cluster/bucket/instance/WebSocket child lists retain their parent context.
- The action catalog assigns all 60 current write operations exactly once. Forms handle paths, queries, JSON bodies, and avatar multipart uploads. Database creation loads supported types, versions, and regions from the API.
- HTTP 401 offers reconnection. Reconnecting cancels old reads, replaces cached credentials, and clears that organization's resource queries. Network retries remain available.

## Remaining read surfaces

These endpoints are available on the typed client but do not yet have dedicated UI:

| GET path | Purpose |
| --- | --- |
| `/caches/types` | Cache configuration catalog |
| `/caches/{cache}/metrics` | Cache metrics |
| `/databases/clusters/{database}/metrics` | Database metrics |
| `/deployments/{deployment}/logs` | Deployment build/deploy logs |
| `/environments/{environment}/metrics` | Environment metrics |
| `/instances/sizes` | Instance size catalog |
| `/instances/{instance}/failed-jobs` | Failed-job listing; retry/delete forms already exist on instance details |
| `/secrets/public-key` | Public key for externally sealing secret values |
| `/websocket-applications/{websocketApplication}/metrics` | WebSocket application metrics |
| `/websocket-servers/{websocketServer}/metrics` | WebSocket cluster metrics |

The deprecated `/databases` and `/databases/{database}` operations are intentionally excluded in favor of `/databases/clusters`.

## Validation

Run `pnpm run validate` for TypeScript, lint, and tests. Read-route contract tests explicitly account for every current GET operation as either exposed or listed above. Write tests send all 60 operations through a fake transport; they never mutate Cloud resources.

Run `pnpm run test:live` with `CLOUD_API_TEST_TOKEN` supplied to the process for read-only verification. Missing credentials, missing parent resources, and HTTP 403 permissions must be reported separately from successful reads. The simulator's environment list was observed loading live data after the authentication fix; that is not evidence that every endpoint has been exercised live.

## Cleanup and UI

All remaining application source modules are reachable from Expo route entry points (including platform-specific native files). Removed three unused SVG logo alternatives, the obsolete overview wrapper, the unused client alias, and unused separator color tokens. Contracts, generators, tests, licenses, and design records remain intentional project files.

Cards use tonal backgrounds, rounded corners, and spacing without border lines. Lists now show loaded/total counts and a Load more/retry footer; details put related resources and actions before long attributes. Form choices have 44-point touch targets and long action labels wrap within their row.
