import { Fragment, useId, useState } from "react";
import { format, startOfDay, startOfMinute, startOfMonth } from "date-fns";
import { enGB, uk } from "date-fns/locale";
import { CalendarDays, Check, X } from "lucide-react";
import { useIntlayer, useLocale } from "react-intlayer";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  DATE_RANGE_PRESET_GROUPS,
  getDateRangePreset,
  getDateTimeRangeError,
  parseRangeDate,
  withRangeDay,
  type DateRangePreset,
  type DateTimeRange,
} from "@/lib/date-time-range";
import { cn } from "@/lib/utils";

interface DateTimeRangePickerProps {
  value: DateTimeRange;
  onChange: (range: DateTimeRange) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const dateText = (date: Date) => format(date, "dd.MM.yyyy");
const copyRange = (range: DateTimeRange): DateTimeRange => ({
  from: startOfMinute(range.from),
  to: startOfMinute(range.to),
});

function DateTimeRangePicker({ value, onChange, disabled, className, id }: DateTimeRangePickerProps) {
  const content = useIntlayer("date-time-range-picker");
  const { locale } = useLocale();
  const calendarLocale = locale === "uk" ? uk : enGB;
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [draft, setDraft] = useState(() => copyRange(value));
  const [texts, setTexts] = useState(() => ({ from: dateText(value.from), to: dateText(value.to) }));
  const [months, setMonths] = useState(() => ({ from: startOfMonth(value.from), to: startOfMonth(value.to) }));

  const from = parseRangeDate(texts.from, draft.from);
  const to = parseRangeDate(texts.to, draft.to);
  const error = getDateTimeRangeError(from, to, now);
  const selectedRange = from && to && from <= to
    ? { from: startOfDay(from), to: startOfDay(to) }
    : undefined;
  const activePreset = DATE_RANGE_PRESET_GROUPS.flat().find((preset) => {
    const range = getDateRangePreset(preset, now);
    return range && from?.getTime() === range.from.getTime() && to?.getTime() === range.to.getTime();
  });

  function resetDraft(range: DateTimeRange) {
    setDraft(copyRange(range));
    setTexts({ from: dateText(range.from), to: dateText(range.to) });
    setMonths({ from: startOfMonth(range.from), to: startOfMonth(range.to) });
  }

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      setNow(new Date());
      resetDraft(value);
    }
    setOpen(nextOpen);
  }

  function choosePreset(preset: DateRangePreset) {
    const currentTime = new Date();
    const range = getDateRangePreset(preset, currentTime);
    if (!range) return;
    setNow(currentTime);
    resetDraft(range);
  }

  function changeDay(endpoint: keyof DateTimeRange, day: Date) {
    setDraft((current) => ({ ...current, [endpoint]: withRangeDay(day, current[endpoint]) }));
    setTexts((current) => ({ ...current, [endpoint]: dateText(day) }));
    setMonths((current) => ({ ...current, [endpoint]: startOfMonth(day) }));
  }

  function changeDateText(endpoint: keyof DateTimeRange, text: string) {
    setTexts((current) => ({ ...current, [endpoint]: text }));
    const date = parseRangeDate(text, draft[endpoint]);
    if (date) {
      setDraft((current) => ({ ...current, [endpoint]: date }));
      setMonths((current) => ({ ...current, [endpoint]: startOfMonth(date) }));
    }
  }

  function apply() {
    if (!from || !to || getDateTimeRangeError(from, to, new Date())) return;
    onChange({ from, to });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={`${content.range.value}: ${format(value.from, "dd.MM.yyyy, HH:mm")} — ${format(value.to, "dd.MM.yyyy, HH:mm")}`}
          className={cn("h-auto min-h-9 w-full justify-start font-normal sm:w-auto", className)}
        >
          <CalendarDays aria-hidden="true" />
          <span className="flex flex-wrap items-center gap-x-1.5 text-left tabular-nums">
            <span>{format(value.from, "dd.MM.yyyy, HH:mm")}</span>
            <span aria-hidden="true">—</span>
            <span>{format(value.to, "dd.MM.yyyy, HH:mm")}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        aria-label={content.range.value}
        className="flex max-h-[var(--radix-popover-content-available-height)] w-[min(47.5rem,calc(100vw-2rem))] flex-col overflow-hidden p-0"
      >
        <div className="min-h-0 overflow-y-auto overscroll-contain md:grid md:grid-cols-[10.5rem_minmax(0,1fr)]">
          <div role="group" aria-label={content.presets.value} className="hidden border-r p-2 md:block">
            {DATE_RANGE_PRESET_GROUPS.map((group, index) => (
              <Fragment key={group[0]}>
                {index > 0 && <Separator className="my-2" />}
                {group.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn("w-full justify-start gap-2 px-2", activePreset === preset && "bg-accent")}
                    aria-pressed={activePreset === preset}
                    disabled={!getDateRangePreset(preset, now)}
                    onClick={() => choosePreset(preset)}
                  >
                    <Check aria-hidden="true" className={cn("size-4", activePreset !== preset && "invisible")} />
                    {content[preset]}
                  </Button>
                ))}
              </Fragment>
            ))}
          </div>
          <div className="min-w-0 space-y-4 p-4">
            <div className="space-y-2 md:hidden">
              <Label htmlFor={`${uid}-preset`}>{content.presets}</Label>
              <Select value={activePreset ?? "custom"} onValueChange={(preset) => {
                if (preset !== "custom") choosePreset(preset as DateRangePreset);
              }}>
                <SelectTrigger id={`${uid}-preset`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom" disabled>{content.custom}</SelectItem>
                  {DATE_RANGE_PRESET_GROUPS.map((group) => (
                    <Fragment key={group[0]}>
                      <SelectSeparator />
                      {group.map((preset) => (
                        <SelectItem key={preset} value={preset} disabled={!getDateRangePreset(preset, now)}>
                          {content[preset]}
                        </SelectItem>
                      ))}
                    </Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
              {(["from", "to"] as const).map((endpoint) => {
                const dateLabel = endpoint === "from" ? content.startDate : content.endDate;
                const timeLabel = endpoint === "from" ? content.startTime : content.endTime;
                const date = endpoint === "from" ? from : to;
                return (
                  <div key={endpoint} className="min-w-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${uid}-${endpoint}-date`}>{dateLabel}</Label>
                      <Input
                        id={`${uid}-${endpoint}-date`}
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={10}
                        placeholder={content.dateFormat.value}
                        value={texts[endpoint]}
                        onChange={(event) => changeDateText(endpoint, event.target.value)}
                        aria-invalid={!date || (date && startOfDay(date) > startOfDay(now)) || error === "reversedRange"}
                        aria-describedby={error ? `${uid}-error` : undefined}
                        className="text-center tabular-nums"
                      />
                    </div>
                    <Calendar
                      mode="range"
                      locale={calendarLocale}
                      weekStartsOn={1}
                      month={months[endpoint]}
                      onMonthChange={(month) => setMonths((current) => ({ ...current, [endpoint]: month }))}
                      endMonth={now}
                      today={now}
                      selected={selectedRange}
                      disabled={{ after: startOfDay(now) }}
                      onSelect={(_range, day, modifiers) => {
                        if (!modifiers.disabled) changeDay(endpoint, day);
                      }}
                      labels={{
                        labelNav: () => `${dateLabel.value}: ${content.navigation.value}`,
                        labelPrevious: () => content.previousCalendarMonth.value,
                        labelNext: () => content.nextCalendarMonth.value,
                        labelGrid: (month) => `${dateLabel.value}: ${format(month, "LLLL yyyy", { locale: calendarLocale })}`,
                        labelDayButton: (day, modifiers) => [
                          format(day, "PPPP", { locale: calendarLocale }),
                          modifiers.today && content.today.value,
                          modifiers.selected && content.selected.value,
                        ].filter(Boolean).join(", "),
                      }}
                    />
                    <Separator />
                    <div role="group" aria-labelledby={`${uid}-${endpoint}-time`} className="space-y-3">
                      <p id={`${uid}-${endpoint}-time`} className="text-center text-sm font-medium">{timeLabel}</p>
                      <TimePicker
                        date={draft[endpoint]}
                        hourCycle={24}
                        granularity="minute"
                        labels={{
                          hours: `${timeLabel.value}: ${content.hours.value}`,
                          minutes: `${timeLabel.value}: ${content.minutes.value}`,
                        }}
                        onChange={(date) => {
                          if (date) setDraft((current) => ({ ...current, [endpoint]: startOfMinute(date) }));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-popover p-3">
          {error && <p id={`${uid}-error`} role="alert" className="w-full text-sm text-destructive">{content[error]}</p>}
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            <X aria-hidden="true" />{content.cancel}
          </Button>
          <Button type="button" disabled={!!error} onClick={apply}>
            <Check aria-hidden="true" />{content.apply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DateTimeRangePicker };
export type { DateTimeRangePickerProps };
