import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  constructHeader,
  flexRender,
  functionalUpdate,
  useTable,
  type ReactTable,
  type TableFeatures,
  type TableOptions,
} from "@tanstack/react-table";
import { journalTableFeatures } from "../src/lib/journal-table-features";
import { tankTableFeatures } from "../src/lib/tank-table-features";
import type { TankInfoExtendedWithGrouping } from "../src/i18n/dictionaries/columnsInterfaces";
import * as en from "../src/i18n/dictionaries/en-columns";
import * as uk from "../src/i18n/dictionaries/uk-columns";
import TablePagination from "../src/components/table-pagination";

type MeasurementTable = ReactTable<
  typeof tankTableFeatures,
  TankInfoExtendedWithGrouping
>;
type MeasurementOptions = TableOptions<
  typeof tankTableFeatures,
  TankInfoExtendedWithGrouping
>;
type JournalOptions = TableOptions<
  typeof journalTableFeatures,
  TankInfoExtendedWithGrouping
>;

const data = [
  { id: "10", name: "Tank 10", park: "A", product: "Diesel", volume: 12.5 },
  { id: "2", name: "Tank 2", park: "A", product: "Diesel", volume: 7.25 },
  { id: "1", name: "Tank 1", park: "B", product: "Petrol", volume: 3 },
].map((row, index) => ({
  ...row,
  tankName: row.name,
  label: row.name,
  status: "normal" as const,
  timestamp: new Date(Date.UTC(2026, 8, 14, 12, index)),
  Timestamp: new Date(Date.UTC(2026, 8, 14, 12, index)),
  total_observed_volume: row.volume,
  TotalObservedVolume: row.volume,
}));

function createTable<TFeatures extends TableFeatures>(
  options: TableOptions<TFeatures, TankInfoExtendedWithGrouping>,
) {
  const captured: {
    table?: ReactTable<TFeatures, TankInfoExtendedWithGrouping>;
  } = {};
  function Harness() {
    captured.table = useTable(options);
    return null;
  }
  renderToStaticMarkup(<Harness />);
  assert.ok(captured.table);
  return captured.table;
}

function createTankTable(options: Partial<MeasurementOptions> = {}) {
  return createTable({
    features: tankTableFeatures,
    columns: uk.tankTableColumns,
    data,
    ...options,
  });
}

function createJournalTable(options: Partial<JournalOptions> = {}) {
  return createTable({
    features: journalTableFeatures,
    columns: uk.journalColumns,
    data,
    ...options,
  });
}

function getColumn(table: MeasurementTable, id: string) {
  const column = table.getColumn(id);
  assert.ok(column, `Expected column ${id}`);
  return column;
}

