import { useMemo } from "react";
import type uPlot from "uplot";
import { format } from "date-fns";
import UPlotReact from "./uplot-react";
import {
  buildJournalGraphData,
  getJournalPlotSeries,
  type JournalGraphSeries,
} from "@/lib/journal-graph";

// Interactions change only time; each Y axis keeps its own automatic scale.
function wheelZoomPlugin(factor = 0.75): uPlot.Plugin {
  const controller = new AbortController();
  const listenerOptions = { signal: controller.signal };

  return {
    hooks: {
      ready: (u) => {
        const over = u.over;
        over.addEventListener("mousedown", (event) => {
          if (event.button !== 1) return;
          event.preventDefault();
          const left = event.clientX;
          const { min, max } = u.scales.x;
          if (min == null || max == null) return;
          const unitsPerPixel = u.posToVal(1, "x") - u.posToVal(0, "x");

          const move = (event: MouseEvent) => {
            event.preventDefault();
            const delta = unitsPerPixel * (event.clientX - left);
            u.setScale("x", { min: min - delta, max: max - delta });
          };
          const stop = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", stop);
          };
          document.addEventListener("mousemove", move, listenerOptions);
          document.addEventListener("mouseup", stop, listenerOptions);
        }, listenerOptions);

        over.addEventListener("wheel", (event) => {
          event.preventDefault();
          const { min, max } = u.scales.x;
          const timestamps = u.data[0];
          const width = over.getBoundingClientRect().width;
          if (!width || min == null || max == null || timestamps.length < 2) return;

          const fullMin = timestamps[0];
          const fullMax = timestamps[timestamps.length - 1];
          const range = Math.min(
            event.deltaY < 0 ? (max - min) * factor : (max - min) / factor,
            fullMax - fullMin,
          );
          if (range <= 0) return;
          const left = u.cursor.left ?? 0;
          const nextMin = Math.max(fullMin, Math.min(
            u.posToVal(left, "x") - (left / width) * range,
            fullMax - range,
          ));
          u.setScale("x", { min: nextMin, max: nextMin + range });
        }, { ...listenerOptions, passive: false });
      },
      destroy: () => controller.abort(),
    },
  };
}

function touchZoomPlugin(): uPlot.Plugin {
  const controller = new AbortController();
  const listenerOptions = { signal: controller.signal, passive: true };
  let animationFrame = 0;

  return {
    hooks: {
      ready: (u) => {
        let rect: DOMRect;
        let originalRange = 0;
        let anchor = 0;
        let originalDistance = 1;
        let position = { x: 0, distance: 1 };
        let touching = false;

        function touchPosition(event: TouchEvent) {
          const first = event.touches[0];
          const second = event.touches[1];
          return second ? {
            x: (first.clientX + second.clientX) / 2 - rect.left,
            distance: Math.max(1, Math.hypot(
              second.clientX - first.clientX,
              second.clientY - first.clientY,
            )),
          } : { x: first.clientX - rect.left, distance: 1 };
        }

        function move(event: TouchEvent) {
          if (!event.touches.length) return;
          position = touchPosition(event);
          if (animationFrame) return;
          animationFrame = requestAnimationFrame(() => {
            animationFrame = 0;
            const range = originalRange * originalDistance / position.distance;
            const min = anchor - position.x / rect.width * range;
            u.setScale("x", { min, max: min + range });
          });
        }

        function stop() {
          touching = false;
          document.removeEventListener("touchmove", move);
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }

        function start(event: TouchEvent) {
          stop();
          if (!event.touches.length) return;
          rect = u.over.getBoundingClientRect();
          const { min, max } = u.scales.x;
          if (!rect.width || min == null || max == null) return;
          touching = true;
          position = touchPosition(event);
          originalRange = max - min;
          originalDistance = position.distance;
          anchor = u.posToVal(position.x, "x");
          document.addEventListener("touchmove", move, listenerOptions);
        }

        u.over.addEventListener("touchstart", start, listenerOptions);
        document.addEventListener("touchend", (event) => {
          if (!touching) return;
          stop();
          if (event.touches.length) start(event);
        }, listenerOptions);
        document.addEventListener("touchcancel", stop, listenerOptions);
      },
      destroy: () => {
        controller.abort();
        cancelAnimationFrame(animationFrame);
      },
    },
  };
}

export default function HooksApp({
  width,
  height,
  series,
  leftAxisLabel,
  rightAxisLabel,
}: {
  width: number;
  height: number;
  series: JournalGraphSeries[];
  leftAxisLabel: string;
  rightAxisLabel: string;
}) {
  const dark = typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const axisColor = dark ? "#eeeeee" : "#18181b";
  const gridColor = dark ? "#555555" : "#cccccc";

  const options = useMemo<uPlot.Options>(() => ({
    width,
    height,
    axes: [
      {
        values: [
          [3600 * 24 * 365, "{YYYY}", null, null, null, null, null, null, 1],
          [3600 * 24 * 28, "{MMM}", "\n{YYYY}", null, null, null, null, null, 1],
          [3600 * 24, "{D}.{M}", "\n{YYYY}", null, null, null, null, null, 1],
          [3600, "{HH}", "\n{D}.{M}.{YY}", null, "\n{D}.{M}", null, null, null, 1],
          [60, "{HH}:{mm}", "\n{D}.{M}.{YY}", null, "\n{D}.{M}", null, null, null, 1],
          [1, ":{ss}", "\n{D}.{M}.{YY} {HH}:{mm}", null, "\n{D}.{M} {HH}:{mm}", null, "\n{HH}:{mm}", null, 1],
          [0.001, ":{ss}.{fff}", "\n{D}.{M}.{YY} {HH}:{mm}", null, "\n{D}.{M} {HH}:{mm}", null, "\n{HH}:{mm}", null, 1],
        ],
        grid: { show: true, stroke: gridColor, width: 1 },
        ticks: { show: true, stroke: gridColor, width: 1 },
        stroke: axisColor,
        labelSize: 12,
      },
      {
        scale: "left",
        side: 3,
        label: leftAxisLabel,
        show: series.some((parameter) => parameter.axis === "left"),
        size: 70,
        stroke: axisColor,
        grid: { show: true, stroke: gridColor, width: 1 },
        ticks: { show: true, stroke: gridColor, width: 1 },
      },
      {
        scale: "right",
        side: 1,
        label: rightAxisLabel,
        show: series.some((parameter) => parameter.axis === "right"),
        size: 70,
        stroke: axisColor,
        grid: {
          show: !series.some((parameter) => parameter.axis === "left"),
          stroke: gridColor,
          width: 1,
        },
        ticks: { show: true, stroke: gridColor, width: 1 },
      },
    ],
    series: [
      {
        value: (_chart, value) => value == null
          ? "--"
          : format(new Date(value * 1000), "HH:mm:ss dd.MM.yy"),
      },
      ...getJournalPlotSeries(series),
    ],
    scales: {
      x: { time: true },
      left: { auto: true },
      right: { auto: true },
    },
    plugins: [wheelZoomPlugin(), touchZoomPlugin()],
    cursor: {
      drag: { x: true, y: false },
      sync: { key: "moo" },
    },
  }), [width, height, series, leftAxisLabel, rightAxisLabel, axisColor, gridColor]);

  const data = useMemo(() => buildJournalGraphData(series), [series]);

  return <UPlotReact options={options} data={data} />;
}
