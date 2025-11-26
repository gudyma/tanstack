import type {
  TankInfoExtendedWithGrouping,
  TankInfoWithGrouping,
} from "@/i18n/dictionaries/columnsInterfaces";
import type { Table as ReactTable } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TablePagination({
  table,
  exportHeaders,
  dictionary,
}: {
  table:
    | ReactTable<TankInfoExtendedWithGrouping>
    | ReactTable<TankInfoWithGrouping>;
  exportHeaders: string[];
  dictionary: {
    export: string;
    exportPdf: string;
    exportXlsx: string;
    page: string;
    goTo: string;
    show: string;
  };
}) {
  return (
    <div className="flex flex-row items-center justify-center py-2">
      <div className="flex flex-row items-center gap-2">
        <button
          aria-label="First Page"
          name="firstPage"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={() => table?.setPageIndex(0)}
          disabled={!table?.getCanPreviousPage()}
        >
          <svg
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 96 960 960"
            width="24"
          >
            <path d="M240 816V336h60v480h-60Zm447-3L453 579l234-234 43 43-191 191 191 191-43 43Z" />
          </svg>
        </button>

        <button
          aria-label="Before"
          name="before"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={() => table?.previousPage()}
          disabled={!table?.getCanPreviousPage()}
        >
          <svg
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 96 960 960"
            width="24"
          >
            <path d="M561 816 320 575l241-241 43 43-198 198 198 198-43 43Z" />
          </svg>
        </button>
        <div className="w-max ">
          {dictionary?.page}
          <div className="flex flex-row gap-2 font-semibold">
            <input
              aria-label="Page number"
              type="number"
              min={1}
              max={table?.getPageCount() < 1 ? 1 : table?.getPageCount()}
              value={table?.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table?.setPageIndex(page);
              }}
              className="h-full w-12 rounded border text-center"
            />
            <div>of </div>
            <div>
              {table?.getPageCount() < 0 ? "..." : table?.getPageCount()}
            </div>
          </div>
        </div>
        <button
          aria-label="Next"
          name="next"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={() => table?.nextPage()}
          disabled={!table?.getCanNextPage()}
        >
          <svg
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 96 960 960"
            width="24"
          >
            <path d="m375 816-43-43 198-198-198-198 43-43 241 241-241 241Z" />
          </svg>
        </button>

        <button
          aria-label="Last Page"
          name="lastPage"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={() => table?.setPageIndex(table?.getPageCount() - 1)}
          disabled={!table?.getCanNextPage()}
        >
          <svg
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 96 960 960"
            width="24"
          >
            <path d="m272 811-43-43 192-192-192-192 43-43 235 235-235 235Zm388 5V336h60v480h-60Z" />
          </svg>
        </button>
        <Label htmlFor="pagesNum" className="hidden">
          Select pages per page
        </Label>
        <Select
          name="Page number"
          defaultValue={table?.getState().pagination.pageSize.toString()}
          onValueChange={(e) => {
            table?.setPageSize(Number(e));
          }}
        >
          <SelectTrigger className="w-21" id="pagesNum">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="100" value="100">
              100
            </SelectItem>
            <SelectItem key="200" value="200">
              200
            </SelectItem>
            <SelectItem key="500" value="500">
              500
            </SelectItem>
            <SelectItem key="1000" value="1000">
              1000
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
