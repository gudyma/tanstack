"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { CellContext, RowData } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIntlayer, useLocale } from "react-intlayer";
import { getLocaleName } from "intlayer";
import { toast } from "sonner";

type TanksContentApiRow = {
  name: string | null;
  tank_id: string | number;
  timestamp: string | null;
  density_at15: number | null;
  density: number | null;
  product_temperature: number | null;
  ethane_percent: number | null;
  propane_percent: number | null;
  butane_percent: number | null;
  pentane_percent: number | null;
};

type TableRowData = {
  id: string;
  name: string;
  date: string;
  density_at15: number | string;
  density: number | string;
  temperature: number | string;
  ethane: number | string;
  propane: number | string;
  butane: number | string;
  pentane: number | string;
};

type EditableColumnKey = keyof TableRowData;

type FieldChange = {
  from: TableRowData[EditableColumnKey];
  to: TableRowData[EditableColumnKey];
};

type EditedRowChange = {
  id: string;
  original: TableRowData;
  current: TableRowData;
  changes: Partial<Record<EditableColumnKey, FieldChange>>;
  isValid: boolean;
};

type EditableCellProps = CellContext<
  TableRowData,
  TableRowData[EditableColumnKey]
>;

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (
      rowIndex: number,
      columnId: keyof TData,
      value: TData[keyof TData],
    ) => void;
    validateRow: (row: TData) => boolean;
  }
}

// Zod schema for row validation
const rowSchemaBase = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string().optional(),

  density_at15: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number()
      .min(0)
      .max(1200, "Density value must be less than or equal to 1200"),
  ),
  density: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number()
      .min(0)
      .max(1200, "Density value must be less than or equal to 1200"),
  ),

  temperature: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number()
      .min(-50, "Temperature must be greater than or equal to -50")
      .max(60, "Temperature must be less than or equal to 60"),
  ),

  ethane: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number()
      .min(0, "Ethane percentage must be at least 0")
      .max(100, "Ethane percentage must be less than 100"),
  ),

  propane: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().min(0, "Propane ≥ 0").max(100, "Propane < 100"),
  ),

  butane: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().min(0, "Butane ≥ 0").max(100, "Butane < 100"),
  ),

  pentane: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().min(0, "Pentane ≥ 0").max(100, "Pentane < 100"),
  ),
});

const rowSchema = rowSchemaBase.refine(
  (data) => {
    const sum = data.ethane + data.propane + data.butane + data.pentane;
    return Math.abs(sum - 100) < 0.01;
  },
  { message: "Sum of gas content must equal 100", path: ["ethane"] },
);

