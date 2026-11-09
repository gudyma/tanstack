import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";
import { format } from "date-fns";
import { Meter } from "@/components/ui/meter";
import TankDrawer from "@/components/tank-drawer";
import TankComponent from "@/components/tank-component";
import {
  checkTankMeasurements,
  type TankMeasurement,
} from "@/components/tank.types";
import { initializeTanksAndMqtt } from "@/lib/mqtt";
import { sumVolumesAndMass } from "@/lib/sumVolumeAndMass";
import { Button } from "@/components/ui/button";
import { Volume2Icon, VolumeOffIcon } from "lucide-react";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getTanks } from "@/lib/serverFunctions";

export const Route = createFileRoute("/{-$locale}/")({
  component: RouteComponent,
  loader: () => getTanks(),
  head: ({ params }) => {
    const { locale } = params;
    const metaContent = getIntlayer("tankContent", locale);

    return {
      meta: [
        { title: metaContent.title },
        { content: metaContent.meta.description, name: "description" },
      ],
    };
  },
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();

  const content = useIntlayer("tankContent");
  const [tanks, setTanks] = useState<TankMeasurement[]>(loaderData);

  const sumValues = tanks?.reduce(
    (acc, m) => {
      acc.ObservedVolumeSum += m.total_observed_volume ?? 0;
      acc.FullVolumeSum += m.max_graduration_volume ?? 0;
      acc.FreeVolumeSum += m.vapor_gross_observed_volume ?? 0;
      acc.VolumeSpeedSum += m.product_speed_volume ?? 0;
      acc.FullProductMassSum +=
        ((m.max_graduration_volume ?? 0) * (m.product_standard_density ?? 0)) /
        1000.0;

      acc.CombinedProductMassSum +=
        (m.product_mass ?? 0) + (m.vapor_gross_mass ?? 0);
      acc.ProductMassSum += m.product_mass ?? 0;
      acc.VaporMassSum += m.vapor_gross_mass ?? 0;

      acc.CombinedProductMassSumVacuum +=
        (m.standard_gross_mass_in_vacuume ?? 0) + (m.vapor_gross_mass_in_vacuume ?? 0);
      acc.ProductMassSumVacuum += m.standard_gross_mass_in_vacuume ?? 0;
      acc.VaporMassSumVacuum += m.vapor_gross_mass_in_vacuume ?? 0;
      return acc;
    },
    {
      ObservedVolumeSum: 0,
      FullVolumeSum: 0,
      FreeVolumeSum: 0,
      VolumeSpeedSum: 0,

      FullProductMassSum: 0,

      CombinedProductMassSum: 0,
      ProductMassSum: 0,
      VaporMassSum: 0,

      CombinedProductMassSumVacuum: 0,
      ProductMassSumVacuum: 0,
      VaporMassSumVacuum: 0,
    },
  );
  const [timeDataUpdated, setTimeDataUpdated] = useState<Date>();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const rows = import.meta.env.VITE_TANKVIEW_ROWS || 2;
  const cols = import.meta.env.VITE_TANKVIEW_COLS || 3;

  useEffect(() => {
    if (clientRef.current) return;
    initializeTanksAndMqtt(setTanks, setIsConnected, clientRef);

    return () => {
      // cleanup when leaving the page
      clientRef.current?.removeAllListeners();
      clientRef.current?.end(true);
      clientRef.current = null;
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    setTimeDataUpdated(new Date());
    const { is_error, is_warning } = checkTankMeasurements(tanks ?? []);
    if (is_warning && !isMuted) {
      try {
        const audio = new Audio("/audio/warning.mp3");
        audio.play().catch((err) => console.error("Error:", err));
        console.log("Warning Alarm playing");
      } catch (error) {
        console.error("Failed to play alarm:", error);
      }
    }
    if (is_error && !isMuted) {
      try {
        const audio = new Audio("/audio/critical.mp3");
        audio.play().catch((err) => console.error("Error:", err));
        console.log("Critical Alarm playing");
      } catch (error) {
        console.error("Failed to play alarm:", error);
      }
    }
  }, [tanks]);

  return (
    <div className="flex min-h-screen w-full justify-between flex-col-reverse xl:flex-col z-2">
      <div
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
        className={`grid h-full w-full items-center justify-center overflow-auto md:overflow-none px-1 pb-18 xl:pb-0`}
      >
        {tanks?.map((tank, index) => (
          <div key={index} className="h-full min-h-48 w-full p-0.5">
            <TankDrawer values={tank}>
              <TankComponent values={tank} visibility={true} />
            </TankDrawer>
          </div>
        ))}
      </div>

      <div className="z-5 m-0 flex h-17 w-full flex-none flex-col gap-4 items-center justify-between rounded-b-xl border-x bg-muted/80 px-2 pb-2 font-medium backdrop-blur-2xl supports-backdrop-blur:bg-white/80 supports-backdrop-blur:dark:bg-black/10 md:flex-row xl:h-17 xl:rounded-xl xl:border-none xl:bg-transparent xl:p-0 ">
        <div className="w-full max-w-96 md:px-2">
          <div className="overflow-hidden">
            <table className="w-full border-collapse tabular-nums [&_td]:whitespace-nowrap [&_td]:px-2.5 [&_th]:px-2.5">
              <thead>
                <tr className="">
                  <th className="text-center font-black text-md">{tanks[0]?.park ?? "-"}</th>
                  <th className="text-right font-medium text-sm">ПФ</th>
                  <th className="text-right font-medium text-sm">РФ</th>
                  <th className="text-md text-right font-bold text-sky-900 bg-sky-500/15 dark:text-sky-200 dark:bg-sky-300/10">
                    Загалом
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm text-slate-800 dark:text-slate-200">
                <tr>
                  <td>Mаса вакуум, т</td>
                  <td className="text-right">{sumValues?.VaporMassSumVacuum?.toFixed(3) ?? "—"}</td>
                  <td className="text-right">{sumValues?.ProductMassSumVacuum?.toFixed(3) ?? "—"}</td>
                  <td className="text-md text-right font-bold text-slate-950 bg-sky-500/15 dark:text-white dark:bg-sky-300/10">
                    {sumValues?.CombinedProductMassSumVacuum?.toFixed(3) ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td>Маса повітря, т</td>
                  <td className="text-right">{sumValues?.VaporMassSum?.toFixed(3) ?? "—"}</td>
                  <td className="text-right">{sumValues?.ProductMassSum?.toFixed(3) ?? "—"}</td>
                  <td className="text-md text-right font-bold text-slate-950 bg-sky-500/15 dark:text-white dark:bg-sky-300/10">
                    {sumValues?.CombinedProductMassSum?.toFixed(3) ?? "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-row w-full max-w-96 items-center px-2 gap-2">
          <div className="flex w-full max-w-88 flex-col justify-center gap-1">
            <Meter
              value={sumValues?.ObservedVolumeSum ?? 0}
              max={sumValues?.FullVolumeSum ?? 0}
              label={`${
                timeDataUpdated
                  ? format(timeDataUpdated, "HH:mm:ss dd.MM")
                  : "-"
              } : Об'єм `}
              valueLabel={`${sumValues?.ObservedVolumeSum?.toFixed(3) ?? "-"} из ${sumValues?.FullVolumeSum?.toFixed(3) ?? "-"}  м³`}
              size="sm"
              color="var(--chart-1)"
              className=""
            />
            <div className="flex flex-row w-full justify-between text-sm">
              <div>
                V<sub>віл</sub>:
                {` ${sumValues?.FreeVolumeSum?.toFixed(3) ?? "-"}  м³`}
              </div>
              <div>{`Наповн.: ${sumValues?.VolumeSpeedSum?.toFixed(1) ?? "-"}  м³/год`}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeOffIcon size={40} /> : <Volume2Icon size={40} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
