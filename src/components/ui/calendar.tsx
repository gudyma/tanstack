import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayButton, type DayPickerProps } from "react-day-picker";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({ className, classNames, components, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays
      fixedWeeks
      className={cn("relative w-full", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "w-full space-y-2",
        month_caption: "mx-9 flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium capitalize",
        nav: "pointer-events-none absolute inset-x-0 top-0 flex justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "pointer-events-auto"),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "pointer-events-auto"),
        month_grid: "w-full table-fixed border-collapse",
        weekdays: "h-8",
        weekday: "text-center text-xs font-normal text-muted-foreground",
        week: "h-9",
        day: "relative p-0 text-center text-sm [&:has(button:focus-visible)]:z-10",
        range_start: "rounded-l-md bg-accent",
        range_end: "rounded-r-md bg-accent",
        range_middle: "bg-accent text-accent-foreground",
        today: "font-semibold",
        outside: "text-muted-foreground opacity-40",
        disabled: "text-muted-foreground opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) => orientation === "left"
          ? <ChevronLeft aria-hidden="true" className={cn("size-4", className)} />
          : <ChevronRight aria-hidden="true" className={cn("size-4", className)} />,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ day, modifiers, className, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const endpoint = modifiers.range_start || modifiers.range_end ||
    (modifiers.selected && !modifiers.range_middle);

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "h-9 w-full rounded-md p-0 font-normal",
        modifiers.today && "underline underline-offset-4",
        modifiers.range_middle && "rounded-none",
        endpoint && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar };
