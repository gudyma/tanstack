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
    id: "Level, мм",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "Рівень, мм",
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "product_temperature",
    id: "Product Temperature, C",
    enableGrouping: false,
    aggregatedCell: "-",
    header: () => "T, °C",
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "sediment_level",
    id: "Sediment level, mm",
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
    accessorKey: "total_observed_volume",
    id: "TOV, m³",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(2),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(2)),
    header: () => (
      <div>
        V<sub>заг</sub>, м<sup>3</sup>
      </div>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "sediment_volume",
    id: "Sediment volume, m³",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(2),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(2)),
    header: () => (
      <p>
        V<sub>осад</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "gross_observed_volume",
    id: "Product Volume, m³",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(2),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(2)),
    header: () => (
      <p>
        V<sub>прод</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "observed_density",
    id: "Density, kg/m3",
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
    accessorKey: "product_mass",
    id: "Mass, t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    header: "Масса, т",
    size: 90,
    minSize: 65,
  },

  {
    accessorKey: "vapor_gross_observed_volume",
    id: "Vapor volume, m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    header: () => (
      <p>
        V<sub>віл</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "free_mass",
    id: "Free mass, t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    header: () => (
      <p>
        M<sub>віл</sub>, t
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "free_temperature",
    id: "Vapor temperature, C",
    enableGrouping: false,
    header: () => (
      <p>
        T<sub>віл</sub>, °C
      </p>
    ),
    size: 75,
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
];

export const dataColumns: ColumnDef<TankInfoExtendedWithGrouping>[] = [
  {
    accessorKey: "Timestamp",
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
    accessorKey: "ProductLevel",
    id: "Level, мм",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "Рівень, мм",
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "ProductTemperature",
    id: "Product Temperature, C",
    enableGrouping: false,
    aggregatedCell: "-",
    header: () => "T, °C",
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "SedimentLevel",
    id: "Sediment level, mm",
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
    accessorKey: "TotalObservedVolume",
    id: "TOV, m³",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(2),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(2)),
    header: () => (
      <div>
        V<sub>заг</sub>, м<sup>3</sup>
      </div>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "SedimentVolume",
    id: "Sediment volume, m³",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(2),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(2)),
    header: () => (
      <p>
        V<sub>осад</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "GrossObservedVolume",
    id: "Product Volume, m³",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>()).toFixed(2),
    cell: ({ getValue }) => Number(Number(getValue<string>()).toFixed(2)),
    header: () => (
      <p>
        V<sub>прод</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "product_speed_volume",
    id: "Flow rate, m3/h",
    enableGrouping: false,
    aggregatedCell: "-",
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(1),
    header: () => (
      <p>
        м<sup>3</sup>/год
      </p>
    ),
    size: 75,
    minSize: 55,
  },
  {
    accessorKey: "product_speed_mass",
    id: "Flow rate, t/h",
    enableGrouping: false,
    aggregatedCell: "-",
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(1),
    header: "т/год",
    size: 75,
    minSize: 55,
  },

  {
    accessorKey: "ObservedDensity",
    id: "Density, kg/m3",
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
    accessorKey: "ProductMass",
    id: "Mass, t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    header: "Масса, т",
    size: 90,
    minSize: 65,
  },

  {
    accessorKey: "VaporGrossObservedVolume",
    id: "Vapor volume, m3",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    header: () => (
      <p>
        V<sub>віл</sub>, м<sup>3</sup>
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "free_mass",
    id: "Free mass, t",
    enableGrouping: false,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    cell: ({ getValue }) => Number(getValue<number>())?.toFixed(2),
    header: () => (
      <p>
        M<sub>віл</sub>, t
      </p>
    ),
    size: 90,
    minSize: 65,
  },
  {
    accessorKey: "FreeTemperature",
    id: "Vapor temperature, C",
    enableGrouping: false,
    header: () => (
      <p>
        T<sub>віл</sub>, °C
      </p>
    ),
    size: 75,
    minSize: 65,
  },

  {
    accessorKey: "T1",
    id: "T1",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T1",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "T2",
    id: "T2",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T2",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "T3",
    id: "T3",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T3",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "T4",
    id: "T4",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T4",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "T5",
    id: "T5",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T5",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "T6",
    id: "T6",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T6",
    size: 55,
    minSize: 50,
  },
  {
    accessorKey: "T7",
    id: "T7",
    enableGrouping: false,
    aggregatedCell: "-",
    header: "T7",
    size: 55,
    minSize: 50,
  },
];

export const journalExportHeaders: string[] = dataColumns.map((item) =>
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
    accessorKey: "label",
    cell: (info) => info.getValue(),
    enablePinning: true,
    size: 75,
    minSize: 50,
    header: "Назва",
    enableGrouping: false,
  },
  {
    accessorKey: "park",
    header: "Парк",
    size: 90,
    minSize: 65,
    enableGrouping: true,
  },

  {
    accessorKey: "product",
    header: "Продукт",
    size: 90,
    minSize: 65,
    enableGrouping: true,
  },
  {
    accessorKey: "level_percent",
    header: "Рівень, %",
    size: 90,
    minSize: 65,
    enableGrouping: false,
    aggregatedCell: "-",
    cell: (info) => (
      <Progress
        value={Number(Number(info.getValue<number>())?.toFixed(1))}
        color="bg-blue-400"
      />
    ),
  },
  {
    accessorKey: "volume_percent",
    header: "Об'єм, %",
    size: 90,
    minSize: 65,
    enableGrouping: false,
    aggregatedCell: "-",
    cell: (info) => (
      <Progress
        value={Number(Number(info.getValue<number>())?.toFixed(1))}
        color="bg-green-400"
      />
    ),
  },
];

const endColumns: ColumnDef<TankInfoExtendedWithGrouping>[] = [
  {
    accessorKey: "time_left",
    header: "Залишилось",
    size: 90,
    minSize: 65,
    enableGrouping: false,
  },
  {
    accessorKey: "description",
    header: "Опис",
    enableGrouping: false,
    size: 90,
    minSize: 65,
  },
];

export const tankTableColumns: ColumnDef<TankInfoExtendedWithGrouping>[] =
  startColumns.concat(dataColumns).concat(endColumns);

export const tankExportHeaders: string[] = tankTableColumns.map((item) =>
  item.id ? item.id.toString() : "",
);
