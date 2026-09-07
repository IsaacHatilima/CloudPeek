import { formatDateTime, isDateTimeField } from "@/lib/format-date-time";
import { displayLabel } from "@/lib/display-label";

describe("formatDateTime", () => {
  it.each([
    ["2026-09-05T23:59:01.123456Z", "5 Sep 2026, 23:59:01"],
    ["2026-09-05T23:59:01-07:00", "5 Sep 2026, 23:59:01"],
    ["2026-09-05T00:01:02+0530", "5 Sep 2026, 00:01:02"],
    ["2026-09-05 10:00:00", "5 Sep 2026, 10:00:00"],
    ["2026-09-05 10:00 UTC", "5 Sep 2026, 10:00"],
    ["2024-02-29", "29 Feb 2024"],
    ["2000-02-29", "29 Feb 2000"],
    [" 2026-09-05 ", "5 Sep 2026"],
  ])("preserves the calendar and clock time in %s", (input, output) => {
    expect(formatDateTime(input)).toBe(output);
  });
  it.each(["", "not a date", "2026-02-29", "1900-02-29", "2026-13-01", "2026-00-01", "2026-04-31", "2026-09-00", "2026-09-05T24:00:00Z", "2026-09-05T10:60:00Z", "2026-09-05T10:00:60Z", "2026-09-05T10:00:00+24:00", "2026-09-05T10:00:00+02:60"])("leaves invalid or non-date input unchanged: %s", (input) => {
    expect(formatDateTime(input)).toBe(input);
  });
  it("recognizes timestamp fields without treating titles or commands as dates", () => {
    for (const key of ["created_at", "lastUpdatedAt", "start_date", "run_time", "timestamp", "date", "time"]) expect(isDateTimeField(key)).toBe(true);
    for (const key of ["command", "name", "timezone", "duration"]) expect(isDateTimeField(key)).toBe(false);
  });
});

it("formats technical labels without losing acronym casing", () => {
  expect(displayLabel("php_major_version")).toBe("PHP major version");
  expect(displayLabel("response_headers")).toBe("Response headers");
  expect(displayLabel("hsts")).toBe("HSTS");
  expect(displayLabel("apiUrl")).toBe("API URL");
});
