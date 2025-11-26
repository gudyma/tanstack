import type { ColumnDef } from "@tanstack/react-table";
import type { GasContent } from "./columnsInterfaces";

export const gasContentColumns: ColumnDef<GasContent>[] = [
	{
		accessorKey: "name",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Резервуар",
		size: 90,
		minSize: 80,
	},
	{
		accessorKey: "timestamp",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Дата і час",
		size: 140,
		minSize: 140,
	},
	{
		accessorKey: "propane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Propane, %",
		size: 100,
		minSize: 100,
	},
	{
		accessorKey: "butane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Butane, %",
		size: 100,
		minSize: 100,
	},
	{
		accessorKey: "pentane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Pentane, %",
		size: 100,
		minSize: 100,
	},
	{
		accessorKey: "ethane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Ethane, %",
		size: 100,
		minSize: 100,
	},
];
