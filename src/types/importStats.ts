export const IMPORT_STATS_KEY = "IMPORT_STATS";

export type ImportStats = {
  entity: string | null;
  totalRows: number;
  inserted: number;
  updated: number;
  unchanged: number;
  duplicatesInFile: number;
  timestamp: string;
};

export function getDefaultImportStats(): ImportStats {
  return {
    entity: null,
    totalRows: 0,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    duplicatesInFile: 0,
    timestamp: new Date().toISOString(),
  };
}

export function loadImportStats(): ImportStats {
  try {
    const raw = sessionStorage.getItem(IMPORT_STATS_KEY);
    if (!raw) return getDefaultImportStats();
    const parsed = JSON.parse(raw) as ImportStats;
    return {
      ...getDefaultImportStats(),
      ...parsed,
    };
  } catch {
    return getDefaultImportStats();
  }
}
