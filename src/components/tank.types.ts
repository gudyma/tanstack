export interface TankSettingsForm {
  max_allowed_level: number | null;
  min_allowed_level: number | null;
  volume_threshold: number | null;
  mass_threshold: number | null;
}

export interface Tank {
  park: string;
  park_id: string;
  value: string;
  label: string;
}

export interface TankParameterData {
  parameter: string;
  timestamp: Date;
}

export interface TankMeasurement {
  id: string;
  value?: string | number | null;
  name?: string | null;
  label?: string | null;
  park?: string | null;
  park_id?: string | null;
  product?: string | null;
  product_id?: string | number | null;
  enabled?: boolean | null;
  description?: string | null;
  company_owner_id?: string | null;

  max_graduration_level?: number;
  min_graduration_level?: number | null;
  max_allowed_level?: number | null;
  min_allowed_level?: number | null;
  max_graduration_volume?: number | null;
  min_graduration_volume?: number | null;

  level_sensor_id?: string | null;
  saved_volume?: number | null;
  volume_threshold?: number | null;
  saved_mass?: number | null;
  mass_threshold?: number | null;

  group?: string | null;
  subgroup?: string | null;
  standard?: string | null;
  color?: string | null;
  sediment_color?: string | null;
  default_density?: number | null;

  timestamp?: string | null;

  product_level?: number | null;
  sediment_level?: number | null;
  product_temperature?: number | null;
  free_temperature?: number | null;
  pressure?: number | null;
  product_speed?: number | null;

  total_observed_volume?: number | null;
  gross_observed_volume?: number | null;
  vapor_gross_observed_volume?: number | null;
  sediment_volume?: number | null;

  standard_gross_volume_at15_c?: number | null;
  standard_gross_volume_at20_c?: number | null;
  gost_standard_gross_volume_at15_c?: number | null;
  gost_standard_gross_volume_at20_C?: number | null;

  observed_density?: number | null;
  gost_observed_density?: number | null;

  standard_gross_mass_in_vacuume?: number | null;
  gost_gross_mass_in_vacuume?: number | null;
  product_mass?: number | null;
  gost_product_mass?: number | null;

  vapor_gross_mass_in_vacuume?: number | null;
  vapor_gross_mass?: number | null;

  gas_product_mass?: number | null;
  molar_mass?: number | null;

  t1?: number | null;
  t2?: number | null;
  t3?: number | null;
  t4?: number | null;
  t5?: number | null;
  t6?: number | null;
  t7?: number | null;

  th1?: number | null;
  th2?: number | null;
  th3?: number | null;
  th4?: number | null;
  th5?: number | null;
  th6?: number | null;
  th7?: number | null;

  level_percent?: number;
  volume_percent?: number;
  product_speed_volume?: number;
  product_speed_mass?: number;
  time_left?: string;

  is_error?: boolean | null;
  is_warning?: boolean | null;
}

export function checkTankMeasurements(measurements: TankMeasurement[]): {
  is_error: boolean;
  is_warning: boolean;
} {
  const is_error = measurements.some((m) => m.is_error === true);
  const is_warning = measurements.some((m) => m.is_warning === true);

  return { is_error, is_warning };
}
