# Contributing to Cloud Peek

Bug reports, documentation, accessibility improvements, tests, and focused code contributions are welcome. Read our [code of conduct](CODE_OF_CONDUCT.md). Discuss large changes in an issue before implementing them.

## Development

1. Fork the repository and clone your fork.
2. Install Node.js 22.13+ and Bun 1.3.9 (`.nvmrc` and `packageManager` pin the toolchain).
3. Run `bun install --frozen-lockfile`.
4. Create a branch from the current `master`, for example `git switch -c fix/date-format`.
5. Run `bun run ios` on macOS with Xcode, or `bun run android` with the Android SDK. The native corner-surface module requires a development build.

Connect your own Laravel Cloud organization through the app if you need live data. Tokens belong in device secure storage. Never commit credentials, private API responses, or screenshots containing secrets. Unit tests and CI need no Cloud token; live tests are optional and read-only, using `CLOUD_API_TEST_TOKEN` supplied directly to the test process.

## Project conventions

- Routes in `src/app/` are thin wrappers; behavior belongs in feature modules.
- Reuse semantic colors, typography, and controls. Support light/dark themes, accessibility labels, and reduced motion.
- Keep display formatting separate from API payloads. Preserve original values for editing.
- Add regression tests for behavior changes. For visual changes, check an actual simulator/device and attach sanitized screenshots, including relevant loading, empty, and error states.
- Change the vendored contract or generators instead of editing generated API files. Run `bun run api:types` and include the resulting files together.
- Keep `bun.lock` in sync when changing dependencies. Prefer existing dependencies and avoid unrelated reformatting.

## Before opening a pull request

Run `bun run validate` (TypeScript, ESLint, and Jest with the coverage threshold). When API generation changes, also run `bun run api:types` and inspect its output. CI verifies generation is reproducible.

Open the PR against `master`, link the related issue, describe the user-visible behavior and verification, and call out platform checks you could not run. Keep changes focused. Maintainers review contributions and squash merge them after required checks and review conversations are resolved. Do not run live writes against someone else's Cloud resources to verify a contribution.

## License and attribution

Contributions are provided under the repository's MIT license. By submitting a contribution, you confirm that you have the right to license it under those terms. Preserve existing notices and document any third-party code, assets, and their licenses in `THIRD_PARTY_NOTICES.md`.
