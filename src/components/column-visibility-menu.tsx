import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  type RowData,
  type Table,
  type TableFeatures,
  type columnVisibilityFeature,
  constructHeader,
  flexRender,
} from "@tanstack/react-table";
import {
  column_getCanHide,
  column_getIsVisible,
  column_toggleVisibility,
} from "@tanstack/react-table/static-functions";
import { EyeIcon } from "lucide-react";

type VisibilityFeatures = TableFeatures & {
  columnVisibilityFeature: typeof columnVisibilityFeature;
};

interface ColumnVisibilityMenuProps<
  TFeatures extends VisibilityFeatures,
  TData extends RowData,
> {
  table: Table<TFeatures, TData>;
}

export function ColumnVisibilityMenu<
  TFeatures extends VisibilityFeatures,
  TData extends RowData,
>({ table }: ColumnVisibilityMenuProps<TFeatures, TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          Колонки
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[180px] h-96 overflow-auto">
        {table
          .getAllLeafColumns()
          .filter((column) => column_getCanHide(column))
          .map((column, index) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column_getIsVisible(column)}
              onCheckedChange={(value) =>
                column_toggleVisibility(column, !!value)
              }
              className=""
            >
              <span className="flex items-center">
                {flexRender(
                  column.columnDef.header,
                  // Hidden columns have no visible header; create a context so
                  // their labels render just like the visible column labels.
                  constructHeader(table, column, {
                    index,
                    depth: column.depth,
                  }).getContext(),
                ) || (
                  <span className="capitalize">
                    {column.id.replace(/([A-Z])/g, " $1")}
                  </span>
                )}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
