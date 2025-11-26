import type { TankMeasurement } from "@/components/tank.types";

export function sumVolumesAndMass(measurements: TankMeasurement[]): {
  ObservedVolumeSum: number;
  FullVolumeSum: number;
  ProductMassSum: number;
  FullProductMassSum: number;
  LiqMassSum: number;
  ProdMassSum: number;
  FreeVolumeSum: number;
  VolumeSpeedSum: number;
} {
  return measurements?.reduce(
    (acc, m) => {
      acc.ObservedVolumeSum += m.total_observed_volume ?? 0;
      acc.FullVolumeSum += m.max_graduration_volume ?? 0;
      acc.ProductMassSum += m.product_mass ?? 0;
      acc.FullProductMassSum +=
        (m.max_graduration_volume ?? 0) * (m.observed_density ?? 0);
      acc.FreeVolumeSum += m.vapor_gross_observed_volume ?? 0;
      acc.VolumeSpeedSum += m.product_speed ?? 0;
      acc.LiqMassSum += m.vapor_gross_mass ?? 0;
      acc.ProdMassSum += m.product_mass ?? 0;
      return acc;
    },
    {
      ObservedVolumeSum: 0,
      FullVolumeSum: 0,
      ProductMassSum: 0,
      FullProductMassSum: 0,
      LiqMassSum: 0,
      ProdMassSum: 0,
      FreeVolumeSum: 0,
      VolumeSpeedSum: 0,
    },
  );
}
