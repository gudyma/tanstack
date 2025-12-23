import { TankMeasurement } from "@/components/tank.types";
import { ParamDiff, TankDiffReport } from "@/lib/createDiffReportPdf";

// ==========================================
// 2. Configuration: Keys to Compare
// ==========================================
// We exclude 'tank_id' and 'timestamp' from numeric comparison
const COMPARABLE_KEYS: { key: keyof TankMeasurement; label: string }[] = [
  { key: "product_level", label: "Рівень продукту, мм" },
  { key: "product_temperature", label: "Температура продукту, °C" },
  { key: "free_temperature", label: "Температура парової фази, °C" },
  { key: "pressure", label: "Тиск, bar" },
  { key: "total_observed_volume", label: "Обсяг продукту, м3" },
  { key: "gross_observed_volume", label: "Нормований обсяг продукту, м3" },
  {
    key: "vapor_gross_observed_volume",
    label: "Об'єм парової фази, м3",
  },
  {
    key: "standard_gross_volume_at15_c",
    label: "Об'єм продукту при 15°C, м3",
  },
  {
    key: "standard_gross_volume_at20_c",
    label: "Об'єм продукту при 20°C, м3",
  },

  { key: "observed_density", label: "Густина продукту, кг/м3" },

  {
    key: "standard_gross_mass_in_vacuume",
    label: "Маса продукту у вакуумі, т",
  },

  { key: "product_mass", label: "Маса продукту, т" },
  {
    key: "vapor_gross_mass_in_vacuume",
    label: "Маса парової фази у вакуумі, т",
  },
  { key: "vapor_gross_mass", label: "Маса парової фази,т" },
  { key: "gas_product_mass", label: "Загальна маса продукту, т" },
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
    tank_name: curr.name ?? curr.label ?? curr.id,
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
  includeUnchanged?: boolean,
): TankDiffReport[] {
  includeUnchanged = includeUnchanged ?? true;
  const reports: TankDiffReport[] = [];

  // Map dataset A for O(1) lookup by tank_id
  const mapA = new Map<string, TankMeasurement>();
  datasetA.forEach((row) => mapA.set(row.id, row));

  // Iterate dataset B and compare
  datasetB.forEach((rowB) => {
    const rowA = mapA.get(rowB.id);

    if (rowA) {
      const report = getSingleTankDiff(rowA, rowB);
      // Push all reports when includeUnchanged is set; otherwise only changed tanks
      if (includeUnchanged || Object.keys(report.changes).length > 0) {
        reports.push(report);
      }
    } else {
      // Optional: Handle case where tank exists in B but not A (New Tank)
      console.log(`Tank ${rowB.id} found in second date but not first.`);
    }
  });

  return reports;
}
