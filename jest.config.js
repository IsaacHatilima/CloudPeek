// Jest runs through jest-expo so Expo/React Native modules resolve the same
// way Metro resolves them. Tests live in `__tests__/` and import through the
// `@/` alias, which maps to `src/` exactly as `tsconfig.json` does.
//
// Coverage is measured on the logic modules only. The presentation layer
// (`src/app`, `src/features/*/components`, `*-screen.tsx`, `*-layout.tsx`) is
// deliberately thin and is checked by `tsc`, `expo lint`, and a simulator run
// rather than by rendering it under Jest.
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  // Live API tests have their own environment and script: see jest.live.config.js.
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/__tests__/live/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/features/cloud-resources/**/*.ts",
    "src/features/shell/*.ts",
    "!src/features/shell/index.ts",
    "src/features/scope/*.ts",
    "src/features/account/*.ts",
    "src/features/connections/*.ts",
    "!src/features/connections/secure-token-storage.ts",
    "src/features/resources/presenters.ts",
    "src/features/resources/resource-list-model.ts",
    "src/features/resources/detail/detail-model.ts",
    "src/features/resources/detail/attribute-presenter.ts",
    "src/features/resources/detail/repository.ts",
    "src/features/actions/*.ts",
    "!src/features/actions/confirm-action.ts",
    "!src/services/cloud-api/write-operations.generated.ts",
    "src/features/usage/*.ts",
    "!src/**/*.d.ts",
    "src/features/workspace/**/*.ts",
    "src/services/**/*.ts",
    "src/lib/**/*.ts",
    "src/theme/brand.ts",
    "src/theme/palettes.ts",
    "!src/**/use-*.ts",
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
