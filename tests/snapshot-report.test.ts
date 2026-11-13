import assert from "node:assert/strict";
import { test } from "node:test";
import type { Content, ContentStack, ContentTable, TableCell } from "pdfmake/interfaces";
import type { TankMeasurement } from "../src/components/tank.types";
import { buildSnapshotReportDefinition } from "../src/lib/createSnapshotReportPdf";

const date = new Date(2026, 9, 19, 14, 20);
const tank: TankMeasurement = {
  id: "tank-1", name: "1", label: "Tank 1", value: "tank-1", park: "Test", park_id: "test",
  product_level: 3546,
  product_temperature: 17.1,
  total_observed_volume: 283.496,
  standard_gross_volume_at15_c: 281.750,
  standard_gross_mass_in_vacuume: 142.678,
  pressure: 8.270,
  molar_mass: 44.094,
  free_temperature: 19,
  vapor_gross_observed_volume: 56.763,
  vapor_gross_mass_in_vacuume: 0.957,
  gas_product_mass: 143.315,
  // These other measurements must not replace the reference's selected fields.
  gross_observed_volume: 999,
  product_mass: 888,
  vapor_gross_mass: 777,
  observed_density: 666,
};

function report(tanks: TankMeasurement[]) {
  const definition = buildSnapshotReportDefinition(tanks, date);
  const content = definition.content as Content[];
  const pages = content.filter((item): item is ContentStack => typeof item === "object" && "stack" in item);
  const rows = pages.flatMap((page) => (page.stack[2] as ContentTable).table.body);
  const summary = tanks.length ? (content.at(-1) as ContentTable).table.body : [];
  return { definition, pages, rows, summary };
}

function text(cell: TableCell): string {
  return typeof cell === "object" && "text" in cell ? String(cell.text) : String(cell);
}

function rowValues(rows: TableCell[][], label: string): string[] {
  const row = rows.find((row) => text(row[0]) === label);
  assert.ok(row, `Missing row: ${label}`);
  return row.slice(1).map(text);
}

test("base report uses the reference's fields, precision, local date and tank columns without comments", () => {
  const { definition, pages, rows } = report([tank]);
  assert.deepEqual(rowValues(rows, "Tank Name"), ["1"]);
  assert.deepEqual(rowValues(rows, "Liquid Level (mm)"), ["3546"]);
  assert.deepEqual(rowValues(rows, "Temperature (°C)"), ["17.10"]);
  assert.deepEqual(rowValues(rows, "Liquid Volume (m³)"), ["283.496"]);
  assert.deepEqual(rowValues(rows, "V.C.F. (T-54E) MPMS 11.2.4"), ["0.99384"]);
  assert.deepEqual(rowValues(rows, "Corrected Volume\n(at 15 °C) (m³)"), ["281.750"]);
  assert.deepEqual(rowValues(rows, "Density at 15"), ["0.5064"]);
  assert.deepEqual(rowValues(rows, "Liquid Weight\nvacuum (tons)"), ["142.678"]);
  assert.deepEqual(rowValues(rows, "Vapour Pressure\n(bar)"), ["8.270"]);
  assert.deepEqual(rowValues(rows, "Molar Mass"), ["44.094"]);
  assert.deepEqual(rowValues(rows, "Vapour Temperature\n(°C)"), ["19.00"]);
  assert.deepEqual(rowValues(rows, "Vapour Volume (m³)"), ["56.763"]);
  assert.deepEqual(rowValues(rows, "Vapour Weight\nvacuum (tons)"), ["0.957"]);
  assert.deepEqual(rowValues(rows, "Totals"), ["143.635"]);
  const header = (pages[0].stack[1] as ContentTable).table.body[0].map(text);
  assert.deepEqual(header, ["Date / Loc. Time", "19.10.2026", "at", "14:20", "hrs."]);
  assert.equal(rows.length, 16);
  assert.ok(rows.every((row) => row.length === 2));
  assert.doesNotMatch(JSON.stringify(definition), /Comment|standard_gross|gas_product_mass/);
});

test("vacuum and air summary totals agree with the six-tank reference", () => {
  const liquid = [142.678, 142.632, 144.394, 145.800, 144.763, 145.655];
  const vapour = [0.957, 0.953, 0.901, 0.867, 0.910, 0.888];
  const tanks = liquid.map((mass, index) => ({
    ...tank,
    id: String(index + 1), name: String(index + 1),
    standard_gross_mass_in_vacuume: mass,
    vapor_gross_mass_in_vacuume: vapour[index],
    gas_product_mass: mass + vapour[index] - (index === 0 ? 0.322 : 0.321),
  }));
  const { rows, summary } = report(tanks);
  assert.deepEqual(rowValues(rows, "Totals"), ["143.635", "143.585", "145.295", "146.667", "145.673", "146.543"]);
  assert.deepEqual([0, 1, 3, 4].map((index) => text(summary[index][1])), ["865.922 Vac", "5.476 Vac", "871.398 Vac", "869.471 Air"]);
});

