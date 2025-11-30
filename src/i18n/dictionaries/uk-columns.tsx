import type { ColumnDef } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import type { TankInfoExtendedWithGrouping } from "./columnsInterfaces";

export const journalColumns: ColumnDef<TankInfoExtendedWithGrouping>[] = [
  {
    accessorKey: "timestamp",
    id: "Datetime",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "Дата і час",
    cell: ({ getValue }) => {
      const date = getValue<string>();

      const locale = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (date) return formatInTimeZone(date, locale, "HH:mm:ss dd.MM.yy");
      return "";
    },
    size: 140,
    minSize: 100,
  },
  {
    accessorKey: "product_level",
    id: "Level_mm",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "Рівень, мм",
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "pressure",
    id: "Pressure_bar",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "Тиск, bar",
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "free_temperature",
    id: "VaporTemperature",
    enableGrouping: false,
    header: () => (
      <p>
        T<sub>ПФ</sub>, °C
      </p>
    ),
    size: 75,
    minSize: 65,
  },
  {
    accessorKey: "product_temperature",
    id: "ProductTemperature",
    enableGrouping: false,
    aggregatedCell: "-",
    header: () => (
      <p>
        T<sub>РФ</sub>, °C
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "vapor_gross_observed_volume",
    id: "VaporVolume_m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(3),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(3),
    header: () => (
      <p>
        V<sub>ПФ</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "total_observed_volume",
    id: "TOV_m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(3),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(3)),
    header: () => (
      <div>
        V<sub>РФ</sub>, м<sup>3</sup>
      </div>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "gross_observed_volume",
    id: "ProductVolume_m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(3),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(3)),
    header: () => (
      <p>
        V<sub>прод</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "standard_gross_volume_at15c",
    id: "ProductVolume15C_m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(3),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(3)),
    header: () => (
      <p>
        V<sub>15</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "observed_density",
    id: "Density_kg/m3",
    enableGrouping: false,
    aggregatedCell: "-",
    header: () => (
      <p>
        ρ<sub>T</sub>, кг/м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "vapor_gross_mass_in_vacuume",
    id: "Mass_pf_vac_t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(3),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(3),
    header: () => (
      <p>
        М<sub>пф вак.</sub>, т
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "standard_gross_mass_in_vacuume",
    id: "Mass_liq_vac_t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(3),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(3),
    header: () => (
      <p>
        М<sub>прод. вак.</sub>, т
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "vapor_gross_mass",
    id: "Mass_pf_t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(4),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(4),
    header: () => (
      <p>
        М<sub>пф</sub>, т
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "product_mass",
    id: "Mass_liq_t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(4),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(4),
    header: () => (
      <p>
        М<sub>прод.</sub>, т
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "gas_product_mass",
    id: "Mass_gas_t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(4),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(4),
    header: "Заг. маса, т",
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "sediment_level",
    id: "SedimentLevel_mm",
    enableGrouping: false,
    aggregatedCell: "-",
    header: () => (
      <p>
        L<sub>осад</sub>, мм
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "sediment_volume",
    id: "SedimentVolume_m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(3),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(3)),
    header: () => (
      <p>
        V<sub>осад</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "t1",
    id: "T1",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T1",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "t2",
    id: "T2",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T2",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "t3",
    id: "T3",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T3",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "t4",
    id: "T4",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T4",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "t5",
    id: "T5",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T5",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "t6",
    id: "T6",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T6",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "t7",
    id: "T7",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T7",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "molar_mass",
    id: "Molar",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "Molar",
    size: 65,
    minSize: 60,
  },
  {
    accessorKey: "standard_gross_volume_at20c",
    id: "ProductVolume20C_m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(3),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(3)),
    header: () => (
      <p>
        V<sub>20</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
];

export const journalExportHeaders: string[] = journalColumns.map((item) =>
  item.id ? item.id.toString() : "",
);

function Progress({ value, color }: { value: number; color: string }) {
  const divStyle = {
    width: `${value}%`,
  };
  return (
    <div className="relative z-0 mx-2 flex bg-gray-200">
      <div className={`absolute inset-y-0 left-0 ${color}`} style={divStyle} />
      <div className="z-2 flex h-full w-full items-center justify-center py-1">
        {value}%
      </div>
    </div>
  );
}

const startColumns: ColumnDef<TankInfoExtendedWithGrouping>[] = [
  {
    accessorKey: "name",
    id: "Name",
    cell: (info) => info.getValue(),
    enablePinning: true,
    size: 75,
    minSize: 50,
    header: "Назва",
    enableGrouping: false,
  },
  {
    accessorKey: "park",
    id: "Park",
    header: "Парк",
    size: 65,
    minSize: 65,
    enableGrouping: true,
  },
  {
    accessorKey: "product",
    id: "Product",
    header: "Продукт",
    size: 65,
    minSize: 65,
    enableGrouping: true,
  },
  {
    accessorKey: "volume_percent",
    id: "VolumePercent",
    header: "Об'єм, %",
    size: 65,
    minSize: 65,
    enableGrouping: false,
    aggregatedCell: "-",
    cell: (info) => (
      <Progress
        value={Number(info.getValue<number>()?.toFixed(1))}
        color="bg-green-400"
      />
    ),
  },
  {
    accessorKey: "product_speed_volume",
    id: "ProductSpeedVolume",
    header: "м³/г",
    size: 65,
    minSize: 65,
    enableGrouping: false,
    aggregatedCell: "-",
    cell: (info) => (
      <div>
        {info.getValue<number>() != 0 && info.getValue<number>() > 0
          ? "↑"
          : info.getValue<number>() < 0
            ? "↓"
            : ""}
        {info.getValue<number>() != 0
          ? Number(info.getValue<number>()?.toFixed(1))
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "product_speed_mass",
    id: "ProductSpeedMass",
    header: "т/год",
    size: 90,
    minSize: 65,
    enableGrouping: false,
    aggregatedCell: "-",
    cell: (info) => (
      <div>
        {info.getValue<number>() != 0 && info.getValue<number>() > 0
          ? "↑"
          : info.getValue<number>() < 0
            ? "↓"
            : ""}
        {info.getValue<number>() != 0
          ? Number(info.getValue<number>()?.toFixed(1))
          : "-"}
      </div>
    ),
  },
];

const endColumns: ColumnDef<TankInfoExtendedWithGrouping>[] = [
  {
    accessorKey: "time_left",
    id: "TimeLeft",
    header: "Залишилось",
    size: 90,
    minSize: 65,
    enableGrouping: false,
  },
  {
    accessorKey: "description",
    id: "Description",
    header: "Опис",
    enableGrouping: false,
    size: 90,
    minSize: 65,
  },
];

export const tankTableColumns: ColumnDef<TankInfoExtendedWithGrouping>[] =
  startColumns.concat(journalColumns).concat(endColumns);

export const tankExportHeaders: string[] = tankTableColumns.map((item) =>
  item.id ? item.id.toString() : "",
);
