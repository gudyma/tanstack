import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const meterVariants = cva("relative h-4 w-full overflow-hidden rounded-full", {
  variants: {
    variant: {
      default: "bg-ring/20",
      success: "bg-success/20",
      warning: "bg-warning/20",
      danger: "bg-danger/20",
    },
    size: {
      sm: "h-2",
      default: "h-4",
      lg: "h-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const meterIndicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
    },
    size: {
      sm: "h-2",
      default: "h-4",
      lg: "h-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface MeterProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof meterVariants> {
  value: number;
  max?: number;
  label?: string;
  valueLabel?: string;
  color?: string;
}

const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      className,
      value,
      max = 100,
      label,
      valueLabel,
      variant,
      size,
      color,
      ...props
    },
    ref,
  ) => {
    const percentage = (value / max) * 100;
    return (
      <div className="space-y-2">
        {(label || valueLabel) && (
          <div className="flex items-center justify-between text-sm">
            {label && <div>{label}</div>}
            {valueLabel && <div>{valueLabel}</div>}
          </div>
        )}
        <div
          ref={ref}
          className={cn(meterVariants({ variant, size, className }))}
          {...props}
        >
          <div
            className={cn(meterIndicatorVariants({ variant, size }))}
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    );
  },
);
Meter.displayName = "Meter";

export { Meter };
