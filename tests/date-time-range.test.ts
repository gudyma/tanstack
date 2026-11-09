import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DATE_RANGE_PRESET_GROUPS,
  getDateRangePreset,
  getDateTimeRangeError,
  parseRangeDate,
  withRangeDay,
} from "../src/lib/date-time-range";

test("previous year is complete, including the last minute, and works in a leap year", () => {
  const range = getDateRangePreset("previousYear", new Date(2025, 6, 15, 12, 30))!;
  assert.deepEqual(range, {
    from: new Date(2024, 0, 1, 0, 0),
    to: new Date(2024, 11, 31, 23, 59),
  });
});

test("quarters use the current year and clip the current quarter at now", () => {
  const now = new Date(2031, 7, 15, 13, 42, 57, 123);
  assert.deepEqual(getDateRangePreset("quarter1", now), {
    from: new Date(2031, 0, 1), to: new Date(2031, 2, 31, 23, 59),
  });
  assert.deepEqual(getDateRangePreset("quarter2", now), {
    from: new Date(2031, 3, 1), to: new Date(2031, 5, 30, 23, 59),
  });
  assert.deepEqual(getDateRangePreset("quarter3", now), {
    from: new Date(2031, 6, 1), to: new Date(2031, 7, 15, 13, 42),
  });
  assert.equal(getDateRangePreset("quarter4", now), null);
});

test("quarter and year presets roll over at New Year without keeping the previous year", () => {
  const now = new Date(2032, 0, 1);
  assert.deepEqual(getDateRangePreset("quarter1", now), { from: now, to: now });
  assert.equal(getDateRangePreset("quarter2", now), null);
  assert.equal(getDateRangePreset("quarter3", now), null);
  assert.equal(getDateRangePreset("quarter4", now), null);
  assert.equal(getDateRangePreset("previousYear", now)!.from.getFullYear(), 2031);
});

test("rolling last month clamps month-end, while previous month uses calendar boundaries", () => {
  const now = new Date(2024, 2, 31, 10, 15);
  assert.deepEqual(getDateRangePreset("lastMonth", now), {
    from: new Date(2024, 1, 29), to: now,
  });
  assert.deepEqual(getDateRangePreset("previousMonth", now), {
    from: new Date(2024, 1, 1), to: new Date(2024, 1, 29, 23, 59),
  });
  assert.equal(getDateRangePreset("lastMonth", new Date(2025, 2, 31))!.from.getDate(), 28);
  assert.deepEqual(getDateRangePreset("previousMonth", new Date(2026, 0, 10)), {
    from: new Date(2025, 11, 1), to: new Date(2025, 11, 31, 23, 59),
  });
});

test("this week starts on Monday even on Sunday and across a year boundary", () => {
  for (const now of [new Date(2026, 0, 4, 15), new Date(2025, 11, 29, 12)]) {
    assert.deepEqual(getDateRangePreset("thisWeek", now), {
      from: new Date(2025, 11, 29), to: now,
    });
  }
});

test("today, this month and this year end at the current minute", () => {
  const now = new Date(2026, 10, 9, 14, 35, 45, 789);
  const to = new Date(2026, 10, 9, 14, 35);
  assert.deepEqual(getDateRangePreset("today", now), { from: new Date(2026, 10, 9), to });
  assert.deepEqual(getDateRangePreset("thisMonth", now), { from: new Date(2026, 10, 1), to });
  assert.deepEqual(getDateRangePreset("thisYear", now), { from: new Date(2026, 0, 1), to });
  assert.deepEqual(getDateRangePreset("yesterday", new Date(2026, 0, 1)), {
    from: new Date(2025, 11, 31), to: new Date(2025, 11, 31, 23, 59),
  });
});

test("all available presets return independent ordered dates with minute precision", () => {
  const now = new Date(2026, 10, 9, 14, 35, 59, 999);
  const original = now.getTime();
  for (const preset of DATE_RANGE_PRESET_GROUPS.flat()) {
    const range = getDateRangePreset(preset, now)!;
    assert.ok(range.from <= range.to);
    assert.ok(range.to <= now);
    assert.equal(getDateTimeRangeError(range.from, range.to, now), null);
    assert.equal(range.from.getSeconds(), 0);
    assert.equal(range.to.getSeconds(), 0);
    assert.equal(range.from.getMilliseconds(), 0);
    assert.equal(range.to.getMilliseconds(), 0);
    range.to.setFullYear(1999);
    assert.equal(now.getTime(), original);
  }
});

test("strict date parsing rejects invalid, partial and ambiguous dates", () => {
  const time = new Date(2026, 10, 9, 14, 35);
  for (const input of ["", "1", "09.11.", "1.2.2026", "2026-11-09", "31.04.2026", "29.02.2025", "00.11.2026", "09.13.2026", "09.11.0000", "09.11.2026 "]) {
    assert.equal(parseRangeDate(input, time), null, input);
  }
  assert.deepEqual(parseRangeDate("29.02.2024", time), new Date(2024, 1, 29, 14, 35));
});

test("changing the date preserves local hours and minutes without mutating either input", () => {
  const day = new Date(2026, 2, 29);
  const time = new Date(2026, 1, 1, 9, 27, 59, 999);
  const original = time.getTime();
  assert.deepEqual(withRangeDay(day, time), new Date(2026, 2, 29, 9, 27));
  assert.equal(time.getTime(), original);
  assert.deepEqual(day, new Date(2026, 2, 29));
  assert.deepEqual(parseRangeDate("29.03.2026", time), new Date(2026, 2, 29, 9, 27));
});

test("validation rejects invalid dates, future days and reversed times on the same day", () => {
  const now = new Date(2026, 10, 9, 14, 35);
  assert.equal(getDateTimeRangeError(null, now, now), "invalidDate");
  assert.equal(getDateTimeRangeError(now, new Date(NaN), now), "invalidDate");
  assert.equal(getDateTimeRangeError(new Date(2026, 10, 9, 14, 36), now, now), "reversedRange");
  assert.equal(getDateTimeRangeError(now, new Date(2026, 10, 10), now), "futureDate");
  assert.equal(getDateTimeRangeError(now, now, now), null);
  assert.equal(getDateTimeRangeError(now, new Date(2026, 10, 9, 23, 59), now), null);
});
