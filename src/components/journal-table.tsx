import { useEffect, useMemo, useState } from "react";

import { format } from "date-fns";

import {
  type ColumnDef,
  type ColumnResizeMode,
  type PaginationState,
  type Table as ReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { TankInfoExtendedWithGrouping } from "@/i18n/dictionaries/columnsInterfaces";

import TablePagination from "@/components/table-pagination";

import { journalExportHeaders } from "@/i18n/dictionaries/en-columns";
import { getJournalColumns } from "@/i18n/dictionaries/get-dictionary";
import TankComponent from "@/components/tank-component";
import { type TankMeasurement } from "@/components/tank.types";
import { toast } from "sonner";
import { ColumnVisibilityMenu } from "@/components/column-visibility-menu";

// Key for localStorage persistence
const VISIBILITY_STORAGE_KEY = "journal-table-column-visibility";

export default function JournalTable({
  dictionary,
  lang,
  tank,
  startDate,
  endDate,
}: {
  dictionary?: any;
  lang: any;
  tank?: string;
  startDate?: string;
  endDate?: string;
}) {
  const empty: ColumnDef<TankInfoExtendedWithGrouping>[] = [];
  const [testcolumns, setColumns] = useState(empty);
  const [columnResizeMode, setColumnResizeMode] =
    useState<ColumnResizeMode>("onChange");

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });

  const [rowSelection, setRowSelection] = useState({});

  const [tankData, setTankData] = useState<TankMeasurement>();
  const [pageCount, setPageCount] = useState(0);
  const [data, setData] = useState();

  useEffect(() => {
    getJournalColumns(lang).then((value) => {
      setColumns(value);
    });
  }, [lang]);

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(VISIBILITY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Default: hide park and product column initially
      return { park: false, product: false };
    } catch (error) {
      console.warn(
        `Error loading localStorage key "${VISIBILITY_STORAGE_KEY}":`,
        error,
      );
      return;
    }
  });

  // Save visibility whenever it changes
  useEffect(() => {
    localStorage.setItem(
      VISIBILITY_STORAGE_KEY,
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);

  const defaultData = useMemo(() => {
    return [];
  }, []);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const table = useReactTable({
    data: data ?? defaultData,
    columns: testcolumns,
    columnResizeMode,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    //
    debugTable: false,
  });

  const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    if (tank) {
      fetch(
        baseUrl +
          `/api/tankDataCount?tank=${tank}&start=${startDate}&end=${endDate}`,
      )
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch count");
          return res.json();
        })
        .then((cres) => {
          const count = cres.count;
          const query =
            baseUrl +
            `/api/tankData?tank=${tank}&start=${startDate}&end=${endDate}&limit=${pageSize}&offset=${pageSize * pageIndex}`;
          return fetch(query)
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch tank data");
              return res.json();
            })
            .then((data) => {
              console.log(
                `Fetched info for ${tank} from ${startDate} to ${endDate}`,
              );
              toast.info(`${format(Date(), "HH:mm:ss")}: Дані оновлено`);
              setData(data);
              setPageCount(Math.ceil(count / pageSize));
            });
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    }
  }, [tank, startDate, endDate, pageIndex, pageSize]);

  return (
    <div className="flex w-full flex-wrap">
      <div className="flex h-[80vh] w-80 min-w-full flex-auto md:min-w-[600px]">
        <div className="flex h-full w-full flex-col p-0 md:px-2">
          <div className="h-full overflow-auto whitespace-nowrap rounded-md border pb-2 shadow-md bg-background">
            <table
              id="my-table"
              {...{
                style: {
                  width: table.getTotalSize(),
                },
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-secondary text-sm">
                    {headerGroup.headers.map((header, index) => {
                      return (
                        <th
                          key={header.id}
                          {...{
                            style: {
                              width: header.getSize(),
                              zIndex: index === 0 ? 3 : 2,
                            },
                            className: `sticky h-8  px-2  top-0 border-r bg-muted ${
                              index === 0 ? "left-0 font-bold" : "font-medium"
                            }`,
                          }}
                        >
                          <div className="flex flex-row items-center justify-between">
                            {header.isPlaceholder ? null : (
                              <div
                                {...{
                                  className: "w-full items-center select-none",
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </div>
                            )}
                            <div
                              {...{
                                onMouseDown: header.getResizeHandler(),
                                onTouchStart: header.getResizeHandler(),
                                className: "w-4 h-8 -mx-2 cursor-col-resize",
                              }}
                            />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, rowIndex) => {
                  return (
                    <tr
                      key={row.id}
                      className={`mainFont border-b text-center font-semibold${row.getIsSelected() ? " bg-muted" : ""}`}
                      onClick={async (value) => {
                        row.toggleSelected();
                        setTankData(row.original);
                      }}
                    >
                      {row.getVisibleCells().map((cell, index) => {
                        return (
                          <td
                            key={cell.id}
                            {...{
                              style: {
                                width: cell.column.getSize(),
                              },
                              className:
                                index === 0
                                  ? "sticky left-0 bg-muted border-b border-r"
                                  : "border-b border-r",
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination
            table={table}
            exportHeaders={journalExportHeaders}
            dictionary={dictionary}
          />
        </div>
      </div>
      <div className="flex flex-col collapse w-full flex-none px-16 md:visible md:h-[75vh] md:w-[150px] md:px-2 items-center justify-center gap-2">
        <ColumnVisibilityMenu table={table} />
        <TankComponent
          values={tankData}
          visibility={true}
          temperatureHangerVisible={true}
        />
      </div>
    </div>
  );
}
