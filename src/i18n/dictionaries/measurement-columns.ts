import type {
  AccessorKeyColumnDef,
  CellContext,
  ColumnDef,
  ColumnDefTemplate,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { journalTableFeatures } from "@/lib/journal-table-features";
import type { tankTableFeatures } from "@/lib/tank-table-features";
import type { TankInfoExtendedWithGrouping } from "./columnsInterfaces";

// Shared renderers need only the value, not a particular table's feature APIs.
type MeasurementCell = ColumnDefTemplate<
  Pick<
    CellContext<typeof tankTableFeatures, TankInfoExtendedWithGrouping>,
    "getValue"
  >
>;

export type MeasurementColumnDef = Pick<
  AccessorKeyColumnDef<typeof tankTableFeatures, TankInfoExtendedWithGrouping>,
  "accessorKey" | "id" | "size" | "minSize" | "enableGrouping" | "aggregationFn"
> & {
  header?: string | (() => ReactNode);
  cell?: MeasurementCell;
  aggregatedCell?: MeasurementCell;
};

export function createJournalColumns(
  columns: MeasurementColumnDef[],
): ColumnDef<typeof journalTableFeatures, TankInfoExtendedWithGrouping>[] {
  return columns.map(({ accessorKey, id, header, cell, size, minSize }) => ({
    accessorKey,
    id,
    header,
    // An explicit undefined overrides TanStack's default value renderer.
    ...(cell === undefined ? {} : { cell }),
    size,
    minSize,
  }));
}
