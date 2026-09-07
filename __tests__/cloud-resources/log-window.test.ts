import { findResource } from "@/features/cloud-resources/catalog";
import { LOG_WINDOW_MS, logWindow } from "@/features/cloud-resources/log-window";

describe("logWindow", () => {
  it("covers the last hour, rounded down to the minute", () => {
    const now = Date.parse("2026-09-05T15:42:37.123Z");

    expect(logWindow(now)).toEqual({
      from: "2026-09-05T14:42:00.000Z",
      to: "2026-09-05T15:42:00.000Z",
    });
    expect(Date.parse(logWindow(now).to) - Date.parse(logWindow(now).from)).toBe(LOG_WINDOW_MS);
  });

  it("is stable within a minute so query keys do not churn", () => {
    const base = Date.parse("2026-09-05T15:42:00.000Z");

    expect(logWindow(base + 1_000)).toEqual(logWindow(base + 59_000));
  });

  it("is the default query of the environment logs endpoint", () => {
    expect(findResource("environment-logs")?.endpoint?.defaultQuery).toBe(logWindow);
  });
});
