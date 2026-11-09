import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IntlayerProvider } from "react-intlayer";
import { Calendar } from "../src/components/ui/calendar";
import { TimePicker } from "../src/components/ui/date-range-picker";
import { DateTimeRangePicker } from "../src/components/ui/date-time-range-picker";

for (const [locale, label] of [["uk", "Період дати й часу"], ["en", "Date and time range"]] as const) {
  test(`${locale}: renders the range picker with localized labels and the supplied cached dates`, () => {
    let changes = 0;
    const markup = renderToStaticMarkup(<IntlayerProvider locale={locale}>
      <DateTimeRangePicker
        value={{ from: new Date(2025, 0, 1, 8, 5), to: new Date(2025, 11, 31, 21, 47) }}
        onChange={() => changes++}
      />
    </IntlayerProvider>);
    assert.ok(markup.includes(`aria-label="${label}: 01.01.2025, 08:05 — 31.12.2025, 21:47"`));
    assert.equal(changes, 0);
  });
}

test("start and end TimePickers have separate labelled hours and minutes with no duplicate IDs", () => {
  const markup = renderToStaticMarkup(<>
    <TimePicker date={new Date(2026, 10, 9, 8, 5)} granularity="minute"
      labels={{ hours: "Час початку: Години", minutes: "Час початку: Хвилини" }} />
    <TimePicker date={new Date(2026, 10, 9, 21, 47)} granularity="minute"
      labels={{ hours: "Час завершення: Години", minutes: "Час завершення: Хвилини" }} />
  </>);
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const labels = [...markup.matchAll(/\bfor="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 4);
  assert.equal(new Set(ids).size, 4);
  assert.equal(labels.length, 2);
  for (const label of labels) assert.ok(ids.includes(label));
  for (const value of ["08", "05", "21", "47"]) assert.ok(markup.includes(`value="${value}"`));
  assert.ok(markup.includes('aria-label="Час початку: Години"'));
  assert.ok(markup.includes('aria-label="Час завершення: Хвилини"'));
});

test("calendar highlights a shared range with endpoint buttons and disables future days", () => {
  const markup = renderToStaticMarkup(<Calendar
    mode="range"
    month={new Date(2026, 10, 1)}
    selected={{ from: new Date(2026, 10, 7), to: new Date(2026, 10, 9) }}
    onSelect={() => {}}
    disabled={{ after: new Date(2026, 10, 9) }}
    labels={{ labelNext: () => "Наступний місяць", labelPrevious: () => "Попередній місяць" }}
  />);
  assert.equal((markup.match(/aria-selected="true"/g) ?? []).length, 3);
  assert.equal((markup.match(/bg-primary text-primary-foreground/g) ?? []).length, 2);
  assert.ok(markup.includes('data-day="2026-11-10" data-disabled="true"'));
  assert.ok(markup.includes('aria-label="Наступний місяць"'));
});
