import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";
import { format } from "date-fns";
import { Meter } from "@/components/ui/meter";
import TankDrawer from "@/components/tank-drawer";
import TankComponent from "@/components/tank-component";
import type { TankMeasurement } from "@/components/tank.types";
import { initializeTanksAndMqtt } from "@/lib/mqtt";
import { sumVolumesAndMass } from "@/lib/sumVolumeAndMass";

export const Route = createFileRoute("/{-$locale}/tank")({
  component: RouteComponent,
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
  const content = useIntlayer("tankContent");
  const [tanks, setTanks] = useState<TankMeasurement[]>();
  const [maxSumVolume, setMaxSumVolume] = useState<number>();
  const [sumVolume, setSumVolume] = useState<number>();
  const [sumFreeVolume, setSumFreeVolume] = useState<number>();
  const [sumSpeedVolume, setSumSpeedVolume] = useState<number>();
  const [maxSumMass, setMaxMass] = useState<number>();
  const [sumMass, setSumMass] = useState<number>();
  const [sumLiqMass, setSumLiqMass] = useState<number>();
  const [sumProdMass, setSumProdMass] = useState<number>();
  const [timeDataUpdated, setTimeDataUpdated] = useState<Date>();

  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const rows = import.meta.env.VITE_TANKVIEW_ROWS || 2;
  const cols = import.meta.env.VITE_TANKVIEW_COLS || 3;

  useEffect(() => {
    const result = sumVolumesAndMass(tanks ?? []);
    setTimeDataUpdated(new Date());
    setSumVolume(result?.ObservedVolumeSum);
    setMaxSumVolume(result?.FullVolumeSum);
    setSumMass(result?.ProductMassSum);
    setMaxMass(result?.FullProductMassSum);
    setSumLiqMass(result?.LiqMassSum);
    setSumProdMass(result?.ProductMassSum);
    setSumSpeedVolume(result?.VolumeSpeedSum);
    setSumFreeVolume(result?.FreeVolumeSum);
    console.log("tanks");
  }, [tanks]);

  useEffect(() => {
    if (clientRef.current) return;
    initializeTanksAndMqtt(setTanks, setIsConnected, clientRef);
    console.log("Init");
    return () => {
      // cleanup when leaving the page
      clientRef.current?.removeAllListeners();
      clientRef.current?.end(true);
      clientRef.current = null;
      setIsConnected(false);
    };
  }, []);

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

      <div className="z-2 m-0 flex h-auto w-full flex-none flex-col-reverse items-center justify-between rounded-b-xl border-x bg-muted/80 px-2 pb-2 font-medium backdrop-blur-2xl supports-backdrop-blur:bg-white/80 supports-backdrop-blur:dark:bg-black/10 md:flex-row xl:h-17 xl:rounded-xl xl:border-none xl:bg-transparent xl:p-0 ">
        <div className="flex w-full max-w-96 flex-col justify-center gap-2 px-2 py-1">
          <Meter
            value={sumMass ?? 0}
            max={maxSumMass}
            label={`${
              timeDataUpdated ? format(timeDataUpdated, "HH:mm:ss dd.MM") : "-"
            } - Маса `}
            valueLabel={`${sumMass?.toFixed(3) ?? "-"} of ${parseFloat(maxSumMass?.toFixed(3) ?? "") ?? "-"} т`}
            size="sm"
            color="var(--chart-2)"
            className="bg-muted-foreground"
          />
          <div className="flex flex-row w-full justify-between text-sm">
            <div>
              {" "}
              М<sub>пф</sub>:
              {` ${parseFloat(sumLiqMass?.toFixed(4) ?? "") ?? "-"}  т`}
            </div>
            <div>
              {" "}
              М<sub>рф</sub>:
              {` ${parseFloat(sumProdMass?.toFixed(4) ?? "") ?? "-"}  т`}
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-96 flex-col justify-center gap-0.5 px-2 py-1 md:gap-2">
          <Meter
            value={sumVolume ?? 0}
            max={maxSumVolume}
            label={`${
              timeDataUpdated ? format(timeDataUpdated, "HH:mm:ss dd.MM") : "-"
            } - Об'єм `}
            valueLabel={`${sumVolume?.toFixed(2) ?? "-"} из ${parseFloat(maxSumVolume?.toFixed(2) ?? "") ?? "-"}  м³`}
            size="sm"
            color="var(--chart-1)"
            className="bg-muted-foreground"
          />
          <div className="flex flex-row w-full justify-between text-sm">
            <div>
              V<sub>віл</sub>:
              {` ${parseFloat(sumFreeVolume?.toFixed(2) ?? "") ?? "-"}  м³`}
            </div>
            <div>{`Наповн.: ${parseFloat(sumSpeedVolume?.toFixed(1) ?? "") ?? "-"}  м³/год`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
