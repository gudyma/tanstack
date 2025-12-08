import { TankMeasurement } from "@/components/tank.types";
import { format } from "date-fns-tz";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";

/**
 * Генерує PDF з таблицею стану резервуарів
 * @param data - масив даних, отриманих з SQL запиту
 * @param targetDate - дата, на яку робився запит (для заголовка)
 */
export const createSnapshotReportPdf = async (
  data: TankMeasurement[],
  targetDate: string = "Задана дата",
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
  // 1. Визначення вмісту документу
  const docDefinition: TDocumentDefinitions = {
    // ВАЖЛИВО: Альбомна орієнтація, щоб вмістити більше колонок
    pageOrientation: "landscape",

    content: [
      { text: "Стан резервуарного парку", style: "header" },
      { text: `Зріз даних найближчий до: ${targetDate}`, style: "subheader" },
      {
        text: `Згенеровано: ${new Date().toLocaleString("uk-UA")}`,
        style: "small",
      },
      { text: "\n" }, // Відступ

      // Побудова таблиці
      buildTable(data),
    ],

    // Стилі
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
      subheader: { fontSize: 12, italics: true, margin: [0, 0, 0, 2] },
      small: { fontSize: 8, color: "gray", margin: [0, 0, 0, 10] },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: "black",
        fillColor: "#eeeeee",
        alignment: "center",
      },
      tableCell: { fontSize: 9, color: "#333333", alignment: "center" },
    },

    // Колонтитули (Footer) з номерами сторінок
    footer: function (currentPage, pageCount) {
      return {
        text: `Сторінка ${currentPage} з ${pageCount}`,
        alignment: "center",
        fontSize: 8,
        margin: [0, 10, 0, 0],
      };
    },
  };

  // 2. Генерація та завантаження
  pdfMake
    .createPdf(docDefinition)
    .download(`base_report_${format(new Date(), "dd.MM.yy_HH-mm")}.pdf`);
};

// ==========================================
// Допоміжні функції
// ==========================================

function buildTable(data: TankMeasurement[]): Content {
  if (!data || data.length === 0) {
    return { text: "Немає даних для відображення", italics: true };
  }

  return {
    table: {
      // Визначаємо ширину колонок
      // 'auto' - по вмісту, '*' - займає весь доступний простір
      widths: [
        65, // Tank ID
        85, // Timestamp
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
      ],
      headerRows: 1,
      body: [
        // 1. Заголовок таблиці (Українською)
        [
          { text: "Резервуар", style: "tableHeader" },
          { text: "Час виміру", style: "tableHeader" },
          { text: "Рівень\n(мм)", style: "tableHeader" },
          { text: "Темп.\n прод.(°C)", style: "tableHeader" },
          { text: "Темп.\n ПФ(°C)", style: "tableHeader" },
          { text: "Тиск\n(bar)", style: "tableHeader" },
          { text: "Об'єм\n(м³)", style: "tableHeader" },
          { text: "Об'єм\n віл.(м³)", style: "tableHeader" },
          { text: "Об'єм\n 15°C(м³)", style: "tableHeader" },
          { text: "Густина\n(т/м³)", style: "tableHeader" },
          { text: "Маса\n прод. (т)", style: "tableHeader" },
          { text: "Маса\n ПФ (т)", style: "tableHeader" },
          { text: "Маса\n заг (т)", style: "tableHeader" },
        ],
        // 2. Дані (map)
        ...data.map((row, index) => {
          // Чергування кольорів рядків (Zebra striping)
          const fillColor = index % 2 === 0 ? "#ffffff" : "#f4f6f6";

          return [
            { text: row.name, style: "tableCell", fillColor },
            {
              text: row.timestamp ? formatDate(row.timestamp) : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.product_level ? formatNum(row.product_level, 1) : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.product_temperature
                ? formatNum(row.product_temperature, 1)
                : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.free_temperature
                ? formatNum(row.free_temperature, 1)
                : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.pressure ? formatNum(row.pressure, 3) : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.gross_observed_volume
                ? formatNum(row.gross_observed_volume, 0)
                : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.vapor_gross_observed_volume
                ? formatNum(row.vapor_gross_observed_volume, 0)
                : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.standard_gross_volume_at15_c
                ? formatNum(row.standard_gross_volume_at15_c, 0)
                : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.observed_density
                ? formatNum(row.observed_density, 3)
                : "-",
              style: "tableCell",
              fillColor,
            },
            {
              text: row.product_mass ? formatNum(row.product_mass, 0) : "-",
              style: "tableCell",
              bold: true,
              fillColor,
            },
            {
              text: row.vapor_gross_mass
                ? formatNum(row.vapor_gross_mass, 0)
                : "-",
              style: "tableCell",
              bold: true,
              fillColor,
            },
            {
              text: row.gas_product_mass
                ? formatNum(row.gas_product_mass, 0)
                : "-",
              style: "tableCell",
              bold: true,
              fillColor,
            },
          ];
        }),
      ],
    },
    layout: "lightHorizontalLines",
  };
}

// Форматування дати у звичний формат
export function formatDate(date: string | Date): string {
  if (!date) return "-";
  const d = new Date(date);
  // Формат: 30.11 14:30
  return d.toLocaleString("uk-UA", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Безпечне форматування чисел
function formatNum(num: number | null, decimals: number): string {
  if (num === null || num === undefined) return "-";
  return num.toFixed(decimals);
}
