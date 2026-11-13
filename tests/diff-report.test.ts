import assert from "node:assert/strict";
import { test } from "node:test";
import type { ContentStack, ContentTable, TableCell } from "pdfmake/interfaces";
import type { TankMeasurement } from "../src/components/tank.types";
import { buildDiffReportDefinition } from "../src/lib/createDiffReportPdf";

const startDate = new Date(2026, 9, 19, 14, 20);
const endDate = new Date(2026, 9, 20, 15, 30);
const before: TankMeasurement = {
  id: "a", name: "Tank A", label: "Tank A", value: "a", park: "Test park", park_id: "park",
  timestamp: new Date(2026, 9, 19, 14, 19, 10).toISOString(),
  product_level: 1000, product_temperature: 10, total_observed_volume: 200,
  standard_gross_volume_at15_c: 190, standard_gross_mass_in_vacuume: 95,
  pressure: 8, molar_mass: 44, free_temperature: 19,
  vapor_gross_observed_volume: 10, vapor_gross_mass_in_vacuume: 1, gas_product_mass: 95.8,
};
const after: TankMeasurement = {
  ...before,
  timestamp: new Date(2026, 9, 20, 15, 29, 48).toISOString(),
  product_level: 1100, product_temperature: 12, total_observed_volume: 220,
  standard_gross_volume_at15_c: 198, standard_gross_mass_in_vacuume: 100.98,
  pressure: 7.8, molar_mass: 45, free_temperature: 18,
  vapor_gross_observed_volume: 8, vapor_gross_mass_in_vacuume: 0.8, gas_product_mass: 101.5,
};

function text(cell: TableCell): string {
  return typeof cell === "object" && "text" in cell ? String(cell.text) : String(cell);
}

function sections(start: TankMeasurement[], end: TankMeasurement[]) {
  const definition = buildDiffReportDefinition(start, end, startDate, endDate);
  return (definition.content as ContentStack[]).map((section) => {
    const pages = section.stack.filter((item): item is ContentStack => typeof item === "object" && "stack" in item);
    const tables = pages.map((page) => (page.stack[2] as ContentTable).table.body);
    const summary = pages.length ? (section.stack.at(-1) as ContentTable).table.body : [];
    return { section, pages, tables, summary };
  });
}

function rowValues(rows: TableCell[][], label: string): string[] {
  const row = rows.find((row) => text(row[0]) === label);
  assert.ok(row, `Missing row: ${label}`);
  return row.slice(1).map(text);
}

test("period report contains the start snapshot, end snapshot and end-minus-start values in the base layout", () => {
  const result = sections([before], [after]);
  assert.equal(result.length, 3);
  const headings = ["Base report (start)", "Base report (end)", "Difference (end - start)"];
  for (const [index, { section, pages, tables }] of result.entries()) {
    assert.equal(section.pageBreak, index === 0 ? undefined : "before");
    assert.equal(pages.length, 1);
    assert.equal(text(pages[0].stack[0]), `${headings[index]} - Test park`);
    assert.deepEqual(rowValues(tables[0], "Tank Name"), ["Tank A"]);
    assert.equal(tables[0].length, index === 2 ? 18 : 17);
  }
  assert.deepEqual(rowValues(result[0].tables[0], "Liquid Volume (m³)"), ["200.000"]);
  assert.deepEqual(rowValues(result[1].tables[0], "Liquid Volume (m³)"), ["220.000"]);
  assert.deepEqual(rowValues(result[0].tables[0], "Measured Time"), ["19.10.2026\n14:19:10"]);
  assert.deepEqual(rowValues(result[1].tables[0], "Measured Time"), ["20.10.2026\n15:29:48"]);
  assert.deepEqual(rowValues(result[2].tables[0], "Start Measured Time"), ["19.10.2026\n14:19:10"]);
  assert.deepEqual(rowValues(result[2].tables[0], "End Measured Time"), ["20.10.2026\n15:29:48"]);
  assert.deepEqual((result[0].pages[0].stack[1] as ContentTable).table.body[0].map(text), ["Date / Loc. Time", "19.10.2026", "at", "14:20", "hrs."]);
  assert.deepEqual((result[1].pages[0].stack[1] as ContentTable).table.body[0].map(text), ["Date / Loc. Time", "20.10.2026", "at", "15:30", "hrs."]);
  const diffDates = (result[2].pages[0].stack[1] as ContentTable).table.body.map((row) => row.map(text));
  assert.deepEqual(diffDates, [
    ["Start / Loc. Time", "19.10.2026", "at", "14:20", "hrs."],
    ["End / Loc. Time", "20.10.2026", "at", "15:30", "hrs."],
  ]);
  const expected = [
    ["Liquid Level (mm)", "100"],
    ["Temperature (°C)", "2.00"],
    ["Liquid Volume (m³)", "20.000"],
    ["V.C.F. (T-54E) MPMS 11.2.4", "-0.05000"],
    ["Corrected Volume\n(at 15 °C) (m³)", "8.000"],
    ["Density at 15", "0.0100"],
    ["Liquid Weight\nvacuum (tons)", "5.980"],
    ["Vapour Pressure\n(bar)", "-0.200"],
    ["Molar Mass", "1.000"],
    ["Vapour Temperature\n(°C)", "-1.00"],
    ["Vapour Volume (m³)", "-2.000"],
    ["Vapour Weight\nvacuum (tons)", "-0.200"],
    ["Totals", "5.780"],
  ];
  for (const [label, value] of expected) assert.deepEqual(rowValues(result[2].tables[0], label), [value]);
  assert.deepEqual([0, 1, 3, 4].map((index) => text(result[2].summary[index][1])), ["5.980 Vac", "-0.200 Vac", "5.780 Vac", "5.700 Air"]);
  assert.doesNotMatch(JSON.stringify(result), /Comment|\bMT\b|NaN|Infinity/);
});

