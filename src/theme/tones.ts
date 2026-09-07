/** A status rendered as a coloured dot or label: iOS system colours, both modes. */
export type Tone = "negative" | "neutral" | "pending" | "positive";

export const TONE_COLORS: Record<Tone, string> = {
  negative: "#FF453A",
  neutral: "#8E8E93",
  pending: "#FF9F0A",
  positive: "#30D158",
};

/** Readable status text on both light and dark surfaces, always paired with a label. */
export const STATUS_PALETTES = {
  light: {
    positive: { background: "#E6F4EC", text: "#196D40" },
    pending: { background: "#FFF2D9", text: "#875A0A" },
    negative: { background: "#FCE9E7", text: "#B22D25" },
    neutral: { background: "#ECEEF2", text: "#5E626D" },
  },
  dark: {
    positive: { background: "#1B352A", text: "#75D9A0" },
    pending: { background: "#3C301C", text: "#F4C36A" },
    negative: { background: "#3D2527", text: "#FF9B95" },
    neutral: { background: "#33353D", text: "#BEC2CC" },
  },
} as const;
