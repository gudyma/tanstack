import type { TankMeasurement } from "@/components/tank.types";
import { format } from "date-fns-tz";
import type {
  Content,
  CustomTableLayout,
  TableCell,
  TDocumentDefinitions,
} from "pdfmake/interfaces";

const TANKS_PER_PAGE = 16;
const LABEL_WIDTH = 132;
const PAGE_WIDTH = 841.89; // A4 landscape, in points.
const PAGE_MARGIN = 36;
const tableLayout: CustomTableLayout = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => "black",
  vLineColor: () => "black",
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 2,
  paddingBottom: () => 2,
};

type MeasurementValue = number | null | undefined;
type ReportRow = {
  label: string;
  value: (tank: TankMeasurement) => MeasurementValue;
  decimals: number;
};

const liquidRows: ReportRow[] = [
  { label: "Liquid Level (mm)", value: (tank) => tank.product_level, decimals: 0 },
  { label: "Temperature (°C)", value: (tank) => tank.product_temperature, decimals: 2 },
  { label: "Liquid Volume (m³)", value: (tank) => tank.total_observed_volume, decimals: 3 },
  {
    label: "V.C.F. (T-54E) MPMS 11.2.4",
    value: (tank) => {
      const correctedVolume = tank.standard_gross_volume_at15_c;
      const observedVolume = tank.total_observed_volume;
      return isNumber(correctedVolume) && isNumber(observedVolume) && observedVolume !== 0
        ? correctedVolume / observedVolume
        : null;
    },
    decimals: 5,
  },
  {
    label: "Corrected Volume\n(at 15 °C) (m³)",
    value: (tank) => tank.standard_gross_volume_at15_c,
    decimals: 3,
  },
  {
    label: "Density at 15",
    value: (tank) => {
      const mass = tank.standard_gross_mass_in_vacuume;
      const volume = tank.standard_gross_volume_at15_c;
      return isNumber(mass) && isNumber(volume) && volume !== 0
        ? mass / volume
        : null;
    },
    decimals: 4,
  },
  {
    label: "Liquid Weight\nvacuum (tons)",
    value: (tank) => tank.standard_gross_mass_in_vacuume,
    decimals: 3,
  },
];

const vapourRows: ReportRow[] = [
  { label: "Vapour Pressure\n(bar)", value: (tank) => tank.pressure, decimals: 3 },
  { label: "Molar Mass", value: (tank) => tank.molar_mass, decimals: 3 },
  { label: "Vapour Temperature\n(°C)", value: (tank) => tank.free_temperature, decimals: 2 },
  { label: "Vapour Volume (m³)", value: (tank) => tank.vapor_gross_observed_volume, decimals: 3 },
  {
    label: "Vapour Weight\nvacuum (tons)",
    value: (tank) => tank.vapor_gross_mass_in_vacuume,
    decimals: 3,
  },
  {
    label: "Totals",
    value: (tank) => addMeasurements(
      tank.standard_gross_mass_in_vacuume,
      tank.vapor_gross_mass_in_vacuume,
    ),
    decimals: 3,
  },
];

export const createSnapshotReportPdf = async (
  data: TankMeasurement[],
  targetDate: Date = new Date(),
) => {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  pdfMake.addVirtualFileSystem(pdfFonts);
  await pdfMake
    .createPdf(buildSnapshotReportDefinition(data, targetDate))
    .download(`base_report_${format(new Date(), "dd.MM.yy_HH-mm")}.pdf`);
};

export function buildSnapshotReportDefinition(
  data: TankMeasurement[],
  targetDate: Date,
): TDocumentDefinitions {
  const content: Content[] = [];
  console.log(data)
  const parkName = [...new Set(data.map((tank) => tank.park?.trim()).filter(Boolean))].join(", ");

  if (data.length === 0) {
    content.push(buildReportHeading(parkName), buildDateHeader(targetDate), {
      text: "No data available for the selected date.",
      italics: true,
      margin: [0, 8, 0, 0],
    });
  }

  for (let index = 0; index < data.length; index += TANKS_PER_PAGE) {
    const tanks = data.slice(index, index + TANKS_PER_PAGE);
    content.push({
      stack: [buildReportHeading(parkName), buildDateHeader(targetDate), buildTankTable(tanks)],
      pageBreak: index === 0 ? undefined : "before",
    });
  }

  if (data.length > 0) content.push(buildSummary(data));

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [PAGE_MARGIN, PAGE_MARGIN, PAGE_MARGIN, PAGE_MARGIN],
    defaultStyle: { fontSize: 9, color: "black" },
    content,
    footer: (currentPage, pageCount) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: "center",
      fontSize: 9,
      margin: [0, 12, 0, 0],
    }),
  };
}

