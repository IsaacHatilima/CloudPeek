const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-](\d{2}):?(\d{2})| UTC)?)?$/i;

/**
 * Display the calendar date and clock time as supplied by Cloud. No timezone
 * conversion or inferred zone: Z/offsets and fractional seconds are omitted.
 * Non-date strings and invalid dates pass through unchanged.
 */
export function formatDateTime(value: string): string {
  const match = DATE_TIME.exec(value.trim());
  if (!match) return value;
  const [, year, month, day, hour, minute, second, offsetHour, offsetMinute] = match;
  const y = Number(year), m = Number(month), d = Number(day);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (m < 1 || m > 12 || d < 1 || d > days[m - 1] ||
      (hour !== undefined && (Number(hour) > 23 || Number(minute) > 59 || Number(second ?? 0) > 59)) ||
      (offsetHour !== undefined && (Number(offsetHour) > 23 || Number(offsetMinute) > 59))) return value;
  const date = `${d} ${MONTHS[m - 1]} ${year}`;
  return hour === undefined ? date : `${date}, ${hour}:${minute}${second === undefined ? "" : `:${second}`}`;
}

/** Dates in list metadata are formatted without changing titles or commands. */
export function isDateTimeField(key: string): boolean {
  return /(?:_at|_date|_time)$/.test(key) || /(?:At|Date|Time)$/.test(key) || ["date", "time", "timestamp"].includes(key);
}