for (const [locale, dictionary, nameId, parkId, volumeId] of [
  ["uk", uk, "Name", "Park", "TOV_m3"],
  ["en", en, "label", "park", "TOV, m³"],
] as const) {
  test(`${locale}: sorts tank names naturally and measurements numerically`, () => {
    const table = createTankTable({ columns: dictionary.tankTableColumns });
    getColumn(table, nameId).toggleSorting(false);
    assert.deepEqual(
      table.getRowModel().rows.map((row) => row.original.id),
      ["1", "2", "10"],
    );
    getColumn(table, volumeId).toggleSorting(true);
    assert.deepEqual(
      table.getRowModel().rows.map((row) => row.original.id),
      ["10", "2", "1"],
    );
  });

  test(`${locale}: groups, sums and expands tank measurements`, () => {
    const table = createTankTable({ columns: dictionary.tankTableColumns });
    table.setGrouping([parkId]);
    const groups = table.getRowModel().rows;
    assert.equal(groups.length, 2);
    const group = groups.find((row) => row.getValue(parkId) === "A");
    assert.ok(group);
    assert.equal(group.getValue(volumeId), 19.75);
    const cell = group
      .getAllCells()
      .find((cell) => cell.column.id === volumeId);
    assert.ok(cell);
    assert.ok(cell.getIsAggregated());
    assert.equal(
      renderToStaticMarkup(
        <>
          {flexRender(cell.column.columnDef.aggregatedCell, cell.getContext())}
        </>,
      ),
      locale === "uk" ? "19.750" : "19.75",
    );
    group.toggleExpanded();
    assert.equal(table.getRowModel().rows.length, 4);
    group.toggleExpanded();
    assert.equal(table.getRowModel().rows.length, 2);
  });

  test(`${locale}: preserves server pagination and single-row selection`, () => {
    let pagination = { pageIndex: 1, pageSize: 100 };
    const table = createJournalTable({
      columns: dictionary.journalColumns,
      manualPagination: true,
      pageCount: 4,
      state: { pagination },
      enableRowSelection: true,
      enableMultiRowSelection: false,
      onPaginationChange: (updater) => {
        pagination = functionalUpdate(updater, pagination);
        table.setOptions((previous) => ({
          ...previous,
          state: { pagination },
        }));
      },
    });
    // These rows already belong to page 2; client pagination must not slice them.
    assert.equal(table.getRowModel().rows.length, data.length);
    table.nextPage();
    assert.equal(pagination.pageIndex, 2);
    table.setPageSize(200);
    assert.equal(pagination.pageSize, 200);
    table.setPageIndex(3);
    assert.equal(table.getCanNextPage(), false);
    const rows = table.getRowModel().rows;
    rows[0].toggleSelected();
    rows[1].toggleSelected();
    assert.equal(rows[0].getIsSelected(), false);
    assert.equal(rows[1].getIsSelected(), true);
    assert.equal(table.getSelectedRowModel().rows.length, 1);
  });

  test(`${locale}: renders and adjusts history columns without aggregation`, () => {
    let visibility = { [volumeId]: false };
    const table = createJournalTable({
      columns: dictionary.journalColumns,
      state: { columnVisibility: visibility },
      onColumnVisibilityChange: (updater) => {
        visibility = functionalUpdate(updater, visibility);
        table.setOptions((previous) => ({
          ...previous,
          state: { columnVisibility: visibility },
        }));
      },
    });
    const column = table.getColumn(volumeId);
    assert.ok(column);
    assert.equal(column.getIsVisible(), false);
    const hiddenHeader = constructHeader(table, column, { index: 0, depth: 0 });
    assert.ok(
      renderToStaticMarkup(
        <>{flexRender(column.columnDef.header, hiddenHeader.getContext())}</>,
      ),
    );
    column.toggleVisibility(true);
    assert.equal(visibility[volumeId], true);
    table.setColumnSizing({ [volumeId]: 180 });
    assert.equal(column.getSize(), 180);
    const header = table
      .getFlatHeaders()
      .find((header) => header.column.id === volumeId);
    assert.ok(header);
    assert.equal(typeof header.getResizeHandler(), "function");

    for (const column of table.getAllLeafColumns()) {
      assert.equal("aggregationFn" in column.columnDef, false);
      assert.equal("aggregatedCell" in column.columnDef, false);
      assert.equal("enableGrouping" in column.columnDef, false);
    }
    const rows = table.getRowModel().rows;
    assert.deepEqual(
      rows.map((row) => row.original.id),
      data.map((row) => row.id),
    );
    const markup = renderToStaticMarkup(
      <>
        {rows[0].getVisibleCells().map((cell) => (
          <span key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </span>
        ))}
      </>,
    );
    assert.match(markup, /12\.5/);
    assert.match(markup, /14\.09\.26/);
  });

  test(`${locale}: renders REST measurements with default journal cells`, () => {
    const measurements = [
      {
        product_level: 1234.5,
        product_temperature: -6.5,
        sediment_level: 12,
      },
      { product_level: 0, product_temperature: 0, sediment_level: 0 },
      {
        product_level: "1250.25",
        product_temperature: "19.5",
        sediment_level: "2",
      },
      {
        product_level: null,
        product_temperature: null,
        sediment_level: null,
      },
      {
        product_level: undefined,
        product_temperature: undefined,
        sediment_level: undefined,
      },
    ];
    const table = createJournalTable({
      columns: dictionary.journalColumns,
      data: measurements.map((measurement, index) => ({
        ...data[0],
        ...measurement,
        id: String(index),
      })),
      manualPagination: true,
    });

    for (const [index, row] of table.getRowModel().rows.entries()) {
      for (const accessorKey of [
        "product_level",
        "product_temperature",
        "sediment_level",
      ] as const) {
        const cell = row.getVisibleCells().find(
          ({ column }) =>
            "accessorKey" in column.columnDef &&
            column.columnDef.accessorKey === accessorKey,
        );
        assert.ok(cell, `Expected a visible ${accessorKey} cell`);
        const expected = measurements[index][accessorKey];
        assert.equal(cell.getValue(), expected);
        assert.equal(
          renderToStaticMarkup(
            <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>,
          ),
          expected == null ? "" : String(expected),
          `${accessorKey} should render its REST value`,
        );
      }
    }
  });

  test(`${locale}: hides, restores, orders and sizes tank columns`, () => {
    const table = createTankTable({ columns: dictionary.tankTableColumns });
    const column = getColumn(table, nameId);
    const originalCellCount = table
      .getRowModel()
      .rows[0].getVisibleCells().length;
    column.toggleVisibility(false);
    assert.equal(
      table.getRowModel().rows[0].getVisibleCells().length,
      originalCellCount - 1,
    );
    const hiddenHeader = constructHeader(table, column, {
      index: 0,
      depth: column.depth,
    });
    assert.ok(
      renderToStaticMarkup(
        <>{flexRender(column.columnDef.header, hiddenHeader.getContext())}</>,
      ),
    );
    column.toggleVisibility(true);
    assert.equal(
      table.getRowModel().rows[0].getVisibleCells().length,
      originalCellCount,
    );
    table.setColumnOrder([volumeId, nameId]);
    assert.equal(table.getAllLeafColumns()[0].id, volumeId);
    table.setColumnSizing({ [nameId]: 150 });
    assert.equal(column.getSize(), 150);
    const header = table
      .getFlatHeaders()
      .find((header) => header.column.id === nameId);
    assert.ok(header);
    assert.equal(header.getSize(), 150);
    assert.equal(typeof header.getResizeHandler(), "function");
  });

  test(`${locale}: renders every localized header and measurement cell`, () => {
    const table = createTankTable({ columns: dictionary.tankTableColumns });
    const markup = renderToStaticMarkup(
      <table>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>,
    );
    assert.match(markup, /Tank 10/);
    assert.match(markup, /12\.5/);
  });
}

