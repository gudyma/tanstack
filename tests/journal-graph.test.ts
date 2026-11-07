import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildJournalGraphData,
  getJournalAxisOptions,
  getJournalPlotSeries,
  setJournalAxisParameters,
  type JournalAxisParameters,
  type JournalGraphSeries,
} from "../src/lib/journal-graph";

const options = [
  { value: "product_level", label: "Level" },
  { value: "sediment_level", label: "Sediment" },
  { value: "product_temperature", label: "Temperature" },
  { value: "pressure", label: "Pressure" },
];

test("each axis accepts two different parameters and rejects a third or duplicates", () => {
  let selected: JournalAxisParameters = { left: [], right: [] };
  selected = setJournalAxisParameters(selected, "left", [options[0], options[0], options[1], options[2]]);
  selected = setJournalAxisParameters(selected, "right", options);
  assert.deepEqual(selected.left, options.slice(0, 2));
  assert.deepEqual(selected.right, options.slice(2));
});

test("selected parameters are disabled on the opposite axis and reenabled on removal", () => {
  let selected: JournalAxisParameters = { left: [options[0]], right: [options[2]] };
  assert.deepEqual(getJournalAxisOptions(options, selected.left).map((option) => option.disable), [true, false, false, false]);
  assert.deepEqual(getJournalAxisOptions(options, selected.right).map((option) => option.disable), [false, false, true, false]);

  selected = setJournalAxisParameters(selected, "left", []);
  assert.equal(getJournalAxisOptions(options, selected.left)[0].disable, false);
  selected = setJournalAxisParameters(selected, "right", [options[2], options[0]]);
  assert.equal(getJournalAxisOptions(options, selected.right)[0].disable, true);
  // A stale event from the other selector must not create a duplicate.
  selected = setJournalAxisParameters(selected, "left", [options[0], options[1]]);
  assert.deepEqual(selected.left, [options[1]]);
});

test("intrinsically disabled options remain disabled even when neither axis uses them", () => {
  const disabled = { ...options[0], disable: true };
  assert.equal(getJournalAxisOptions([disabled], [])[0].disable, true);
  assert.deepEqual(setJournalAxisParameters({ left: [], right: [] }, "right", [disabled]).right, []);
});

const time = (second: number) => new Date(Date.UTC(2026, 10, 7, 12, 0, second)).toISOString();
const series: JournalGraphSeries[] = options.map((option, index) => ({
  ...option,
  axis: index < 2 ? "left" : "right",
  data: [],
}));

test("aligns all four parameters by timestamp without shifting missing readings", () => {
  const data = buildJournalGraphData([
    { ...series[0], data: [{ timestamp: time(2), parameter: "12" }, { timestamp: time(0), parameter: "0" }] },
    { ...series[1], data: [{ timestamp: time(1), parameter: "5" }] },
    { ...series[2], data: [{ timestamp: time(0), parameter: "24.5" }, { timestamp: time(2), parameter: null }] },
    { ...series[3], data: [{ timestamp: time(2), parameter: 1.2 }] },
  ]);
  assert.deepEqual(data, [
    [0, 1, 2].map((second) => Date.parse(time(second)) / 1000),
    [0, null, 12],
    [null, 5, null],
    [24.5, null, null],
    [null, null, 1.2],
  ]);
});

test("keeps missing and invalid measurements as gaps and ignores invalid timestamps", () => {
  const data = buildJournalGraphData([{ ...series[0], data: [
    { timestamp: "invalid", parameter: "42" },
    { timestamp: time(0), parameter: "" },
    { timestamp: time(1), parameter: "NaN" },
    { timestamp: time(2), parameter: "Infinity" },
    { timestamp: time(3), parameter: "0" },
  ] }]);
  assert.deepEqual(data[0], [0, 1, 2, 3].map((second) => Date.parse(time(second)) / 1000));
  assert.deepEqual(data[1], [null, null, null, 0]);
});

test("supports no parameters, empty series, and selections only on the right axis", () => {
  assert.deepEqual(buildJournalGraphData([]), [[]]);
  assert.deepEqual(buildJournalGraphData(series), [[], [], [], [], []]);
  assert.deepEqual(getJournalPlotSeries(series.slice(2)).map((item) => item.scale), ["right", "right"]);
});

test("maps each of the four legend entries to its axis and a distinct color", () => {
  const plotted = getJournalPlotSeries(series);
  assert.deepEqual(plotted.map((item) => item.scale), ["left", "left", "right", "right"]);
  assert.deepEqual(plotted.map((item) => item.label), options.map((option) => option.label));
  assert.equal(new Set(plotted.map((item) => item.stroke)).size, 4);
});
