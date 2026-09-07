/** Neutral layered surfaces, clear type, and restrained brand accents. */
import { brand } from "./brand";
import type { ColorPalette, ColorScheme } from "./types";

export const PALETTES = {
  light: {
    accent: brand.cloudBlue,
    accentPressed: brand.cloudBluePressed,
    accentText: "#FFFFFF",
    accentSoft: "#E7EFFF",
    subtle: "#E4E6EB",
    cardBackground: "#FFFFFF",
    chipBackground: "#E5E5EA",
    link: brand.cloudBluePressed,
    menuBackground: "#EBEDF2",
    menuSelected: "#FFFFFF",
    muted: "#6E6E73",
    primary: brand.laravelRed,
    separator: "rgba(60, 60, 67, 0.29)",
    surfaceBackground: "#F5F6F8",
    text: "#191B20",
  },
  dark: {
    accent: brand.cloudBlue,
    accentPressed: brand.cloudBluePressed,
    accentText: "#FFFFFF",
    accentSoft: "#17253D",
    subtle: "#34363B",
    cardBackground: "#24262B",
    chipBackground: "#2C2C2E",
    link: brand.cloudBlueOnDark,
    menuBackground: "#101114",
    menuSelected: "#2C2C2E",
    muted: "#A1A4AD",
    primary: brand.laravelRed,
    separator: "rgba(84, 84, 88, 0.6)",
    surfaceBackground: "#17181C",
    text: "#FFFFFF",
  },
} satisfies Record<ColorScheme, ColorPalette>;
