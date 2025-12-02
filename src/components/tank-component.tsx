import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { TankMeasurement } from "@/components/tank.types";
import { TriangleAlertIcon, CircleAlertIcon } from "lucide-react";

export default function TankComponent({
  values,
  visibility,
  temperatureHangerVisible = false,
}: {
  values: TankMeasurement;
  visibility?: boolean;
  temperatureHangerVisible?: boolean;
}) {
  const productColor: string = values?.color ? values.color : "bg-product";
  const sedimentColor: string = values?.sediment_color
    ? values.sediment_color
    : "bg-sediment";

  const [animate, setAnimate] = useState(false);

  const baseHeight: number = Number(
    values?.max_graduration_level ? values.max_graduration_level : 1,
  );

  const maxLevel: number = Number(values?.max_allowed_level ?? 0);
  const minLevel: number = Number(values?.min_allowed_level ?? 0);
  const level: number = Number(values?.product_level ?? 0);
  const sedimentLevel: number = Number(values?.sediment_level ?? 0);

  const productLevelPercent = ((level / baseHeight) * 100).toFixed(2);
  const sedimentLevelPercent = ((sedimentLevel / baseHeight) * 100).toFixed(2);
  const maxLevelPercent = ((maxLevel / baseHeight) * 100).toFixed(2);
  const minLevelPercent = ((minLevel / baseHeight) * 100).toFixed(2);

  const isError =
    level > maxLevel ||
    level < minLevel ||
    (sedimentLevel > 0 && sedimentLevel > maxLevel);

  const isWarning =
    values.mass_threshold && values.saved_mass
      ? Math.abs(Number(values.saved_mass) - Number(values.product_mass)) >
        Number(values.mass_threshold ?? 0)
      : false || (values.volume_threshold && values.saved_volume)
        ? Math.abs(
            Number(values.saved_volume) - Number(values.total_observed_volume),
          ) > Number(values.volume_threshold ?? 0)
        : false;

  useEffect(() => {
    if (isWarning) {
      try {
        const audio = new Audio("/path/to/alarm-sound.mp3");
        audio.play().catch((err) => console.error("Error:", err));
        console.log("Alarm playing");
      } catch (error) {
        console.error("Failed to play alarm:", error);
      }
    }
  }, [isWarning]);

  const topValues: any[] = [
    values?.name,
    values?.vapor_gross_observed_volume
      ? Number(values?.vapor_gross_observed_volume).toFixed(1) + " м³"
      : "-",
    values?.free_temperature
      ? Number(values?.free_temperature).toFixed(1) + " °C"
      : "-",
    values?.product_temperature
      ? Number(values?.product_temperature).toFixed(1) + " °C"
      : "-",
    values?.product_level
      ? (Number(values?.product_level) / 1000.0).toFixed(3) + " м"
      : "-",
    values?.observed_density
      ? Number(values?.observed_density).toFixed(4) + " "
      : "-",
  ];
  const bottomValues: any[] = [
    values?.pressure ? Number(values?.pressure).toFixed(3) + " bar" : "-",
    values?.gross_observed_volume
      ? Number(values?.gross_observed_volume).toFixed(3) + " м³"
      : "-",
    values?.product_mass ? Number(values?.product_mass).toFixed(4) + " т" : "-",
    values?.vapor_gross_mass
      ? Number(values?.vapor_gross_mass).toFixed(4) + " т"
      : "-",
    values?.gas_product_mass
      ? Number(values?.gas_product_mass).toFixed(4) + " т"
      : "-",
  ];

  const temperatureMarkers = [
    { temp: values?.t1, height: values?.th1 },
    { temp: values?.t2, height: values?.th2 },
    { temp: values?.t3, height: values?.th3 },
    { temp: values?.t4, height: values?.th4 },
    { temp: values?.t5, height: values?.th5 },
    { temp: values?.t6, height: values?.th6 },
    { temp: values?.t7, height: values?.th7 },
  ].reduce((acc: any[], marker) => {
    const numericTemp = Number(marker.temp);
    const numericHeight = Number(marker.height);

    if (
      baseHeight <= 0 ||
      !Number.isFinite(numericHeight) ||
      !Number.isFinite(numericTemp)
    ) {
      return acc;
    }

    const percent = Math.min(
      100,
      Math.max(0, (numericHeight / baseHeight) * 100),
    );

    acc.push({
      value: `${numericTemp.toFixed(1)} °C`,
      percent,
    });

    return acc;
  }, []);

  const speedArrowClass = cn({
    "absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 left-1/2 w-24 md:w-36 h-auto justify-center": true,
    "rotate-180 -translate-y-2/5":
      values?.product_speed && values?.product_speed < 0,
    hidden: values?.product_speed === undefined || values?.product_speed === 0,
  });

  useEffect(() => {
    setAnimate(!animate);
  }, [values]);

  const speedClass = cn({
    "absolute top-1/2 transform -translate-y-1/5 left-0 w-full h-auto justify-center": true,
    hidden:
      values?.product_speed === undefined || values?.product_speed === 0.0,
  });

  return (
    <div className="static flex h-full w-full">
      <div
        id={values?.id}
        className={cn(
          "relative h-full w-full items-end rounded-[6px] bg-linear-to-t from-primary/7 to-card font-semibold text-foreground/90 text-xs md:text-base",
          animate
            ? "border animate-borderFade"
            : "border animate-borderFadeOut",
          visibility ? "block" : "hidden",
          isWarning ? "" : "",
        )}
      >
        <div
          id="mainLevel"
          style={{ height: `${productLevelPercent}%` }}
          className={`absolute inset-x-0 bottom-0 w-full rounded-sm ${productColor}`}
        />
        <div
          id="sedimentLevel"
          style={{ height: `${sedimentLevelPercent}%` }}
          className={`absolute inset-x-0 bottom-0 w-full ${sedimentColor}`}
        />
        {maxLevel > 0 ? (
          <div
            id="maxLevel"
            style={{ height: `${maxLevelPercent}%` }}
            className={
              "absolute inset-x-0 bottom-0 w-full border-red-600 border-t-2 border-dashed flex justify-end"
            }
          >
            <TriangleAlertIcon
              size="40"
              className={cn(
                "m-2",
                isError || isWarning ? "visible" : "hidden",
                isWarning ? "text-yellow-400" : "",
                isError ? "text-red-500" : "",
              )}
            />
          </div>
        ) : (
          ""
        )}
        {minLevel > 0 ? (
          <div
            id="minLevel"
            style={{ height: `${minLevelPercent}%` }}
            className={
              "absolute inset-x-0 bottom-0 w-full border-red-600 border-t-2 border-dashed"
            }
          />
        ) : (
          ""
        )}
        {!temperatureHangerVisible ? (
          <div
            id="topParameters"
            className="absolute inset-x-0 top-0 h-16 w-full"
          >
            {topValues?.map((value: any, index: number) => {
              return (
                <div key={`T${index}`} className="w-full text-center font-bold">
                  {value}
                </div>
              );
            })}
          </div>
        ) : null}
        {!temperatureHangerVisible ? (
          <div
            id="bottomParameters"
            className="absolute inset-x-0 bottom-0 h-auto w-full"
          >
            {bottomValues?.map((x: any, index: number) => {
              return (
                <div key={`B${index}`} className="w-full text-center font-bold">
                  {x}
                </div>
              );
            })}
          </div>
        ) : null}
        {temperatureHangerVisible
          ? temperatureMarkers.map((marker: any, index: number) => (
              <div
                key={`temperature-${index}`}
                style={{ bottom: `${marker.percent}%` }}
                className="pointer-events-none absolute left-full -translate-x-full translate-y-1/2 whitespace-nowrap text-[10px] font-semibold  drop-shadow-md md:text-xs border p-0.5 bg-muted"
              >
                {marker.value}
              </div>
            ))
          : null}
        {!temperatureHangerVisible ? (
          <div id="speed" className={speedArrowClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 550"
              className="fill-muted-foreground opacity-75"
            >
              <path d="M288.662 352H31.338c-17.818 0-26.741-21.543-14.142-34.142l128.662-128.662c7.81-7.81 20.474-7.81 28.284 0l128.662 128.662c12.6 12.599 3.676 34.142-14.142 34.142z" />
            </svg>
          </div>
        ) : null}
        {!temperatureHangerVisible ? (
          <div id="speedValue" className={speedClass}>
            <div className="flex-col w-full text-center font-bold text-muted">
              <div>{values?.product_speed_volume?.toFixed(1) ?? "-"} м³/г</div>
              <div>{values?.product_speed_mass?.toFixed(1) ?? "-"} т/г</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
