"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { type PropsWithChildren } from "react";
import TankComponent from "@/components/tank-component";
import type {
  TankMeasurement,
  TankSettingsForm,
} from "@/components/tank.types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TankDrawerProps {
  values: TankMeasurement;
}

function TankDrawerElements({ values }: TankDrawerProps) {
  const formSchema = z.object({
    max_allowed_level: z
      .number()
      .min(0)
      .max(values.max_graduration_level ?? 20000)
      .nullable(),

    min_allowed_level: z
      .number()
      .min(0)
      .max(values.max_graduration_level ?? 20000)
      .nullable(),

    volume_threshold: z
      .number()
      .min(0)
      .max(values.max_graduration_volume ?? 10000)
      .nullable(),

    mass_threshold: z
      .number()
      .min(0)
      .max(values.max_graduration_volume ?? 10000)
      .nullable(),
  });

  const thresholdsForm = useForm({
    defaultValues: {
      max_allowed_level: values.max_allowed_level,
      min_allowed_level: values.min_allowed_level,
      volume_threshold: values.volume_threshold,
      mass_threshold: values.mass_threshold,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (value.max_allowed_level && value.max_allowed_level > 0) {
        console.log(value.max_allowed_level);
      }
      if (value.min_allowed_level && value.min_allowed_level > 0) {
        console.log(value.min_allowed_level);
      }

      if (value.mass_threshold && value.mass_threshold > 0) {
        console.log(value.mass_threshold);
      }
      if (value.volume_threshold && value.volume_threshold > 0) {
        console.log(value.volume_threshold);
      }
      toast("You submitted the following values:", {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      });
    },
  });

  const [volumeThresholdEnabled, setVolumeThresholdEnabled] = useState(
    values.volume_threshold != null,
  );
  const [massThresholdEnabled, setMassThresholdEnabled] = useState(
    values.mass_threshold != null,
  );
  const handleVolumeToggle = (enabled: boolean) => {
    setVolumeThresholdEnabled(enabled);
    if (!enabled) {
      thresholdsForm.setFieldValue("volume_threshold", null);
    }
  };

  const handleMassToggle = (enabled: boolean) => {
    setMassThresholdEnabled(enabled);
    if (!enabled) {
      thresholdsForm.setFieldValue("mass_threshold", null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row-reverse w-full h-96 items-center sm:items-start overflow-y-auto gap-4">
      <div className="flex flex-col w-full md:max-w-64 gap-y-1">
        <Card className="w-full sm:max-w-sm py-4">
          <CardContent className="">
            <form
              id="form"
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                void thresholdsForm.handleSubmit();
              }}
            >
              <FieldGroup className="gap-2.5">
                <thresholdsForm.Field
                  name="max_allowed_level"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Макс. аварійний рівень, мм
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="any"
                          value={Number(field.state.value)}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          inputMode="decimal"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <thresholdsForm.Field
                  name="min_allowed_level"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Мін. аварійний рівень, мм
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="any"
                          value={Number(field.state.value)}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          inputMode="decimal"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <thresholdsForm.Field
                  name="volume_threshold"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor={field.name}>
                            Поріг об&apos;єму, м³
                          </FieldLabel>
                          <Switch
                            aria-label="Увімкнути поріг об'єму"
                            checked={volumeThresholdEnabled}
                            onCheckedChange={handleVolumeToggle}
                            aria-checked={volumeThresholdEnabled}
                          />
                        </div>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="any"
                          value={Number(field.state.value)}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          inputMode="decimal"
                          className={cn(
                            "w-full",
                            volumeThresholdEnabled ? "visible" : "hidden",
                          )}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <thresholdsForm.Field
                  name="mass_threshold"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor={field.name}>
                            Поріг маси, т
                          </FieldLabel>
                          <Switch
                            aria-label="Увімкнути поріг маси"
                            checked={massThresholdEnabled}
                            onCheckedChange={handleMassToggle}
                            aria-checked={massThresholdEnabled}
                          />
                        </div>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="any"
                          value={Number(field.state.value)}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          inputMode="decimal"
                          className={cn(
                            "w-full",
                            massThresholdEnabled ? "visible" : "hidden",
                          )}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <Button type="submit" form="form">
                  Зберегти
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-row w-full">
        <div className="flex flex-col w-full px-4 min-h-96 gap-y-1">
          <Label className="font-bold">Об'єм при 15 С</Label>
          <Label className="mb-0.5">{`${values.standard_gross_volume_at15_c ?? "-"} м³`}</Label>
          <Separator />
          <Label className="font-bold">Густина продукту</Label>
          <Label className="mb-0.5">{`${values.observed_density ?? "-"} т/м³`}</Label>
          <Separator />
          <Label className="font-bold">Маса (РФ) у вакуумі</Label>
          <Label className="mb-0.5">{`${values.standard_gross_mass_in_vacuume ?? "-"} т`}</Label>
          <Separator />
          <Label className="font-bold">Маса (РФ)</Label>
          <Label className="mb-0.5">{`${values.product_mass ?? "-"} т`}</Label>
          <Separator />
          <Label className="font-bold">Маса (ПФ) у вакуумі</Label>
          <Label className="mb-0.5">{`${values.vapor_gross_mass_in_vacuume ?? "-"} т`}</Label>
          <Separator />
          <Label className="font-bold">Маса (ПФ)</Label>
          <Label className="mb-0.5">{`${values.vapor_gross_mass ?? "-"} т`}</Label>
          <Separator />
          <Label className="font-bold">Загальна маса продукту</Label>
          <Label className="mb-0.5">{`${values.gas_product_mass ?? "-"} т`}</Label>
          <Separator />
          <Label className="font-bold">Молярна маса</Label>
          <Label className="mb-0.5">{`${values.molar_mass ?? "-"}`}</Label>
        </div>
        <div className="flex flex-col w-full px-4 min-h-96 gap-y-1">
          <Label className="font-bold">Рівень продукту</Label>
          <Label className="">{`${values.product_level ?? "-"} мм`}</Label>
          <Separator />
          <Label className="font-bold">Рівень осаду</Label>
          <Label className="mb-0.5">{`${values.sediment_level ?? "-"} мм`}</Label>
          <Separator />
          <Label className="font-bold">Температура ПФ</Label>
          <Label className="mb-0.5">{`${values.free_temperature ?? "-"} C`}</Label>
          <Separator />
          <Label className="font-bold">Температура РФ</Label>
          <Label className="mb-0.5">{`${values.product_temperature ?? "-"} C`}</Label>
          <Separator />
          <Label className="font-bold">Тиск</Label>
          <Label className="mb-0.5">{`${values.pressure ?? "-"} bar`}</Label>
          <Separator />
          <Label className="font-bold">Зайнятий об'єм</Label>
          <Label className="mb-0.5">{`${values.total_observed_volume ?? "-"} м³`}</Label>
          <Separator />
          <Label className="font-bold">Нормований об'єм</Label>
          <Label className="mb-0.5">{`${values.gross_observed_volume ?? "-"} м³`}</Label>
          <Separator />
          <Label className="font-bold">Вільний об'єм</Label>
          <Label className="mb-0.5">{`${values.vapor_gross_observed_volume ?? "-"} м³`}</Label>
          <Separator />
          <Label className="font-bold">Об'єм осаду</Label>
          <Label className="mb-0.5">{`${values.sediment_volume ?? "-"} м³`}</Label>
        </div>
      </div>
      <div className="min-h-64 sm:min-h-96 w-full h-full max-w-28">
        <TankComponent
          values={values}
          temperatureHangerVisible={true}
          visibility={true}
        />
      </div>
    </div>
  );
}

export default function TankDrawer({
  values,
  children,
}: PropsWithChildren<TankDrawerProps>) {
  const [open, setOpen] = useState(false);
  const isDesktop = !useIsMobile();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-full w-full"
        >
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="">
            <DrawerTitle>Tank: {values?.label}</DrawerTitle>
          </DialogHeader>
          <TankDrawerElements values={values} />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        onClick={() => setOpen(true)}
        className="flex items-center justify-center h-full w-full"
      >
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-2 py-0 text-left">
          <DrawerTitle>Tank: {values?.label}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 w-full h-full">
          <TankDrawerElements values={values} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
