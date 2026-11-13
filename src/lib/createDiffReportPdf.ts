import type { TankMeasurement } from "@/components/tank.types";
import { buildTankReportDefinition } from "@/lib/createSnapshotReportPdf";
import { format } from "date-fns-tz";
import type { Content, ContentStack, TDocumentDefinitions } from "pdfmake/interfaces";

// Kept for consumers of the single-tank comparison helper.
export interface ParamDiff {
  oldValue: number | null;
  newValue: number | null;
  delta: number | null;
  percentChange: number | null;
}

export interface TankDiffReport {
  tank_id: string;
  tank_name: string;
  timestampFrom: Date | string;
  timestampTo: Date | string;
  changes: Partial<Record<string, ParamDiff>>;
}

export const createDiffReportPdf = async (
  startData: TankMeasurement[],
  endData: TankMeasurement[],
  startDate: Date,
  endDate: Date,
) => {
  const definition = buildDiffReportDefinition(startData, endData, startDate, endDate);
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  pdfMake.addVirtualFileSystem(pdfFonts);
  await pdfMake.createPdf(definition)
    .download(`diff_report_${format(new Date(), "dd.MM.yy_HH-mm")}.pdf`);
};

export function buildDiffReportDefinition(
  startData: TankMeasurement[],
  endData: TankMeasurement[],
  startDate: Date,
  endDate: Date,
): TDocumentDefinitions {
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || startDate > endDate) {
    throw new RangeError("The report needs valid start and end dates in chronological order.");
  }

  const startById = new Map(startData.map((tank) => [tank.id, tank]));
  const endById = new Map(endData.map((tank) => [tank.id, tank]));
  // Keep identical columns in all sections, including tanks missing at either date.
  const tanks = [...new Map([...startData, ...endData].map((tank) => [tank.id, tank])).values()];
  const start = buildTankReportDefinition(tanks, {
    title: "Base report (start)",
    dates: [{ label: "Date / Loc. Time", date: startDate }],
    storedTimes: [{ label: "Measured Time", timestamp: (tank) => startById.get(tank.id)?.timestamp }],
    readValue: (tank, value) => {
      const reading = startById.get(tank.id);
      return reading ? value(reading) : null;
    },
  });
  const end = buildTankReportDefinition(tanks, {
    title: "Base report (end)",
    dates: [{ label: "Date / Loc. Time", date: endDate }],
    storedTimes: [{ label: "Measured Time", timestamp: (tank) => endById.get(tank.id)?.timestamp }],
    readValue: (tank, value) => {
      const reading = endById.get(tank.id);
      return reading ? value(reading) : null;
    },
  });
  const difference = buildTankReportDefinition(tanks, {
    title: "Difference (end - start)",
    dates: [
      { label: "Start / Loc. Time", date: startDate },
      { label: "End / Loc. Time", date: endDate },
    ],
    storedTimes: [
      { label: "Start Measured Time", timestamp: (tank) => startById.get(tank.id)?.timestamp },
      { label: "End Measured Time", timestamp: (tank) => endById.get(tank.id)?.timestamp },
    ],
    readValue: (tank, value) => {
      const before = startById.get(tank.id);
      const after = endById.get(tank.id);
      if (!before || !after) return null;
      // Evaluate derived values (VCF, density, total weight) at each date first.
      const oldValue = value(before);
      const newValue = value(after);
      return typeof oldValue === "number" && Number.isFinite(oldValue)
        && typeof newValue === "number" && Number.isFinite(newValue)
        ? newValue - oldValue
        : null;
    },
  });

  return {
    ...start,
    content: [start, end, difference].map((section, index): ContentStack => ({
      stack: section.content as Content[],
      pageBreak: index === 0 ? undefined : "before",
    })),
  };
}
