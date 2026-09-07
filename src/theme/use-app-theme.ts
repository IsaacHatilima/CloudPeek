import { useColorScheme } from "react-native";

import { PALETTES } from "./palettes";

export function useAppTheme() {
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";

  return {
    colorScheme,
    colors: PALETTES[colorScheme],
  } as const;
}
