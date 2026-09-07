export type ColorScheme = "dark" | "light";

/** Semantic colours. Components read these, never the brand hexes directly. */
export type ColorPalette = {
  /** Cloud blue: selection, active chips, primary buttons. */
  accent: string;
  accentPressed: string;
  accentText: string;
  accentSoft: string;
  subtle: string;
  cardBackground: string;
  chipBackground: string;
  link: string;
  menuBackground: string;
  menuSelected: string;
  muted: string;
  /** Laravel red: the brand mark and nothing else, so red keeps meaning "error" elsewhere. */
  primary: string;
  separator: string;
  surfaceBackground: string;
  text: string;
};
