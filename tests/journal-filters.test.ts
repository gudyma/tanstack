import assert from "node:assert/strict";
import { test } from "node:test";
import { parseJournalFilters } from "../src/lib/journal-filters";

test("restores the selected tank and the exact time range across time zones", () => {
  const saved = JSON.stringify({
    tank: "tank-2",
    startDate: "2026-11-07T14:15:00+02:00",
    endDate: "2026-11-07T15:45:00+02:00",
  });

  assert.deepEqual(parseJournalFilters(saved), {
    tank: "tank-2",
    startDate: "2026-11-07T12:15:00.000Z",
    endDate: "2026-11-07T13:45:00.000Z",
  });
});

test("ignores missing, corrupted and incomplete cached selections", () => {
  for (const saved of [
    null,
    "",
    "{invalid json",
    "null",
    "[]",
    "42",
    JSON.stringify({ tank: "tank-2" }),
    JSON.stringify({ tank: 2, startDate: "2026-11-07", endDate: "2026-11-08" }),
  ]) {
    assert.equal(parseJournalFilters(saved), null);
  }
});

test("rejects invalid or reversed cached dates", () => {
  for (const [startDate, endDate] of [
    ["invalid", "2026-11-07T13:00:00Z"],
    ["2026-11-07T12:00:00Z", "invalid"],
    [null, "2026-11-07T13:00:00Z"],
    ["2026-11-07T14:00:00Z", "2026-11-07T13:00:00Z"],
  ]) {
    assert.equal(
      parseJournalFilters(JSON.stringify({ tank: "tank-2", startDate, endDate })),
      null,
    );
  }
});

test("preserves a saved range before a tank is selected and allows equal dates", () => {
  const filters = {
    tank: "",
    startDate: "2026-11-07T12:00:00.000Z",
    endDate: "2026-11-07T12:00:00.000Z",
  };
  assert.deepEqual(parseJournalFilters(JSON.stringify(filters)), filters);
});