test("totals are calculated before rounding individual readings", () => {
  const { summary } = report(Array.from({ length: 3 }, () => ({
    ...tank, standard_gross_mass_in_vacuume: 1.0004, vapor_gross_mass_in_vacuume: 0.0004, gas_product_mass: 1.0004,
  })));
  assert.equal(text(summary[0][1]), "3.001 Vac");
  assert.equal(text(summary[1][1]), "0.001 Vac");
  assert.equal(text(summary[3][1]), "3.002 Vac");
  assert.equal(text(summary[4][1]), "3.001 Air");
});

test("zero readings remain visible and missing readings do not produce misleading totals", () => {
  const zero = { ...tank, product_level: 0, product_temperature: 0, standard_gross_mass_in_vacuume: 0, vapor_gross_mass_in_vacuume: 0, gas_product_mass: 0 };
  const { rows, summary } = report([zero]);
  assert.deepEqual(rowValues(rows, "Liquid Level (mm)"), ["0"]);
  assert.deepEqual(rowValues(rows, "Temperature (°C)"), ["0.00"]);
  assert.deepEqual(rowValues(rows, "Density at 15"), ["0.0000"]);
  assert.deepEqual(rowValues(rows, "Totals"), ["0.000"]);
  assert.equal(text(summary[3][1]), "0.000 Vac");
  assert.equal(text(summary[4][1]), "0.000 Air");

  for (const missing of [null, undefined, NaN, Infinity]) {
    const result = report([tank, { ...tank, standard_gross_mass_in_vacuume: missing }]);
    assert.deepEqual(rowValues(result.rows, "Density at 15"), ["0.5064", "-"]);
    assert.deepEqual(rowValues(result.rows, "Totals"), ["143.635", "-"]);
    assert.equal(text(result.summary[0][1]), "- Vac");
    assert.equal(text(result.summary[1][1]), "1.914 Vac");
    assert.equal(text(result.summary[3][1]), "- Vac");
  }
  assert.deepEqual(rowValues(report([{ ...tank, standard_gross_volume_at15_c: 0 }]).rows, "Density at 15"), ["-"]);
  assert.deepEqual(rowValues(report([{ ...tank, standard_gross_volume_at15_c: 0 }]).rows, "V.C.F. (T-54E) MPMS 11.2.4"), ["0.00000"]);
  for (const invalid of [0, null, undefined, NaN, Infinity]) {
    assert.deepEqual(rowValues(report([{ ...tank, total_observed_volume: invalid }]).rows, "V.C.F. (T-54E) MPMS 11.2.4"), ["-"]);
    if (invalid !== 0) {
      assert.deepEqual(rowValues(report([{ ...tank, standard_gross_volume_at15_c: invalid }]).rows, "V.C.F. (T-54E) MPMS 11.2.4"), ["-"]);
    }
  }
});

test("landscape pages hold at most 16 tanks, with titles, page numbers and complete totals", () => {
  for (const count of [1, 16, 17, 32, 33]) {
    const tanks = Array.from({ length: count }, (_, index) => ({ ...tank, name: String(index + 1) }));
    const { definition, pages, summary } = report(tanks);
    assert.equal(definition.pageOrientation, "landscape");
    assert.equal(pages.length, Math.ceil(count / 16));
    const names = pages.flatMap((page, index) => {
      assert.deepEqual(page.stack[0], { text: "Base report - Test", fontSize: 22, bold: true, margin: [0, 0, 0, 12] });
      assert.equal(page.pageBreak, index === 0 ? undefined : "before");
      const names = rowValues((page.stack[2] as ContentTable).table.body, "Tank Name");
      assert.ok(names.length > 0 && names.length <= 16);
      assert.equal(typeof definition.footer, "function");
      if (typeof definition.footer === "function") {
        assert.deepEqual(definition.footer(index + 1, pages.length, { width: 841.89, height: 595.28, orientation: "landscape" }), {
          text: `Page ${index + 1} of ${pages.length}`, alignment: "center", fontSize: 9, margin: [0, 12, 0, 0],
        });
      }
      return names;
    });
    assert.deepEqual(names, tanks.map((tank) => tank.name));
    assert.equal(text(summary[3][1]), `${(143.635 * count).toFixed(3)} Vac`);
    assert.doesNotMatch(JSON.stringify(summary), /\bMT\b/);
  }
});

test("an empty snapshot has no misleading zero totals or malformed tank table", () => {
  const { definition, pages, summary } = report([]);
  assert.equal(pages.length, 0);
  assert.equal(summary.length, 0);
  assert.match(JSON.stringify(definition), /No data available for the selected date/);
});
