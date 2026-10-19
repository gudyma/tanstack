import {
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  tableFeatures,
} from "@tanstack/react-table";

// History is filtered and paginated by the API. The client only displays the
// returned page and lets users select a measurement and adjust its columns.
export const journalTableFeatures = tableFeatures({
  columnSizingFeature,
  columnResizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
});