const EditableCell = ({ getValue, row, column, table }: EditableCellProps) => {
  const columnKey = column.id as keyof typeof rowSchemaBase.shape;
  const initialValue = getValue();
  const [value, setValue] =
    useState<TableRowData[EditableColumnKey]>(initialValue);
  const [error, setError] = useState("");

  const validateField = (fieldValue: unknown) => {
    try {
      const fieldSchema = rowSchemaBase.shape[columnKey];
      fieldSchema.parse(fieldValue);
      setError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const [firstIssue] = err.issues;
        if (firstIssue) {
          setError(firstIssue.message);
        }
      }
      return false;
    }
  };

  const onBlur = () => {
    validateField(value);
    const updatedRowForValidation: TableRowData = {
      ...row.original,
      [columnKey]: value,
    };
    table.options.meta?.updateData(row.index, columnKey, value);
    // After updating, re-run full row validation
    table.options.meta?.validateRow(updatedRowForValidation);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    // Clear error on change
    if (error) {
      setError("");
    }
  };

  React.useEffect(() => {
    setValue(initialValue);
    setError("");
  }, [initialValue]);

  if (column.id === "id") {
    return <span className="font-medium">{value}</span>;
  }

  return (
    <div className="space-y-1">
      <Input
        type="number"
        step={0.1}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={cn(
          "h-8",
          error && "border-red-500 focus-visible:ring-red-500",
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

const columnHelper = createColumnHelper<TableRowData>();

const formatTimestampForDisplay = (value?: string | null) => {
  if (!value) return "";

  const [timePart = "", datePartWithYear = ""] = value.split(" ");
  const [day = "", month = ""] = datePartWithYear.split(".");

  const timePieces = timePart.split(":");
  const time =
    timePieces.length >= 3
      ? timePart
      : timePieces.length
        ? `${timePart}:00`.slice(0, 8)
        : "";
  const date = day && month ? `${day}.${month}` : "";

  return [time, date].filter(Boolean).join(" ").trim();
};

const mapApiRowToTableRow = (row: TanksContentApiRow): TableRowData => ({
  id: String(row.tank_id ?? ""),
  name: String(row.name ?? ""),
  date: formatTimestampForDisplay(row.timestamp),
  density_at15: Number(row.density_at15 ?? 0),
  density: Number(row.density ?? 0),
  temperature: Number(row.product_temperature ?? 0),
  ethane: Number(row.ethane_percent ?? 0),
  propane: Number(row.propane_percent ?? 0),
  butane: Number(row.butane_percent ?? 0),
  pentane: Number(row.pentane_percent ?? 0),
});

export default function EditableTable() {
  const baseUrl = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:5000";

  const translation = useIntlayer("editable-table");
  const { locale } = useLocale();

  const [data, setData] = useState<TableRowData[]>([]);
  const [originalData, setOriginalData] = useState<TableRowData[]>([]);
  const [editedRows, setEditedRows] = useState<Map<string, TableRowData>>(
    new Map(),
  );
  const [validationErrors, setValidationErrors] = useState<
    Map<string, z.ZodIssue[]>
  >(new Map());

  const [enterDensity15, setEnterDensity15] = useState(false);

  const columns = useMemo(() => {
    const uiType = import.meta.env.PUBLIC_UI_TYPE || 3;

    const isType3 = String(uiType) === "3";

    const baseCols = [
      columnHelper.accessor("name", { header: "Рез. №" }),
      columnHelper.accessor("date", {
        header: "Дата",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() || "—"}</span>
        ),
      }),
    ];
    const density15Cols = [
      columnHelper.accessor("density_at15", {
        header: "Густина 15",

        cell: EditableCell,
      }),
    ];
    const densityCols = [
      columnHelper.accessor("density", {
        header: "Густина",
        cell: EditableCell,
      }),
      columnHelper.accessor("temperature", {
        header: "Темпер.",
        cell: EditableCell,
      }),
    ];

    const gasCols = [
      columnHelper.accessor("ethane", { header: "ethane", cell: EditableCell }),
      columnHelper.accessor("propane", {
        header: "propane",
        cell: EditableCell,
      }),
      columnHelper.accessor("butane", { header: "butane", cell: EditableCell }),
      columnHelper.accessor("pentane", {
        header: "pentane",
        cell: EditableCell,
      }),
    ];

    return isType3
      ? enterDensity15
        ? [...baseCols, ...density15Cols, ...gasCols]
        : [...baseCols, ...densityCols, ...gasCols]
      : baseCols;
  }, [enterDensity15]);

  useEffect(() => {
    let cancelled = false;

    const loadTanks = async () => {
      try {
        const baseUrl =
          import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:5000";
        const res = await fetch(baseUrl + "/api/tanksContentInfo");
        if (!res.ok) throw new Error("Failed to fetch tank content info");
        const rows: TanksContentApiRow[] = await res.json();
        if (cancelled) return;
        const mapped = rows.map(mapApiRowToTableRow);
        setData(mapped);
        setOriginalData(mapped.map((row) => ({ ...row })));
        setEditedRows(new Map<string, TableRowData>());
        setValidationErrors(new Map<string, z.ZodIssue[]>());
      } catch (err) {
        console.error(err);
      }
    };

    loadTanks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (validationErrors.size > 0) {
      console.log("Помилки:", validationErrors);
    }
  }, [validationErrors]);

  const validateRow = (row: TableRowData) => {
    try {
      rowSchema.parse(row);
      setValidationErrors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(row.id);
        return newMap;
      });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors((prev) => {
          const newMap = new Map(prev);
          newMap.set(row.id, err.issues);
          return newMap;
        });
      }
      return false;
    }
  };

  const hasRowChanged = (original: TableRowData, current: TableRowData) => {
    return (Object.keys(current) as EditableColumnKey[]).some(
      (key) => original[key] !== current[key],
    );
  };

  const updateData = (
    rowIndex: number,
    columnId: EditableColumnKey,
    value: TableRowData[EditableColumnKey],
  ) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          const rowId = row.id;
          const originalRow = originalData.find((r) => r.id === rowId) ?? row;

          const updatedRow: TableRowData = {
            ...row,
            [columnId]: value,
          };

          // Only track as edited if it actually changed from original
          if (hasRowChanged(originalRow, updatedRow)) {
            setEditedRows((prev) => {
              const newMap = new Map(prev);
              if (!newMap.has(rowId)) {
                newMap.set(rowId, originalRow);
              }
              return newMap;
            });
          } else {
            // Remove from edited rows if reverted to original
            setEditedRows((prev) => {
              const newMap = new Map(prev);
              newMap.delete(rowId);
              return newMap;
            });
          }

          // Validate the updated row
          validateRow(updatedRow);

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData,
      validateRow,
    },
  });

  const getEditedData = (): EditedRowChange[] => {
    const changes: EditedRowChange[] = [];

    editedRows.forEach((original, rowId) => {
      const current = data.find((row) => row.id === rowId);
      if (current) {
        const changedFields: Partial<Record<EditableColumnKey, FieldChange>> =
          {};
        (Object.keys(current) as EditableColumnKey[]).forEach((key) => {
          if (original[key] !== current[key]) {
            changedFields[key] = {
              from: original[key],
              to: current[key],
            };
          }
        });

        if (Object.keys(changedFields).length > 0) {
          changes.push({
            id: rowId,
            original,
            current,
            changes: changedFields,
            isValid: !validationErrors.has(rowId),
          });
        }
      }
    });

    return changes;
  };

  const validateAllData = (): boolean => {
    let isValid = true;
    data.forEach((row) => {
      if (!validateRow(row)) {
        isValid = false;
      }
    });
    return isValid;
  };

  const resetChanges = () => {
    setData(originalData.map((row) => ({ ...row })));
    setEditedRows(new Map<string, TableRowData>());
    setValidationErrors(new Map<string, z.ZodIssue[]>());
  };

  const saveChanges = async () => {
    if (!validateAllData()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    const editedRowsData = getEditedData();
    if (editedRowsData.length === 0) {
      toast.warning("No changes to save.");
      return;
    }

    const parseNumberValue = (value: number | string) =>
      typeof value === "string" ? Number(value) : value;

    try {
      for (const rowChange of editedRowsData) {
        const tankId = rowChange.id;

        const payload = {
          tank: tankId,
          density15: rowChange.current.density_at15
            ? parseNumberValue(rowChange.current.density_at15)
            : null,
          density: rowChange.current.density
            ? parseNumberValue(rowChange.current.density)
            : null,
          temperature: rowChange.current.temperature
            ? parseNumberValue(rowChange.current.temperature)
            : null,
          propane: parseNumberValue(rowChange.current.propane ?? 0),
          ethane: parseNumberValue(rowChange.current.ethane ?? 0),
          butane: parseNumberValue(rowChange.current.butane ?? 0),
          pentane: parseNumberValue(rowChange.current.pentane ?? 0),
        };

        const requestUrl = new URL("/api/writeDensity", baseUrl);
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            requestUrl.searchParams.set(key, String(value));
          }
        });

        const response = await fetch(requestUrl, {
          method: "POST",
        });
        if (!response.ok) {
          toast.error("Failed to write density");
        } else {
          toast.success(
            `Changes for ${rowChange.current.name} saved successfully.`,
          );
        }
      }

      setOriginalData(data.map((row) => ({ ...row })));
      setEditedRows(new Map<string, TableRowData>());
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("An error occurred while saving changes.");
    }
  };

  const hasValidationErrors = validationErrors.size > 0;

  return (
    <div className="container ">
      {hasValidationErrors && (
        <div className="w-full mb-4  bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="w-full text-sm text-red-800 font-medium">
            ⚠️ У {validationErrors.size} рядку(ах) виявлено помилки перевірки.
            Будь ласка, виправте їх перед збереженням. Помилки:{" "}
            {Array.from(validationErrors.values())
              .flat()
              .map((error) => error.message)
              .join(", ")}
          </p>
        </div>
      )}
      <div className="flex flex-row gap-4 my-2">
        <Label htmlFor="switch">{translation.ToggleHeader}</Label>
        <Switch
          id="switch"
          checked={enterDensity15}
          onCheckedChange={(enabled: boolean) => setEnterDensity15(enabled)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const isEdited = editedRows.has(row.original.id);
              const hasError = validationErrors.has(row.original.id);
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    isEdited && "bg-yellow-50",
                    hasError && "bg-red-50",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={resetChanges} variant="outline">
          {translation.ResetButtonHeader}
        </Button>
        <Button
          onClick={saveChanges}
          disabled={hasValidationErrors}
          className={cn(hasValidationErrors && "opacity-50 cursor-not-allowed")}
        >
          {translation.SaveButtonHeader}
        </Button>
      </div>
    </div>
  );
}
