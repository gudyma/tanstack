import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type Table, flexRender } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";

interface ColumnVisibilityMenuProps<TData> {
  table: Table<TData>;
}

export function ColumnVisibilityMenu<TData>({
  table,
}: ColumnVisibilityMenuProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log("Click")}
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          Колонки
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[180px] h-96 overflow-auto">
        {table
          .getAllLeafColumns()
          .filter((col) => col.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              className=""
            >
              <span className="flex items-center">
                {flexRender(column.columnDef.header) || (
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
