import { useMemo, useState } from "react";

import { format } from "date-fns";

import UPlotReact from "./uplot-react";

function wheelZoomPlugin(opts) {
  const factor = opts.factor || 0.75;

  let xMin;
  let xMax;
  let yMin;
  let yMax;
  let xRange;
  let yRange;

  function clamp(nRange, nMin, nMax, fRange, fMin, fMax) {
    if (nRange > fRange) {
      nMin = fMin;
      nMax = fMax;
    } else if (nMin < fMin) {
      nMin = fMin;
      nMax = fMin + nRange;
    } else if (nMax > fMax) {
      nMax = fMax;
      nMin = fMax - nRange;
    }

    return [nMin, nMax];
  }

  return {
    hooks: {
      ready: (u) => {
        xMin = u.scales.x.min;
        xMax = u.scales.x.max;
        yMin = u.scales.y.min;
        yMax = u.scales.y.max;

        xRange = xMax - xMin;
        yRange = yMax - yMin;

        const over = u.over;
        const rect = over.getBoundingClientRect();

        // wheel drag pan
        over.addEventListener("mousedown", (e) => {
          if (e.button === 1) {
            //	plot.style.cursor = "move";
            e.preventDefault();

            const left0 = e.clientX;
            //	let top0 = e.clientY;

            const scXMin0 = u.scales.x.min;
            const scXMax0 = u.scales.x.max;

            const xUnitsPerPx = u.posToVal(1, "x") - u.posToVal(0, "x");

            function onmove(e) {
              e.preventDefault();

              const left1 = e.clientX;
              //	let top1 = e.clientY;

              const dx = xUnitsPerPx * (left1 - left0);

              u.setScale("x", {
                min: scXMin0 - dx,
                max: scXMax0 - dx,
              });
            }

            function onup(e) {
              document.removeEventListener("mousemove", onmove);
              document.removeEventListener("mouseup", onup);
            }

            document.addEventListener("mousemove", onmove);
            document.addEventListener("mouseup", onup);
          }
        });

        // wheel scroll zoom
        over.addEventListener("wheel", (e) => {
          e.preventDefault();

          const { left, top } = u.cursor;

          const leftPct = left / rect.width;
          const btmPct = 1 - top / rect.height;
          const xVal = u.posToVal(left, "x");
          const yVal = u.posToVal(top, "y");
          const oxRange = u.scales.x.max - u.scales.x.min;
          const oyRange = u.scales.y.max - u.scales.y.min;

          const nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor;
          let nxMin = xVal - leftPct * nxRange;
          let nxMax = nxMin + nxRange;
          [nxMin, nxMax] = clamp(nxRange, nxMin, nxMax, xRange, xMin, xMax);

          const nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor;
          let nyMin = yVal - btmPct * nyRange;
          let nyMax = nyMin + nyRange;
          [nyMin, nyMax] = clamp(nyRange, nyMin, nyMax, yRange, yMin, yMax);

          u.batch(() => {
            u.setScale("x", {
              min: nxMin,
              max: nxMax,
            });
          });
        });
      },
    },
  };
}

function touchZoomPlugin(opts) {
  function init(u, opts, data) {
    const over = u.over;
    let rect;
    let oxRange;
    let oyRange;
    let xVal;
    let yVal;
    const fr = { x: 0, y: 0, dx: 0, dy: 0 };
    const to = { x: 0, y: 0, dx: 0, dy: 0 };

    function storePos(t, e) {
      const ts = e.touches;

      const t0 = ts[0];
      const t0x = t0.clientX - rect.left;
      const t0y = t0.clientY - rect.top;

      if (ts.length === 1) {
        t.x = t0x;
        t.y = t0y;
        t.d = t.dx = t.dy = 1;
      } else {
        const t1 = e.touches[1];
        const t1x = t1.clientX - rect.left;
        const t1y = t1.clientY - rect.top;

        const xMin = Math.min(t0x, t1x);
        const yMin = Math.min(t0y, t1y);
        const xMax = Math.max(t0x, t1x);
        const yMax = Math.max(t0y, t1y);

        // midpts
        t.y = (yMin + yMax) / 2;
        t.x = (xMin + xMax) / 2;

        t.dx = xMax - xMin;
        t.dy = yMax - yMin;

        // dist
        t.d = Math.sqrt(t.dx * t.dx + t.dy * t.dy);
      }
    }

    let rafPending = false;

    function zoom() {
      rafPending = false;

      const left = to.x;
      const top = to.y;

      // non-uniform scaling
      //	let xFactor = fr.dx / to.dx;
      //	let yFactor = fr.dy / to.dy;

      // uniform x/y scaling
      const xFactor = fr.d / to.d;
      const yFactor = fr.d / to.d;

      const leftPct = left / rect.width;
      const btmPct = 1 - top / rect.height;

      const nxRange = oxRange * xFactor;
      const nxMin = xVal - leftPct * nxRange;
      const nxMax = nxMin + nxRange;

      const nyRange = oyRange * yFactor;
      const nyMin = yVal - btmPct * nyRange;
      const nyMax = nyMin + nyRange;

      u.batch(() => {
        u.setScale("x", {
          min: nxMin,
          max: nxMax,
        });
      });
    }

    function touchmove(e) {
      storePos(to, e);

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(zoom);
      }
    }

    over.addEventListener("touchstart", (e) => {
      rect = over.getBoundingClientRect();

      storePos(fr, e);

      oxRange = u.scales.x.max - u.scales.x.min;
      oyRange = u.scales.y.max - u.scales.y.min;

      const left = fr.x;
      const top = fr.y;

      xVal = u.posToVal(left, "x");
      yVal = u.posToVal(top, "y");

      document.addEventListener("touchmove", touchmove, { passive: true });
    });

    over.addEventListener("touchend", (e) => {
      document.removeEventListener("touchmove", touchmove, { passive: true });
    });
  }

  return {
    hooks: {
      init,
    },
  };
}

