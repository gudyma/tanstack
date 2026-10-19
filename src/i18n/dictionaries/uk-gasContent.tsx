import type { ColumnDef } from "@tanstack/react-table";
import type { journalTableFeatures } from "@/lib/journal-table-features";
import type { GasContent } from "./columnsInterfaces";

export const gasContentColumns: ColumnDef<
  typeof journalTableFeatures,
  GasContent
>[] = [
  {
    accessorKey: "name",
    header: "Резервуар",
    size: 90,
    minSize: 80,
  },
  {
    accessorKey: "timestamp",
    header: "Дата і час",
    size: 140,
    minSize: 140,
  },
  {
    accessorKey: "propane_percent",
    header: "Propane, %",
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: "butane_percent",
    header: "Butane, %",
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: "pentane_percent",
    header: "Pentane, %",
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: "ethane_percent",
    header: "Ethane, %",
    size: 100,
    minSize: 100,
  },
];
