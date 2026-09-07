import type { TextStyle } from "react-native";

/** One quiet typographic hierarchy across the console. */
export const typography = {
  display: { fontSize: 32, fontWeight: "600", letterSpacing: -1.1, lineHeight: 38 },
  title: { fontSize: 22, fontWeight: "600", letterSpacing: -0.5, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
  label: { fontSize: 16, fontWeight: "600", lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 20 },
  eyebrow: { fontSize: 13, fontWeight: "600", letterSpacing: 1.2, lineHeight: 20 },
} satisfies Record<string, TextStyle>;