//for generating random numbers;
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomNumbersArray(length) {
  const randomNumbersArray = [];

  for (let i = 0; i < length; i++) {
    const randomNumber = getRandomNumber(10, 100);
    randomNumbersArray.push(randomNumber);
  }

  return randomNumbersArray;
}

//for generating timestamps
function generateTimestamps(length) {
  const timestamps = [];
  const intervalInMinutes = 1;

  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds

  for (let i = 0; i < length; i++) {
    const timestamp = now + i * intervalInMinutes * 60;
    timestamps.push(timestamp);
  }

  return timestamps;
}

export default function HooksApp({
  width,
  height,
  x,
  y1,
  y2,
  labely1,
  labely2,
}: {
  width: number;
  height: number;
  x?: any[];
  y1?: any[];
  y2?: any[];
  labely1: string;
  labely2: string;
}) {
  const axisColor = document.documentElement.classList.contains("dark")
    ? "#eeeeee"
    : "#18181b";
  const gridColor = document.documentElement.classList.contains("dark")
    ? "#555555"
    : "#cccccc";

  const options = useMemo(() => {
    const result = {
      width: width,
      height: height,
      axes: [
        {
          values: [
            // tick incr  default       year                        month   day                  hour   min               sec  mode
            [3600 * 24 * 365, "{YYYY}", null, null, null, null, null, null, 1],
            [
              3600 * 24 * 28,
              "{MMM}",
              "\n{YYYY}",
              null,
              null,
              null,
              null,
              null,
              1,
            ],
            [3600 * 24, "{D}.{M}", "\n{YYYY}", null, null, null, null, null, 1],
            [
              3600,
              "{HH}",
              "\n{D}.{M}.{YY}",
              null,
              "\n{D}.{M}",
              null,
              null,
              null,
              1,
            ],
            [
              60,
              "{HH}:{mm}",
              "\n{D}.{M}.{YY}",
              null,
              "\n{D}.{M}",
              null,
              null,
              null,
              1,
            ],
            [
              1,
              ":{ss}",
              "\n{D}.{M}.{YY} {HH}:{mm}",
              null,
              "\n{D}.{M} {HH}:{mm}",
              null,
              "\n{HH}:{mm}",
              null,
              1,
            ],
            [
              0.001,
              ":{ss}.{fff}",
              "\n{D}.{M}.{YY} {HH}:{mm}",
              null,
              "\n{D}.{M} {HH}:{mm}",
              null,
              "\n{HH}:{mm}",
              null,
              1,
            ],
          ],
          grid: {
            show: true,
            stroke: gridColor,
            width: 1,
          },
          ticks: {
            show: true,
            stroke: gridColor,
            width: 1,
          },
          stroke: axisColor,
          labelSize: 12,
        },
        {
          stroke: axisColor,
          scale: "main",
          size: 100,
          grid: {
            show: true,
            stroke: gridColor,
            width: 1,
          },
          ticks: {
            show: true,
            stroke: gridColor,
            width: 1,
          },
        },
        {
          side: 1,
          scale: "secondary",
          grid: {
            show: false,
          },
          ticks: {
            show: true,
            stroke: gridColor,
            width: 1,
          },
        },
      ],
      series: [
        {
          value: (self, rawValue) => {
            if (!rawValue) {
              return "--";
            }
            return `${format(new Date(rawValue * 1000), "HH:mm:ss dd.MM.yy")}`;
          },
        },
        {
          // initial toggled state (optional)
          show: true,
          scale: "main",
          spanGaps: false,
          // in-legend display
          label: labely1,
          value: (self, rawValue) => {
            if (!rawValue) {
              return "--";
            }
            return `${rawValue?.toFixed(2)}`;
          },

          // series style
          stroke: "#1447e6",
          width: 1,
          // fill: "rgba(255, 0, 0, 0.3)",
          // dash: [10, 5],
          band: true,
        },
      ],
      plugins: [wheelZoomPlugin(0.75), touchZoomPlugin()],
      scales: {
        x: {
          time: true,
          range: (self, newMin, newMax) => {
            const curMin = self.scales.x.min;
            const curMax = self.scales.x.max;

            // allow zoom
            return [newMin, newMax];
          },
        },
      },
      cursor: {
        drag: {
          x: true,
          y: false,
        },
        sync: {
          key: "moo",
        },
      },
    };
    return result;
  }, [height, width, labely1, labely2]);

  const data = useMemo(() => {
    return [
      // x-values (timestamps)
      x,
      y1, // y-values (series 1)
      y2, // y-values (series 2)
    ];
  }, [x, y1, y2]);

  return (
    <UPlotReact
      key="hooks-key"
      options={options}
      data={data}
      onDelete={(/* chart: uPlot */) => console.log("Deleted from hooks")}
      onCreate={(/* chart: uPlot */) => console.log("Created from hooks")}
    />
  );
}
