# Contributing to Cloud Peek

Bug reports, documentation, accessibility improvements, tests, and focused code contributions are welcome. Read our [code of conduct](CODE_OF_CONDUCT.md). Discuss large changes in an issue before implementing them.

## Development

1. Fork the repository and clone your fork.
2. Install Node.js 22.13+ and pnpm 12.3.4 (`npm install --global pnpm@12.3.4`; `.nvmrc` and `packageManager` pin the toolchain).
3. Run `pnpm install --frozen-lockfile`.
4. Create a branch from the current `master`, for example `git switch -c fix/date-format`.
5. Run `pnpm run ios` on macOS with Xcode, or `pnpm run android` with the Android SDK. The native corner-surface module requires a development build.

Connect your own Laravel Cloud organization through the app if you need live data. Tokens belong in device secure storage. Never commit credentials, private API responses, or screenshots containing secrets. Unit tests and CI need no Cloud token; live tests are optional and read-only, using `CLOUD_API_TEST_TOKEN` supplied directly to the test process.

## Project conventions

- Routes in `src/app/` are thin wrappers; behavior belongs in feature modules.
- Reuse semantic colors, typography, and controls. Support light/dark themes, accessibility labels, and reduced motion.
- Keep display formatting separate from API payloads. Preserve original values for editing.
- Add regression tests for behavior changes. For visual changes, check an actual simulator/device and attach sanitized screenshots, including relevant loading, empty, and error states.
- Change the vendored contract or generators instead of editing generated API files. Run `pnpm run api:types` and include the resulting files together.
- Keep `pnpm-lock.yaml` in sync when changing dependencies. Prefer existing dependencies and avoid unrelated reformatting.

## Before opening a pull request

Run `EXPO_OFFLINE=1 pnpm exec expo install --check` and `pnpm run validate` (TypeScript, ESLint, and Jest with the coverage threshold). When API generation changes, also run `pnpm run api:types` and inspect its output. CI verifies generation is reproducible.

Open the PR against `master`, link the related issue, describe the user-visible behavior and verification, and call out platform checks you could not run. Keep changes focused. Maintainers review contributions and squash merge them after required checks and review conversations are resolved. Do not run live writes against someone else's Cloud resources to verify a contribution.

## License and attribution

New contributions are provided under the Cloud Peek Source Available License 1.0 in `LICENSE`. By submitting a contribution, you confirm that you have the right to license it under those terms. This permits internal company use and noncommercial redistribution but not commercial distribution. Earlier MIT grants are unchanged. Preserve existing notices and document any third-party code, assets, and their licenses in `THIRD_PARTY_NOTICES.md`.

## Dependency maintenance

Dependabot groups compatible Expo runtime updates. Expo SDK major upgrades, React/React Native minor or major upgrades, and TypeScript major upgrades need a coordinated manual migration with toolchain and device validation. When updating Expo Router, check its Constants and Linking peer requirements as well as Expo SDK compatibility. CodeQL runs from the committed workflow on pull requests, pushes to `master`, and a weekly schedule; keep the required analysis job name stable.
