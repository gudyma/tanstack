import assert from "node:assert/strict";
import { test } from "node:test";
import { buildJournalGraphData, loadJournalGraphData } from "../src/lib/journal-graph";
import type { JournalGraphParameter } from "../src/lib/journal-graph";

const filters = {
  tank: "tank-2",
  startDate: "2026-11-07T12:00:00.000Z",
  endDate: "2026-11-07T13:00:00.000Z",
};
const parameters: JournalGraphParameter[] = [
  { value: "product_level", label: "Level", axis: "left" },
  { value: "sediment_level", label: "Sediment", axis: "left" },
  { value: "product_temperature", label: "Temperature", axis: "right" },
  { value: "pressure", label: "Pressure", axis: "right" },
];

async function withFetch(
  response: (url: URL) => Response | Promise<Response>,
  run: () => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input) => response(new URL(
    input instanceof Request ? input.url : String(input),
  ))) as typeof fetch;
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("plots successful parameters on both axes despite HTTP and network failures", async () => {
  const level = [{ timestamp: filters.startDate, parameter: "12" }];
  const pressure = [{ timestamp: filters.startDate, parameter: "1.2" }];
  await withFetch((url) => {
    switch (url.searchParams.get("parameter")) {
      case "product_level": return Response.json(level);
      case "sediment_level": return new Response("Unavailable", { status: 503 });
      case "product_temperature": throw new TypeError("Network error");
      default: return Response.json(pressure);
    }
  }, async () => {
    const { data, failures } = await loadJournalGraphData(
      "http://localhost:5000", filters, parameters, new AbortController().signal,
    );
    assert.deepEqual(failures.map(({ parameter }) => parameter.value), [
      "sediment_level", "product_temperature",
    ]);
    assert.deepEqual(buildJournalGraphData(parameters.map((parameter) => ({
      ...parameter,
      data: data[parameter.value] ?? [],
    }))), [
      [Date.parse(filters.startDate) / 1000],
      [12], [null], [null], [1.2],
    ]);
    assert.deepEqual(data, { product_level: level, pressure });
  });
});

test("invalid JSON or response shape does not discard another parameter's data", async () => {
  const rows = [{ timestamp: filters.startDate, parameter: 0 }];
  await withFetch((url) => {
    switch (url.searchParams.get("parameter")) {
      case "product_level": return new Response("invalid JSON");
      case "sediment_level": return Response.json({ error: "Invalid parameter" });
      default: return Response.json(rows);
    }
  }, async () => {
    const { data, failures } = await loadJournalGraphData(
      "http://localhost:5000", filters, parameters.slice(0, 3), new AbortController().signal,
    );
    assert.deepEqual(data, { product_temperature: rows });
    assert.deepEqual(failures.map(({ parameter }) => parameter.value), [
      "product_level", "sediment_level",
    ]);
  });
});

test("all failed requests return no data and identify every failed parameter", async () => {
  await withFetch(() => new Response(null, { status: 500 }), async () => {
    const result = await loadJournalGraphData(
      "http://localhost:5000", filters, parameters, new AbortController().signal,
    );
    assert.deepEqual(result.data, {});
    assert.deepEqual(result.failures.map(({ parameter }) => parameter), parameters);
  });
});

test("a later retry can load parameters that previously failed", async () => {
  let failing = true;
  await withFetch(() => failing
    ? new Response(null, { status: 500 })
    : Response.json([{ timestamp: filters.startDate, parameter: "42" }]),
  async () => {
    const first = await loadJournalGraphData(
      "http://localhost:5000", filters, parameters, new AbortController().signal,
    );
    assert.equal(first.failures.length, 4);
    failing = false;
    const retry = await loadJournalGraphData(
      "http://localhost:5000", filters, parameters, new AbortController().signal,
    );
    assert.deepEqual(retry.failures, []);
    assert.equal(Object.keys(retry.data).length, 4);
  });
});

test("cancellation discards late results from an obsolete graph request", async () => {
  let resolveResponse!: (response: Response) => void;
  const response = new Promise<Response>((resolve) => { resolveResponse = resolve; });
  await withFetch(() => response, async () => {
    const controller = new AbortController();
    const loading = loadJournalGraphData(
      "http://localhost:5000", filters, parameters.slice(0, 1), controller.signal,
    );
    controller.abort();
    resolveResponse(Response.json([{ timestamp: filters.startDate, parameter: "42" }]));
    await assert.rejects(loading, { name: "AbortError" });
  });
});