test("tanks are matched by ID and reordered end readings keep the same columns", () => {
  const unchanged = { ...before, id: "b", name: "Tank B" };
  const start = [before, unchanged];
  const end = [unchanged, after];
  const original = JSON.stringify({ start, end });
  const result = sections(start, end);
  for (const { tables } of result) assert.deepEqual(rowValues(tables[0], "Tank Name"), ["Tank A", "Tank B"]);
  assert.deepEqual(rowValues(result[2].tables[0], "Totals"), ["5.780", "0.000"]);
  assert.deepEqual(rowValues(result[2].tables[0], "V.C.F. (T-54E) MPMS 11.2.4"), ["-0.05000", "0.00000"]);
  assert.deepEqual(rowValues(result[1].tables[0], "Measured Time"), ["20.10.2026\n15:29:48", "19.10.2026\n14:19:10"]);
  assert.deepEqual(rowValues(result[2].tables[0], "End Measured Time"), ["20.10.2026\n15:29:48", "19.10.2026\n14:19:10"]);
  assert.equal(JSON.stringify({ start, end }), original);
});

test("missing readings and tanks stay visible without inventing changes or totals", () => {
  const result = sections(
    [before, { ...before, id: "b", name: "Tank B" }],
    [{ ...after, standard_gross_mass_in_vacuume: null, total_observed_volume: 0 }, { ...after, id: "c", name: "Tank C" }],
  );
  for (const { tables } of result) assert.deepEqual(rowValues(tables[0], "Tank Name"), ["Tank A", "Tank B", "Tank C"]);
  assert.deepEqual(rowValues(result[0].tables[0], "Liquid Level (mm)"), ["1000", "1000", "-"]);
  assert.deepEqual(rowValues(result[1].tables[0], "Liquid Level (mm)"), ["1100", "-", "1100"]);
  assert.deepEqual(rowValues(result[2].tables[0], "Liquid Level (mm)"), ["100", "-", "-"]);
  assert.deepEqual(rowValues(result[2].tables[0], "V.C.F. (T-54E) MPMS 11.2.4"), ["-", "-", "-"]);
  assert.deepEqual(rowValues(result[2].tables[0], "Density at 15"), ["-", "-", "-"]);
  assert.deepEqual(rowValues(result[2].tables[0], "Totals"), ["-", "-", "-"]);
  assert.equal(text(result[2].summary[3][1]), "- Vac");
  assert.deepEqual(rowValues(result[2].tables[0], "Start Measured Time"), ["19.10.2026\n14:19:10", "19.10.2026\n14:19:10", "-"]);
  assert.deepEqual(rowValues(result[2].tables[0], "End Measured Time"), ["20.10.2026\n15:29:48", "-", "20.10.2026\n15:29:48"]);
});

test("difference totals use full precision and zero does not display a negative sign", () => {
  const start = Array.from({ length: 3 }, (_, index) => ({ ...before, id: String(index), standard_gross_mass_in_vacuume: 1, vapor_gross_mass_in_vacuume: 0, pressure: 8 }));
  const end = start.map((tank) => ({ ...tank, standard_gross_mass_in_vacuume: 1.0004, vapor_gross_mass_in_vacuume: 0.0004, pressure: 7.99999999999 }));
  const diff = sections(start, end)[2];
  assert.deepEqual(rowValues(diff.tables[0], "Totals"), ["0.001", "0.001", "0.001"]);
  assert.equal(text(diff.summary[0][1]), "0.001 Vac");
  assert.equal(text(diff.summary[1][1]), "0.001 Vac");
  assert.equal(text(diff.summary[3][1]), "0.002 Vac");
  assert.deepEqual(rowValues(diff.tables[0], "Vapour Pressure\n(bar)"), ["0.000", "0.000", "0.000"]);
});

test("each section continues after 16 tanks and retains every tank and its total", () => {
  for (const count of [16, 17, 33]) {
    const start = Array.from({ length: count }, (_, index) => ({ ...before, id: String(index), name: `Tank ${index + 1}` }));
    const end = start.map((tank) => ({ ...after, id: tank.id, name: tank.name }));
    const result = sections(start, end);
    for (const { pages, tables } of result) {
      assert.equal(pages.length, Math.ceil(count / 16));
      assert.deepEqual(tables.flatMap((rows) => rowValues(rows, "Tank Name")), start.map((tank) => tank.name));
      pages.forEach((page, index) => assert.equal(page.pageBreak, index === 0 ? undefined : "before"));
    }
    assert.equal(text(result[2].summary[3][1]), `${(count * 5.78).toFixed(3)} Vac`);
  }
});

test("empty and equal-date reports remain valid, while invalid or reversed ranges are rejected", () => {
  const empty = sections([], []);
  assert.equal(empty.length, 3);
  for (const section of empty) assert.match(JSON.stringify(section), /No data available/);
  const same = buildDiffReportDefinition([before], [before], startDate, startDate);
  assert.equal((same.content as ContentStack[]).length, 3);
  assert.throws(() => buildDiffReportDefinition([], [], endDate, startDate), RangeError);
  assert.throws(() => buildDiffReportDefinition([], [], new Date(NaN), endDate), RangeError);
});
