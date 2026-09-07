// Live read tests against Laravel Cloud (`bun run test:live`, needs
// CLOUD_API_TEST_TOKEN). They deliberately skip the jest-expo preset: React
// Native's Jest setup replaces `fetch` with an XHR polyfill whose XHR is
// mocked, so real requests never get a response there. Node's own `fetch`
// is what the client uses in production on the web anyway. babel-preset-expo
// still transforms the app's TypeScript so the tests import real modules.
module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/live/**/*.test.ts"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { presets: ["babel-preset-expo"] }],
  },
};
