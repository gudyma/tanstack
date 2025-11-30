import { TDocumentDefinitions, Content } from "pdfmake/interfaces";

// Interfaces (Same as before)
interface ParamDiff {
  oldValue: number | null;
  newValue: number | null;
  delta: number | null;
  percentChange: number | null;
}

interface TankDiffReport {
  tank_id: string;
  timestampFrom: Date | string;
  timestampTo: Date | string;
  changes: Partial<Record<string, ParamDiff>>;
}

export const createDiffReportPdf = async (
  reports: TankDiffReport[],
  filename: string = "tank_diff_report.pdf",
) => {
  // 1. Dynamic Imports
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

  // 2. Handle ES Module Default Exports
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  // 3. Register Fonts (VFS)
  // @ts-ignore: handling diverse internal structures of vfs_fonts
  pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

  // 1. Build the Document Content (Logic is exactly the same)
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: "Звіт", style: "header" },
      {
        text: `Згенеровано: ${new Date().toLocaleString()}`,
        style: "subheader",
      },
      { text: "\n" },
      ...buildReportContent(reports),
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 12, italics: true, color: "gray" },
      tankHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 15, 0, 5],
        color: "#2c3e50",
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: "black",
        fillColor: "#eeeeee",
      },
      diffPositive: { color: "green", bold: true },
      diffNegative: { color: "red", bold: true },
    },
    defaultStyle: { fontSize: 10 },
  };

  // 2. Generate and Download in Browser (The Fix)
  // Instead of fs.createWriteStream, we use .download()
  pdfMake.createPdf(docDefinition).download(filename);
};

// ==========================================
// Helper Functions (Unchanged)
// ==========================================

function buildReportContent(reports: TankDiffReport[]): Content[] {
  const content: Content[] = [];

  if (reports.length === 0) {
    content.push({
      text: "No changes detected between the selected dates.",
      italics: true,
    });
    return content;
  }

  reports.forEach((report) => {
    content.push({ text: `Tank ID: ${report.tank_id}`, style: "tankHeader" });
    content.push({
      text: `Comparison: ${formatDate(report.timestampFrom)} → ${formatDate(report.timestampTo)}`,
      fontSize: 9,
      margin: [0, 0, 0, 5],
    });

    const tableBody = [
      [
        { text: "Параметр", style: "tableHeader" },
        { text: "Було", style: "tableHeader" },
        { text: "Стало", style: "tableHeader" },
        { text: "Різниця", style: "tableHeader" },
        { text: "% Змн", style: "tableHeader" },
      ],
    ];

    Object.entries(report.changes).forEach(([paramName, diff]) => {
      if (!diff) return;

      // Safe access to delta
      const deltaVal = diff.delta ?? 0;
      const deltaStyle =
        deltaVal > 0 ? "diffPositive" : deltaVal < 0 ? "diffNegative" : "";

      tableBody.push([
        { text: formatParamName(paramName), style: "" },
        { text: formatNumber(diff.oldValue), style: "" },
        { text: formatNumber(diff.newValue), style: "" },
        { text: formatNumber(diff.delta, true), style: deltaStyle },
        {
          text: diff.percentChange !== null ? `${diff.percentChange}%` : "-",
          style: "",
        },
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: ["*", "auto", "auto", "auto", "auto"],
        body: tableBody,
      },
      layout: "lightHorizontalLines",
    });
  });

  return content;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(num: number | null, showSign: boolean = false): string {
  if (num === null || num === undefined) return "-";
  const str = num.toFixed(2);
  return showSign && num > 0 ? `+${str}` : str;
}

function formatParamName(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
