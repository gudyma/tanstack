import type { ColumnDef } from "@tanstack/react-table";
import type { GasContent } from "./columnsInterfaces";

export const gasContentColumns: ColumnDef<GasContent>[] = [
	{
		accessorKey: "name",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Name",
		size: 90,
		minSize: 80,
		enablePinning: true,
	},
	{
		accessorKey: "timestamp",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Datetime",
		size: 140,
		minSize: 140,
		enablePinning: true,
	},
	{
		accessorKey: "propane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Propane, %",
		size: 100,
		minSize: 100,
		enablePinning: false,
	},
	{
		accessorKey: "butane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Butane, %",
		size: 100,
		minSize: 100,
		enablePinning: false,
	},
	{
		accessorKey: "ethane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Ethane, %",
		size: 100,
		minSize: 100,
		enablePinning: false,
	},
	{
		accessorKey: "pentane_percent",
		enableGrouping: false,
		aggregatedCell: "-",
		header: "Pentane, %",
		size: 100,
		minSize: 100,
		enablePinning: false,
	},
];
