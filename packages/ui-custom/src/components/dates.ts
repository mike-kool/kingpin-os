// Dates are ISO strings (yyyy-mm-dd) end to end, and all date math is done
// in UTC, so no time zone or daylight saving shift can move a day.
export const DAY = 86_400_000;
export const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);
export const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
export const addDays = (iso: string, days: number) => toIso(toTime(iso) + days * DAY);

export function addMonths(iso: string, months: number) {
  const d = new Date(toTime(iso));
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  // Jan 31 plus a month is the last day of February, not March 3.
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toIso(d.getTime());
}

export function todayIso() {
  const now = new Date();
  return toIso(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export const isIso = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toTime(value));
