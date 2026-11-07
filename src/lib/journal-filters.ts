export const JOURNAL_FILTERS_STORAGE_KEY = "journal-filters";

export interface JournalFilters {
  tank: string;
  startDate: string;
  endDate: string;
}

export function parseJournalFilters(stored: string | null): JournalFilters | null {
  if (!stored) return null;

  try {
    const filters = JSON.parse(stored);
    if (
      !filters ||
      typeof filters.tank !== "string" ||
      typeof filters.startDate !== "string" ||
      typeof filters.endDate !== "string"
    ) {
      return null;
    }

    const start = Date.parse(filters.startDate);
    const end = Date.parse(filters.endDate);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
      return null;
    }

    return {
      tank: filters.tank,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
    };
  } catch {
    return null;
  }
}
