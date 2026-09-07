// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

// `expo lint` passes no `--max-warnings`, so a warning cannot fail anything.
// The three rules below are promoted to errors because each one hides a real
// defect class: a stale-closure effect, a parameter that was meant to be used,
// and a stray `console.log` in a shipped bundle.
module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "src/services/cloud-api/write-operations.generated.ts",
      "dist/*",
      "ios/*",
      "android/*",
      ".expo/*",
      "coverage/*",
      // Generated from the OpenAPI document; see scripts/generate-cloud-api-types.mjs.
      "src/services/cloud-api/schema.d.ts",
    ],
  },
  {
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["error", { allow: ["warn"] }],
    },
  },
]);
