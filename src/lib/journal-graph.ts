import type uPlot from "uplot";
import type { Option } from "@/components/ui/multiple-selector";
import type { TankParameterData } from "@/components/tank.types";
import type { JournalFilters } from "@/lib/journal-filters";

export type JournalAxis = "left" | "right";
export type JournalAxisParameters = Record<JournalAxis, Option[]>;

export interface JournalGraphParameter {
  value: string;
  label: string;
  axis: JournalAxis;
}

export interface JournalGraphSeries extends JournalGraphParameter {
  data: TankParameterData[];
}

export async function loadJournalGraphData(
  baseURL: string,
  filters: JournalFilters,
  parameters: JournalGraphParameter[],
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const results = await Promise.allSettled(parameters.map(async (parameter) => {
    const query = new URLSearchParams({
      tank: filters.tank,
      start: filters.startDate,
      end: filters.endDate,
      parameter: parameter.value,
    });
    const response = await fetch(`${baseURL}/api/tankDataByParameter?${query}`, {
      signal,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch parameter data: HTTP ${response.status}`);
    }
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Invalid parameter data response");
    return rows as TankParameterData[];
  }));
  // Discard the entire old batch when the filters or selection have changed.
  signal.throwIfAborted();

  const data: Record<string, TankParameterData[]> = {};
  const failures: { parameter: JournalGraphParameter; error: unknown }[] = [];
  results.forEach((result, index) => {
    const parameter = parameters[index];
    if (result.status === "fulfilled") {
      data[parameter.value] = result.value;
    } else {
      failures.push({ parameter, error: result.reason });
    }
  });
  return { data, failures };
}

export function getJournalAxisOptions(options: Option[], otherAxis: Option[]) {
  const unavailable = new Set(otherAxis.map((parameter) => parameter.value));
  return options.map((option) => ({
    ...option,
    disable: !!option.disable || unavailable.has(option.value),
  }));
}

export function setJournalAxisParameters(
  current: JournalAxisParameters,
  axis: JournalAxis,
  selected: Option[],
): JournalAxisParameters {
  const otherAxis = axis === "left" ? "right" : "left";
  const unavailable = new Set(current[otherAxis].map((option) => option.value));
  const accepted = selected.filter((option) => {
    if (option.disable || unavailable.has(option.value)) return false;
    unavailable.add(option.value);
    return true;
  });
  return { ...current, [axis]: accepted.slice(0, 2) };
}

export function buildJournalGraphData(series: JournalGraphSeries[]): uPlot.AlignedData {
  const timestamps = new Set<number>();
  const values = series.map(({ data }) => {
    const samples = new Map<number, number | null>();
    for (const row of data) {
      const timestamp = new Date(row.timestamp).getTime() / 1000;
      if (!Number.isFinite(timestamp)) continue;
      const value = row.parameter == null || String(row.parameter).trim() === ""
        ? NaN
        : Number(row.parameter);
      timestamps.add(timestamp);
      samples.set(timestamp, Number.isFinite(value) ? value : null);
    }
    return samples;
  });
  const x = [...timestamps].sort((a, b) => a - b);
  return [x, ...values.map((samples) => x.map((time) => samples.get(time) ?? null))];
}

export function getJournalPlotSeries(parameters: JournalGraphParameter[]): uPlot.Series[] {
  const colors = {
    left: ["#2563eb", "#16a34a"],
    right: ["#ea580c", "#9333ea"],
  };
  const index = { left: 0, right: 0 };

  return parameters.map((parameter) => ({
    label: parameter.label,
    scale: parameter.axis,
    stroke: colors[parameter.axis][index[parameter.axis]++],
    width: 1.5,
    spanGaps: false,
    value: (_chart, value) => value == null ? "--" : value.toFixed(4),
  }));
}
