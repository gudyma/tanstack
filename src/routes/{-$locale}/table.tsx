import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer, useLocale } from "react-intlayer";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  checkTankMeasurements,
  type TankMeasurement,
} from "@/components/tank.types";
import { initializeTanksAndMqtt } from "@/lib/mqtt";
import { type TankInfoExtendedWithGrouping } from "@/i18n/dictionaries/columnsInterfaces";
import mqtt from "mqtt";
import { cn } from "@/lib/utils";

import { exportToCSV, exportToXlsx } from "@/lib/exportUtils";

import {
  EyeIcon,
  FileTextIcon,
  Grid2X2XIcon,
  SettingsIcon,
  TriangleAlertIcon,
} from "lucide-react";

import {
  type ColumnDef,
  type ColumnOrderState,
  type ColumnResizeMode,
  type GroupingState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { getColumns } from "@/i18n/dictionaries/get-dictionary";
import type { Locale } from "@/i18n/ui";

import { useTranslations } from "@/i18n/utils";
import TankDrawer from "@/components/tank-drawer";
import { ColumnVisibilityMenu } from "@/components/column-visibility-menu";
import { Button } from "@/components/ui/button";

// Key for localStorage persistence
const VISIBILITY_STORAGE_KEY = "tank-table-column-visibility";

export const Route = createFileRoute("/{-$locale}/table")({
  component: RouteComponent,
  head: ({ params }) => {
    const { locale } = params;
    const metaContent = getIntlayer("tableContent", locale);

    return {
      meta: [
        { title: metaContent.title },
        { content: metaContent.meta.description, name: "description" },
      ],
    };
  },
});

function RouteComponent() {
  const content = useIntlayer("tableContent");
  const { locale } = useLocale();
  useMemo(() => {
    getColumns(locale).then((value) => {
      setColumns(value);
    });
  }, [locale]);

  const [animate, setAnimate] = useState(false);

  const empty: ColumnDef<TankInfoExtendedWithGrouping>[] = [];
  const [tanks, setTanks] = useState();
  const [selectedTank, setSelectedTank] = useState<TankMeasurement>();
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [testcolumns, setColumns] = useState(empty);

  useEffect(() => {
    if (clientRef.current) return;
    initializeTanksAndMqtt(setTanks, setIsConnected, clientRef);
    console.log("Init");
    return () => {
      // cleanup when leaving the page
      clientRef.current?.removeAllListeners();
      clientRef.current?.end(true);
      clientRef.current = null;
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    setAnimate(!animate);
    const { is_error, is_warning } = checkTankMeasurements(tanks ?? []);
    if (is_warning) {
      try {
        const audio = new Audio("/path/to/alarm-sound.mp3");
        audio.play().catch((err) => console.error("Error:", err));
        console.log("Alarm playing");
      } catch (error) {
        console.error("Failed to play alarm:", error);
      }
    }
    if (is_error) {
      try {
        const audio = new Audio("/path/to/alarm-sound.mp3");
        audio.play().catch((err) => console.error("Error:", err));
        console.log("Alarm playing");
      } catch (error) {
        console.error("Failed to play alarm:", error);
      }
    }
  }, [tanks]);

  const defaultData = useMemo(() => {
    return [];
  }, []);

  const [columnResizeMode, setColumnResizeMode] =
    useState<ColumnResizeMode>("onChange");

  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

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
      console.error(
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

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const table = useReactTable({
    data: tanks ?? defaultData,
    columns: testcolumns,
    columnResizeMode,
    state: {
      grouping,
      sorting,
      columnVisibility,
      columnOrder,
    },
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  const exportHeaders: string[] = useMemo(() => {
    return table.getAllColumns().map((column) => column.id.toString());
  }, [tanks]);

  const exportData = useMemo(() => {
    const buff = table
      .getRowModel()
      .rows.map((row) => row.getAllCells().map((cell) => cell.getValue()));

    return buff;
  }, [tanks]);

  function checkStatus(values: TankMeasurement) {
    return (
      <TriangleAlertIcon
        size="16"
        className={cn(
          "",
          values.is_error || values.is_warning ? "visible" : "hidden",
          values.is_warning ? "text-yellow-400" : "",
          values.is_error ? "text-red-500" : "",
        )}
      />
    );
  }

  return (
    <div className="flex flex-col pb-16 justify-between h-full w-full p-2 z-2">
      <div
        className={cn(
          "h-full overflow-auto whitespace-nowrap rounded-md border-2 pb-2 shadow-md bg-background",
          animate ? "animate-borderFade" : "animate-borderFadeOut",
        )}
      >
        <table
          {...{
            style: {
              width: table.getCenterTotalSize(),
            },
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-secondary text-sm">
                <th className="sticky bg-muted top-0 left-0 w-8 z-100"></th>
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    {...{
                      style: {
                        width: header.getSize(),
                        zIndex: index === 0 ? 3 : 2,
                      },
                      className: `sticky h-8 pl-1 pr-2 top-0 border-r whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]${
                        index === 0
                          ? " bg-muted left-6 font-bold"
                          : " font-medium"
                      }`,
                    }}
                  >
                    <div className="flex flex-row items-center justify-between">
                      {header.column.getCanGroup() ? (
                        // If the header can be grouped, let's add a toggle
                        <button
                          id={`sort-btn-${index}`}
                          {...{
                            onClick: header.column.getToggleGroupingHandler(),
                            className: "w-4 h-4  fill-foreground",
                            "aria-label": `sort-btn-${index}`,
                          }}
                        >
                          {header.column.getIsGrouped() ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="14"
                              viewBox="0 96 960 960"
                              width="14"
                            >
                              <path d="M813 995 61 243l43-43 752 752-43 43ZM120 396v-60h94v60h-94Zm120 210v-60h184v60H240Zm145-210-60-60h515v60H385Zm15 420v-60h160v60H400Zm195-210-60-60h185v60H595Z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="14"
                              viewBox="0 96 960 960"
                              width="14"
                            >
                              <path d="M400 816v-60h160v60H400ZM240 606v-60h480v60H240ZM120 396v-60h720v60H120Z" />
                            </svg>
                          )}
                        </button>
                      ) : null}{" "}
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "w-full items-center cursor-pointer select-none"
                              : "w-full items-center",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </div>
                      )}
                      {{
                        asc: (
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="14"
                              viewBox="0 96 960 960"
                              width="14"
                            >
                              <path d="m280 656 200-201 200 201H280Z" />
                            </svg>
                          </div>
                        ),
                        desc: (
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="14"
                              viewBox="0 96 960 960"
                              width="14"
                            >
                              <path d="M480 696 280 497h400L480 696Z" />
                            </svg>
                          </div>
                        ),
                      }[header.column.getIsSorted() as string] ?? null}
                      <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: "w-4 h-8 -mx-2 cursor-col-resize",
                        }}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                style={{ height: 35 }}
                className={`mainFont text-center font-semibold${rowIndex % 2 === 1 ? " bg-muted" : ""}`}
                onClick={async (value) => {
                  setSelectedTank(row.original);
                }}
              >
                <td className="sticky bg-muted left-0 w-8 z-100">
                  <TankDrawer values={selectedTank} className="flex">
                    {checkStatus(row.original)}
                    <SettingsIcon className="size-4" />
                  </TankDrawer>
                </td>
                {row.getVisibleCells().map((cell, index) => (
                  <td
                    key={cell.id}
                    {...{
                      style: {
                        width: cell.column.getSize(),
                        height: "100%",
                        zIndex: index === 0 ? 3 : 2,
                      },
                      className:
                        index === 0
                          ? "sticky bg-muted left-6 border-b border-r"
                          : "border-b border-r",
                    }}
                  >
                    {cell.getIsGrouped() ? (
                      // If it's a grouped cell, add an expander and row count
                      <>
                        <button
                          className="flex flex-row"
                          {...{
                            onClick: row.getToggleExpandedHandler(),
                            style: {
                              cursor: row.getCanExpand() ? "pointer" : "normal",
                            },
                          }}
                        >
                          {row.getIsExpanded() ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="16"
                              viewBox="0 96 960 960"
                              width="16"
                            >
                              <path d="m283 711-43-43 240-240 240 239-43 43-197-197-197 198Z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="16"
                              viewBox="0 96 960 960"
                              width="16"
                            >
                              <path d="M480 711 240 471l43-43 197 198 197-197 43 43-240 239Z" />
                            </svg>
                          )}{" "}
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}{" "}
                          ({row.subRows.length})
                        </button>
                      </>
                    ) : cell.getIsAggregated() ? (
                      // If the cell is aggregated, use the Aggregated
                      // renderer for cell
                      flexRender(
                        cell.column.columnDef.aggregatedCell ??
                          cell.column.columnDef.cell,
                        cell.getContext(),
                      )
                    ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                      // Otherwise, just render the regular cell
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-row flex-none justify-between mt-1">
        <div className="max-w-68 space-x-2 space-y-1 sm:space-y-0">
          <Button
            variant="outline"
            size="sm"
            className="w-32"
            onClick={() => exportToCSV(exportHeaders, exportData, "export.csv")}
          >
            <FileTextIcon className="h-4 w-4 mr-1" />
            Export Csv
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-32"
            onClick={() =>
              exportToXlsx(exportHeaders, exportData, "export.xlsx")
            }
          >
            <Grid2X2XIcon className="h-4 w-4 mr-1" />
            Export Excel
          </Button>
        </div>
        <ColumnVisibilityMenu table={table} />
      </div>
    </div>
  );
}