test("history has no sorting, grouping, filtering, expansion or pinning APIs", () => {
  const table = createJournalTable();
  for (const unusedApi of [
    "setSorting",
    "setGrouping",
    "setExpanded",
    "setColumnOrder",
    "setColumnFilters",
    "setGlobalFilter",
    "setColumnPinning",
  ]) {
    assert.equal(
      unusedApi in table,
      false,
      `${unusedApi} should not be included in history`,
    );
  }
});

test("the live tank table has no history pagination or selection APIs", () => {
  const table = createTankTable();
  for (const unusedApi of [
    "setPagination",
    "setRowSelection",
    "setColumnFilters",
    "setGlobalFilter",
    "setColumnPinning",
  ]) {
    assert.equal(
      unusedApi in table,
      false,
      `${unusedApi} should not be included in the live tank table`,
    );
  }
});

test("pagination controls render the selected v9 state", () => {
  const table = createJournalTable({
    manualPagination: true,
    pageCount: 4,
    state: { pagination: { pageIndex: 1, pageSize: 100 } },
  });
  const markup = renderToStaticMarkup(
    <TablePagination
      table={table}
      exportHeaders={[]}
      dictionary={{
        export: "Export",
        exportPdf: "PDF",
        exportXlsx: "Excel",
        page: "Page",
        goTo: "Go to",
        show: "Show",
      }}
    />,
  );
  assert.match(markup, /value="2"/);
  assert.match(markup, /max="4"/);
});