function buildReportHeading(parkName: string): Content {
  return {
    text: parkName ? `Base report - ${parkName}` : "Base report",
    fontSize: 22,
    bold: true,
    margin: [0, 0, 0, 12],
  };
}

function buildDateHeader(targetDate: Date): Content {
  return {
    table: {
      widths: [LABEL_WIDTH, 105, 35, 65, "*"],
      body: [[
        { text: "Date / Loc. Time" },
        { text: format(targetDate, "dd.MM.yyyy"), alignment: "center" },
        { text: "at", alignment: "center" },
        { text: format(targetDate, "HH:mm"), alignment: "center" },
        { text: "hrs." },
      ]],
    },
    layout: tableLayout,
  };
}

function buildTankTable(tanks: TankMeasurement[]): Content {
  const compact = tanks.length > 12;
  const tankPadding = compact ? 2 : 4;
  // Fixed widths prevent a long reading from widening every tank column.
  const tankWidth = (PAGE_WIDTH - 2 * PAGE_MARGIN - LABEL_WIDTH - 8
    - (tanks.length + 2) * 0.5) / tanks.length - 2 * tankPadding;
  const section = (label: string): TableCell[] => [
    {
      text: label,
      bold: true,
      colSpan: tanks.length + 1,
      border: [false, false, false, false],
    },
    ...tanks.map(() => ({})),
  ];
  const rows = (definitions: ReportRow[]): TableCell[][] => definitions.map(
    ({ label, value, decimals }) => [
      { text: label },
      ...tanks.map((tank): TableCell => {
        const text = formatNum(value(tank), decimals);
        return {
          text,
          alignment: "center",
          fontSize: Math.min(compact ? 8 : 9, tankWidth / (text.length * 0.6)),
        };
      }),
    ],
  );

  return {
    table: {
      widths: [LABEL_WIDTH, ...tanks.map(() => tankWidth)],
      headerRows: 1,
      dontBreakRows: true,
      body: [
        [
          { text: "Tank Name", bold: true, alignment: "center" },
          ...tanks.map((tank): TableCell => ({
            text: tank.name || tank.label || tank.id,
            bold: true,
            alignment: "center",
            fontSize: compact ? 8 : 9,
          })),
        ],
        section("Liquid Phase"),
        ...rows(liquidRows),
        section("Vapour Phase"),
        ...rows(vapourRows),
      ],
    },
    layout: {
      ...tableLayout,
      hLineWidth: (index) => index === 0 ? 0 : 0.5,
      paddingLeft: (index) => index > 0 ? tankPadding : 4,
      paddingRight: (index) => index > 0 ? tankPadding : 4,
    },
  };
}

function buildSummary(tanks: TankMeasurement[]): Content {
  const liquid = sumMeasurements(tanks.map((tank) => tank.standard_gross_mass_in_vacuume));
  const vapour = sumMeasurements(tanks.map((tank) => tank.vapor_gross_mass_in_vacuume));
  const air = sumMeasurements(tanks.map((tank) => tank.gas_product_mass));
  const weight = (value: MeasurementValue, unit: string): TableCell => ({
    text: `${formatNum(value, 3)} ${unit}`,
    alignment: "center",
  });

  return {
    margin: [0, 14, 0, 0],
    table: {
      widths: ["*", "*"],
      dontBreakRows: true,
      body: [
        [{ text: "Total liquid :", alignment: "right" }, weight(liquid, "Vac")],
        [{ text: "Total vapour :", alignment: "right" }, weight(vapour, "Vac")],
        [{ text: " ", colSpan: 2 }, {}],
        [
          { text: "TOTAL :", alignment: "right", decoration: "underline", rowSpan: 2, margin: [0, 7, 0, 0] },
          weight(addMeasurements(liquid, vapour), "Vac"),
        ],
        [{}, weight(air, "Air")],
      ],
    },
    layout: tableLayout,
  };
}

function isNumber(value: MeasurementValue): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function addMeasurements(left: MeasurementValue, right: MeasurementValue): number | null {
  return isNumber(left) && isNumber(right) ? left + right : null;
}

function sumMeasurements(values: MeasurementValue[]): number | null {
  // A missing reading must not silently lower a reported total.
  return values.reduce<number | null>((sum, value) => addMeasurements(sum, value), 0);
}

function formatNum(value: MeasurementValue, decimals: number): string {
  return isNumber(value) ? value.toFixed(decimals) : "-";
}

export function formatDate(date: string | Date): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("uk-UA", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
