import { TDocumentDefinitions, Content } from "pdfmake/interfaces";

export interface TankSnapshot {
  tank_id: string; // Або t.id
  timestamp: string | Date;

  // Основні параметри
  product_level: number | null;
  product_mass: number | null;
  product_temperature: number | null;
  observed_density: number | null;
  gross_observed_volume: number | null;
  pressure: number | null;
}

/**
 * Генерує PDF з таблицею стану резервуарів
 * @param data - масив даних, отриманих з SQL запиту
 * @param targetDate - дата, на яку робився запит (для заголовка)
 */
export const createSnapshotReportPdf = async (
  data: TankSnapshot[],
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
      },
      tableCell: { fontSize: 9, color: "#333333", alignment: "center" },
      tankId: { fontSize: 8, color: "#555555", alignment: "left" }, // ID зазвичай довгий, зменшуємо шрифт
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
    .download(`tank_report_${new Date().getTime()}.pdf`);
};

// ==========================================
// Допоміжні функції
// ==========================================

function buildTable(data: TankSnapshot[]): Content {
  if (!data || data.length === 0) {
    return { text: "Немає даних для відображення", italics: true };
  }

  return {
    table: {
      // Визначаємо ширину колонок
      // 'auto' - по вмісту, '*' - займає весь доступний простір
      widths: [
        120, // Tank ID
        85, // Timestamp
        "auto", // Рівень
        "auto", // Температура
        "auto", // Густина
        "auto", // Об'єм
        "auto", // Тиск
        "*", // Маса (важливий показник, даємо місце)
      ],
      headerRows: 1,
      body: [
        // 1. Заголовок таблиці (Українською)
        [
          { text: "Резервуар (ID)", style: "tableHeader" },
          { text: "Час виміру", style: "tableHeader" },
          { text: "Рівень\n(мм)", style: "tableHeader" },
          { text: "Темп.\n(°C)", style: "tableHeader" },
          { text: "Густина\n(кг/м³)", style: "tableHeader" },
          { text: "Об'єм\n(л)", style: "tableHeader" },
          { text: "Тиск\n(МПа)", style: "tableHeader" },
          { text: "Маса\n(кг)", style: "tableHeader" },
        ],
        // 2. Дані (map)
        ...data.map((row, index) => {
          // Чергування кольорів рядків (Zebra striping)
          const fillColor = index % 2 === 0 ? "#ffffff" : "#f4f6f6";

          return [
            { text: row.tank_id, style: "tankId", fillColor },
            { text: formatDate(row.timestamp), style: "tableCell", fillColor },
            {
              text: formatNum(row.product_level, 1),
              style: "tableCell",
              fillColor,
            },
            {
              text: formatNum(row.product_temperature, 1),
              style: "tableCell",
              fillColor,
            },
            {
              text: formatNum(row.observed_density, 3),
              style: "tableCell",
              fillColor,
            },
            {
              text: formatNum(row.gross_observed_volume, 0),
              style: "tableCell",
              fillColor,
            },
            { text: formatNum(row.pressure, 3), style: "tableCell", fillColor },
            // Масу виділимо жирним, бо це часто головний показник
            {
              text: formatNum(row.product_mass, 0),
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
function formatDate(date: string | Date): string {
  if (!date) return "-";
  const d = new Date(date);
  // Формат: 30.11 14:30
  return d.toLocaleString("uk-UA", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Безпечне форматування чисел
function formatNum(num: number | null, decimals: number): string {
  if (num === null || num === undefined) return "-";
  return num.toFixed(decimals);
}
