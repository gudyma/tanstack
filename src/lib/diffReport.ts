import { TankMeasurement } from "@/components/tank.types";

// Report Interfaces
export interface ParamDiff {
  oldValue: number | null;
  newValue: number | null;
  delta: number | null; // null if calculation not possible (e.g. comparing null)
  percentChange: number | null;
}

export interface TankDiffReport {
  tank_id: string;
  timestampFrom: string | null | undefined;
  timestampTo: string | null | undefined;
  // Only contains keys that actually changed
  changes: Partial<Record<keyof TankMeasurement, ParamDiff>>;
}

// ==========================================
// 2. Configuration: Keys to Compare
// ==========================================
// We exclude 'tank_id' and 'timestamp' from numeric comparison
const COMPARABLE_KEYS: (keyof TankMeasurement)[] = [
  "product_level",
  "sediment_level",
  "product_temperature",
  "free_temperature",
  "pressure",
  "product_speed",
  "total_observed_volume",
  "gross_observed_volume",
  "vapor_gross_observed_volume",
  "sediment_volume",
  "standard_gross_volume_at15_c",
  "standard_gross_volume_at20_c",
  "gost_standard_gross_volume_at15_c",
  "gost_standard_gross_volume_at20_C",
  "observed_density",
  "gost_observed_density",
  "standard_gross_mass_in_vacuume",
  "gost_gross_mass_in_vacuume",
  "product_mass",
  "gost_product_mass",
  "vapor_gross_mass_in_vacuume",
  "vapor_gross_mass",
  "gas_product_mass",
  "molar_mass",
  // Add t1..t7 and th1..th7 if needed
];

// ==========================================
// 3. The Logic
// ==========================================

/**
 * rounds a number to specific precision to avoid floating point errors
 * e.g. 0.1 + 0.2 != 0.3 without rounding
 */
const round = (num: number, scale: number = 4) => {
  const factor = Math.pow(10, scale);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

/**
 * Generates a diff report for a single tank
 */
export function getSingleTankDiff(
  prev: TankMeasurement,
  curr: TankMeasurement,
): TankDiffReport {
  const changes: TankDiffReport["changes"] = {};

  COMPARABLE_KEYS.forEach((key) => {
    const val1 = prev[key] as number | null;
    const val2 = curr[key] as number | null;

    // Skip if both are null or strictly equal
    if (val1 === val2) return;

    // Calculate Delta
    let delta: number | null = null;
    let percent: number | null = null;

    if (val1 !== null && val2 !== null) {
      delta = round(val2 - val1);

      // Calculate Percentage only if oldValue is not 0
      if (val1 !== 0) {
        percent = round(((val2 - val1) / Math.abs(val1)) * 100, 2);
      }
    }

    // Only record if there is a difference
    changes[key] = {
      oldValue: val1,
      newValue: val2,
      delta: delta,
      percentChange: percent,
    };
  });

  return {
    tank_id: curr.id,
    timestampFrom: prev.timestamp,
    timestampTo: curr.timestamp,
    changes,
  };
}

/**
 * Main Function: Process arrays of data
 * Assumes inputs are arrays of TankData from the SQL query
 */
export function generateBulkReport(
  datasetA: TankMeasurement[],
  datasetB: TankMeasurement[],
): TankDiffReport[] {
  const reports: TankDiffReport[] = [];

  // Map dataset A for O(1) lookup by tank_id
  const mapA = new Map<string, TankMeasurement>();
  datasetA.forEach((row) => mapA.set(row.id, row));

  // Iterate dataset B and compare
  datasetB.forEach((rowB) => {
    const rowA = mapA.get(rowB.id);

    if (rowA) {
      const report = getSingleTankDiff(rowA, rowB);
      // Only push report if there are actual changes
      if (Object.keys(report.changes).length > 0) {
        reports.push(report);
      }
    } else {
      // Optional: Handle case where tank exists in B but not A (New Tank)
      console.log(`Tank ${rowB.id} found in second date but not first.`);
    }
  });

  return reports;
}
