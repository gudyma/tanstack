import type { RowInput } from "jspdf-autotable";

import { createColumnHelper } from "@tanstack/react-table";

export async function exportToCSV<gridType>(
  columns: string[],
  gridElement: gridType[],
  fileName: string,
) {
  const csvRows = [
    columns.join(","),
    ...gridElement.map((row: any) => row.join(",")),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToXlsx<gridType>(
  columns: string[],
  gridElement: gridType[],
  fileName: string,
) {
  const [{ utils, writeFile }] = await Promise.all([import("xlsx")]);
  const wb = utils.book_new();
  const ws1 = utils.json_to_sheet(gridElement);
  utils.book_append_sheet(wb, ws1, "Sheet 1");
  const test: string[][] = [];
  test.push(columns);
  utils.sheet_add_aoa(ws1, test, { origin: "A1" });
  writeFile(wb, fileName);
  return true;
}

async function getGridContent<gridType>(
  headerArray: string[],
  gridElement: gridType[],
) {
  return {
    head: getHeader(),
    body: getRows(),
  };

  function getHeader() {
    const test: RowInput[] = [];
    test.push(headerArray);
    return test;
  }

  function getRows() {
    const test: RowInput[] = [];
    gridElement.map((gridRow) => {
      test.push(Object.values(gridRow as any));
    });
    console.log(test);
    return test;
  }
}

export async function exportToPdf<gridType>(
  columns: string[],
  gridElement: gridType[],
  fileName: string,
) {
  const [{ jsPDF }, autoTable, { head, body }] = await Promise.all([
    import("jspdf"),
    (await import("jspdf-autotable")).default,
    await getGridContent(columns, gridElement),
  ]);
  const doc = new jsPDF();
  autoTable(doc, {
    head,
    body,
    horizontalPageBreak: true,
    styles: { cellPadding: 1.5, fontSize: 8, cellWidth: "wrap" },
    tableWidth: "wrap",
  });
  doc.save(fileName);
}
