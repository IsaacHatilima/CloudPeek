export const LOG_WINDOW_MS = 60 * 60 * 1000;

/**
 * Cloud's environment log endpoint requires a `from`/`to` window. This is the
 * last hour, rounded down to the minute so a screen's query key stays stable
 * within a minute instead of changing on every render.
 */
export function logWindow(now: number = Date.now()): { from: string; to: string } {
  const to = new Date(Math.floor(now / 60_000) * 60_000);
  const from = new Date(to.getTime() - LOG_WINDOW_MS);

  return { from: from.toISOString(), to: to.toISOString() };
}
