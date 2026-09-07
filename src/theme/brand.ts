/**
 * Brand colour tokens. Every brand hex in the app lives here so a value can be
 * corrected in one place once it is re-confirmed against the live dashboard.
 * Neutral surfaces are NOT brand colours; they follow the platform's system
 * greys in `palettes.ts`.
 *
 * Sources (checked 2026-09-05):
 * - laravelRed: the value specified for Cloud Peek. Laravel's own dark-theme
 *   token `--color-laravel-red` on laravel.com is #F61500; the specified value
 *   wins, and this is the only place to change it.
 * - cloudBlue: `--cloud-light-9` / `--cloud-dark-9` in the public CSS of
 *   laravel.com/cloud, the solid brand step that `--background-color-brand`
 *   resolves to. The signed-in dashboard is not publicly reachable, so this
 *   comes from the public design tokens rather than the app bundle.
 * - cloudBluePressed: `--cloud-light-10`, the hover/pressed step (also the link
 *   colour on the Cloud sign-in page).
 * - cloudBlueOnDark: `--cloud-dark-11`, the legible blue for text and icons on
 *   dark surfaces.
 */
export const brand = {
  cloudBlue: "#006AFF",
  cloudBlueOnDark: "#83B7FF",
  cloudBluePressed: "#005CEC",
  laravelRed: "#FF2D20",
} as const;
