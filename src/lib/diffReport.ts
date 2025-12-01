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
const COMPARABLE_KEYS: { key: keyof TankMeasurement; label: string }[] = [
  { key: "product_level", label: "Product Level" },
  { key: "sediment_level", label: "Sediment Level" },
  { key: "product_temperature", label: "Product Temperature" },
  { key: "free_temperature", label: "Free Temperature" },
  { key: "pressure", label: "Pressure" },
  { key: "product_speed", label: "Product Speed" },
  { key: "total_observed_volume", label: "Total Observed Volume" },
  { key: "gross_observed_volume", label: "Gross Observed Volume" },
  {
    key: "vapor_gross_observed_volume",
    label: "Vapor Gross Observed Volume",
  },
  { key: "sediment_volume", label: "Sediment Volume" },
  {
    key: "standard_gross_volume_at15_c",
    label: "Standard Gross Volume at 15°C",
  },
  {
    key: "standard_gross_volume_at20_c",
    label: "Standard Gross Volume at 20°C",
  },
  {
    key: "gost_standard_gross_volume_at15_c",
    label: "GOST Standard Gross Volume at 15°C",
  },
  {
    key: "gost_standard_gross_volume_at20_C",
    label: "GOST Standard Gross Volume at 20°C",
  },
  { key: "observed_density", label: "Observed Density" },
  { key: "gost_observed_density", label: "GOST Observed Density" },
  {
    key: "standard_gross_mass_in_vacuume",
    label: "Standard Gross Mass in Vacuum",
  },
  {
    key: "gost_gross_mass_in_vacuume",
    label: "GOST Gross Mass in Vacuum",
  },
  { key: "product_mass", label: "Product Mass" },
  { key: "gost_product_mass", label: "GOST Product Mass" },
  {
    key: "vapor_gross_mass_in_vacuume",
    label: "Vapor Gross Mass in Vacuum",
  },
  { key: "vapor_gross_mass", label: "Vapor Gross Mass" },
  { key: "gas_product_mass", label: "Gas Product Mass" },
  { key: "molar_mass", label: "Molar Mass" },
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

  COMPARABLE_KEYS.forEach((value) => {
    const val1 = prev[value.key] as number | null;
    const val2 = curr[value.key] as number | null;

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
    changes[value.label] = {
      parameter_name: value.label,
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
