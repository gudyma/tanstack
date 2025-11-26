import React, { useEffect, useRef } from "react";

import uPlot from "uplot";

import { dataMatch, optionsUpdateState } from "./common";

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

export default function UplotReactRange({
	data,
	target,
	onDelete = () => {},
	onCreate = () => {},
}: {
	data: uPlot.AlignedData;
	// eslint-disable-next-line
	target?: HTMLElement | ((self: uPlot, init: Function) => void);
	onDelete?: (chart: uPlot) => void;
	onCreate?: (chart: uPlot) => void;
}): JSX.Element | null {
	const chartRef = useRef<uPlot | null>(null);
	const chartRef2 = useRef<uPlot | null>(null);
	const targetRef = useRef<HTMLDivElement>(null);

	const initXmin = 1;
	const initXmax = 4.5;

	//----------------

	const doc = document;

	function debounce(fn) {
		let raf;

		return (...args) => {
			if (raf) return;

			raf = requestAnimationFrame(() => {
				fn(...args);
				raf = null;
			});
		};
	}

	function placeDiv(par, cls) {
		const el = doc.createElement("div");
		el.classList.add(cls);
		par.appendChild(el);
		return el;
	}

	function on(ev, el, fn) {
		el.addEventListener(ev, fn);
	}

	function off(ev, el, fn) {
		el.removeEventListener(ev, fn);
	}

	//----------------

	let x0;
	let lft0;
	let wid0;

	const lftWid = { left: null, width: null };
	const minMax = { min: null, max: null };

	function update(newLft, newWid) {
		const newRgt = newLft + newWid;
		const maxRgt = chartRef.current.bbox.width / devicePixelRatio;

		if (newLft >= 0 && newRgt <= maxRgt) {
			select(newLft, newWid);
			zoom(newLft, newWid);
		}
	}

	function select(newLft, newWid) {
		lftWid.left = newLft;
		lftWid.width = newWid;
		chartRef.current.setSelect(lftWid, false);
	}

	function zoom(newLft, newWid) {
		minMax.min = chartRef.current.posToVal(newLft, "x");
		minMax.max = chartRef.current.posToVal(newLft + newWid, "x");
		chartRef2.current.setScale("x", minMax);
	}

	function bindMove(e, onMove) {
		x0 = e.clientX;
		lft0 = chartRef.current.select.left;
		wid0 = chartRef.current.select.width;

		const _onMove = debounce(onMove);
		on("mousemove", doc, _onMove);

		const _onUp = (e) => {
			off("mouseup", doc, _onUp);
			off("mousemove", doc, _onMove);
			viaGrip = false;
		};
		on("mouseup", doc, _onUp);

		e.stopPropagation();
	}
	const axisColor = document.documentElement.classList.contains("dark")
		? "#eeeeee"
		: "#18181b";
	const gridColor = document.documentElement.classList.contains("dark")
		? "#555555"
		: "#cccccc";
	const rangerOpts = {
		width: window.innerWidth * 0.98,
		height: 100,

		axes: [
			{
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
		],
		cursor: {
			x: false,
			y: false,
			points: {
				show: false,
			},
			drag: {
				setScale: false,
				setSelect: true,
				x: true,
				y: false,
			},
			sync: {
				key: "moo",
			},
		},
		legend: {
			show: false,
		},
		scales: {
			x: {
				time: true,
			},
		},
		series: [
			{},
			{
				stroke: "#f54a00",
			},
		],
		hooks: {
			ready: [
				(uRanger) => {
					const left = Math.round(uRanger.valToPos(initXmin, "x"));
					const width = Math.round(uRanger.valToPos(initXmax, "x")) - left;
					const height = uRanger.bbox.height / devicePixelRatio;
					uRanger.setSelect({ left, width, height }, false);

					const sel = uRanger.root.querySelector(".u-select");

					on("mousedown", sel, (e) => {
						bindMove(e, (e) => update(lft0 + (e.clientX - x0), wid0));
					});

					on("mousedown", placeDiv(sel, "u-grip-l"), (e) => {
						bindMove(e, (e) =>
							update(lft0 + (e.clientX - x0), wid0 - (e.clientX - x0)),
						);
					});

					on("mousedown", placeDiv(sel, "u-grip-r"), (e) => {
						bindMove(e, (e) => update(lft0, wid0 + (e.clientX - x0)));
					});
				},
			],
			setSelect: [
				(uRanger) => {
					zoom(uRanger.select.left, uRanger.select.width);
				},
			],
		},
	};

	const zoomedOpts = {
		//	title: "Zoomed Area",
		width: window.innerWidth * 0.98,
		height: 400,
		axes: [
			{
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
		],
		cursor: {
			drag: {
				x: true,
				y: false,
			},
			sync: {
				key: "moo",
			},
		},
		plugins: [wheelZoomPlugin(0.75), touchZoomPlugin()],
		scales: {
			x: {
				show: false,
				time: true,
				range: (self, newMin, newMax) => {
					const curMin = self.scales.x.min;
					const curMax = self.scales.x.max;

					// allow zoom
					return [newMin, newMax];
				},
			},
		},

		series: [
			{
				label: "Time:",
			},
			{
				label: "sin(x)",
				stroke: "#f54a00",
			},
		],
	};

	function destroy(chart: uPlot | null) {
		if (chart) {
			onDelete(chart);
			chart.destroy();
		}
	}
	function create() {
		const newChart2 = new uPlot(
			zoomedOpts,
			data,
			target || (targetRef.current as HTMLDivElement),
		);
		const newChart = new uPlot(
			rangerOpts,
			data,
			target || (targetRef.current as HTMLDivElement),
		);

		chartRef.current = newChart;

		chartRef2.current = newChart2;
		onCreate(newChart);
	}
	// componentDidMount + componentWillUnmount
	useEffect(() => {
		create();
		return () => {
			destroy(chartRef.current);
			destroy(chartRef2.current);
			chartRef.current = null;
			chartRef2.current = null;
		};
	}, []);
	// componentDidUpdate
	const prevProps = useRef({ data, target }).current;
	useEffect(() => {
		const chart = chartRef.current;

		if (prevProps.data !== data) {
			if (!chart) {
				create();
			} else if (!dataMatch(prevProps.data, data)) {
				chart.setData(data);
			}
		}
		if (prevProps.target !== target) {
			destroy(chart);
			create();
		}

		return () => {
			prevProps.data = data;
			prevProps.target = target;
		};
	}, [data, target]);

	return target ? null : <div ref={targetRef} />;
}
