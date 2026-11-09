import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  isValid,
  parse,
  startOfDay,
  startOfMinute,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

export interface DateTimeRange {
  from: Date;
  to: Date;
}

export const DATE_RANGE_PRESET_GROUPS = [
  ["today", "yesterday", "lastMonth", "thisWeek", "thisMonth", "previousMonth"],
  ["quarter4", "quarter3", "quarter2", "quarter1"],
  ["thisYear", "previousYear"],
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESET_GROUPS)[number][number];

/** Local calendar boundaries; completed periods include their final minute. */
export function getDateRangePreset(
  preset: DateRangePreset,
  now: Date,
): DateTimeRange | null {
  const to = startOfMinute(now);
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to };
    case "yesterday": {
      const day = subDays(now, 1);
      return { from: startOfDay(day), to: startOfMinute(endOfDay(day)) };
    }
    case "lastMonth":
      return { from: startOfDay(subMonths(now, 1)), to };
    case "thisWeek":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to };
    case "thisMonth":
      return { from: startOfMonth(now), to };
    case "previousMonth": {
      const month = subMonths(now, 1);
      return { from: startOfMonth(month), to: startOfMinute(endOfMonth(month)) };
    }
    case "thisYear":
      return { from: startOfYear(now), to };
    case "previousYear": {
      const year = subYears(now, 1);
      return { from: startOfYear(year), to: startOfMinute(endOfYear(year)) };
    }
    default: {
      const quarter = Number(preset.slice(-1));
      const from = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
      if (from > now) return null;
      return {
        from,
        to: startOfMinute(new Date(Math.min(endOfQuarter(from).getTime(), to.getTime()))),
      };
    }
  }
}

export function withRangeDay(day: Date, time: Date): Date {
  const result = new Date(day);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

/** Reject partial and impossible dates instead of letting Date roll them over. */
export function parseRangeDate(text: string, time: Date): Date | null {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) return null;
  const date = parse(text, "dd.MM.yyyy", time);
  if (!isValid(date) || format(date, "dd.MM.yyyy") !== text) return null;
  return withRangeDay(date, time);
}

export function getDateTimeRangeError(
  from: Date | null,
  to: Date | null,
  now: Date,
): "invalidDate" | "reversedRange" | "futureDate" | null {
  if (!from || !to || !isValid(from) || !isValid(to)) return "invalidDate";
  if (startOfDay(from) > startOfDay(now) || startOfDay(to) > startOfDay(now)) {
    return "futureDate";
  }
  if (from > to) return "reversedRange";
  return null;
}
