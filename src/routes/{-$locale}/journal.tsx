import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer, useLocale } from "react-intlayer";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import MultipleSelector, {
  type Option,
} from "@/components/ui/multiple-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import HooksApp from "@/components/uplot/uplot-react-example";
import JournalTable from "@/components/journal-table";
import type { Tank, TankParameterData } from "@/components/tank.types";
import {
  JOURNAL_FILTERS_STORAGE_KEY,
  parseJournalFilters,
  type JournalFilters,
} from "@/lib/journal-filters";
import {
  getJournalAxisOptions,
  loadJournalGraphData,
  setJournalAxisParameters,
  type JournalAxisParameters,
  type JournalGraphParameter,
} from "@/lib/journal-graph";

const OPTIONS: Option[] = [
  { label: "Рівень продукту, мм", value: "product_level" },
  { label: "Рівень осаду, мм", value: "sediment_level" },
  { label: "Температура продукту, С", value: "product_temperature" },
  { label: "Температура ПФ, С", value: "free_temperature" },
  { label: "Тиск, бар", value: "pressure" },
  { label: "Швидкість, мм/хв", value: "product_speed" },
  { label: "Об'єм, м3", value: "total_observed_volume" },
  { label: "Об'єм продукту, м3", value: "gross_observed_volume" },
  { label: "Об'єм ПФ, м3", value: "vapor_gross_observed_volume" },
  { label: "Об'єм осаду, м3", value: "sediment_volume" },
  { label: "Об'єм 15 С, м3", value: "standard_gross_volume_at15c" },
  { label: "Густина, ", value: "observed_density" },
  { label: "Маса продукту (вак.), т", value: "standard_gross_mass_in_vacuume" },
  { label: "Маса продукту, т", value: "product_mass" },
  { label: "Маса ПФ (вак.), т", value: "vapor_gross_mass_in_vacuum" },
  { label: "Маса ПФ, т", value: "vapor_gross_mass" },
  { label: "Загальна маса", value: "gas_product_mass" },
  { label: "Т1", value: "t1" },
  { label: "Т2", value: "t2" },
  { label: "Т3", value: "t3" },
  { label: "Т4", value: "t4" },
  { label: "Т5", value: "t5" },
  { label: "Т6", value: "t6" },
  { label: "Т7", value: "t7" },
];
import { getTanks } from "@/lib/serverFunctions";

export const Route = createFileRoute("/{-$locale}/journal")({
  component: RouteComponent,
  loader: () => getTanks(),
  head: ({ params }) => {
    const { locale } = params;
    const metaContent = getIntlayer("journalContent", locale);

    return {
      meta: [
        { title: metaContent.title },
        { content: metaContent.meta.description, name: "description" },
      ],
    };
  },
});

function RouteComponent() {
  const loaderData: Tank[] = Route.useLoaderData();

  const content = useIntlayer("journalContent");
  const { locale } = useLocale();

  const [endDate, setEndDate] = useState(() => new Date());
  const [startDate, setStartDate] = useState(
    () => new Date(endDate.getTime() - 60 * 60 * 1000),
  );
  const [tank, setTank] = useState("");
  const [filtersRestored, setFiltersRestored] = useState(false);
  // Only this snapshot is used for requests; editing the selectors is local.
  const [appliedFilters, setAppliedFilters] = useState<JournalFilters | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const [tableLoading, setTableLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const validRange =
    Number.isFinite(startDate.getTime()) &&
    Number.isFinite(endDate.getTime()) &&
    startDate <= endDate;

  useEffect(() => {
    try {
      const saved = parseJournalFilters(
        localStorage.getItem(JOURNAL_FILTERS_STORAGE_KEY),
      );
      if (saved) {
        setStartDate(new Date(saved.startDate));
        setEndDate(new Date(saved.endDate));
        if (loaderData.some((item) => item.value === saved.tank)) {
          setTank(saved.tank);
          setAppliedFilters(saved);
        }
      }
    } catch (error) {
      console.warn("Could not restore journal filters:", error);
    }
    setFiltersRestored(true);
  }, []);

  useEffect(() => {
    if (!filtersRestored || !validRange) return;

    try {
      localStorage.setItem(
        JOURNAL_FILTERS_STORAGE_KEY,
        JSON.stringify({
          tank,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        } satisfies JournalFilters),
      );
    } catch (error) {
      console.warn("Could not save journal filters:", error);
    }
  }, [filtersRestored, tank, startDate, endDate, validRange]);

  function updateData() {
    if (!tank || !validRange) return;

    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    // A new snapshot also refreshes requests when the values have not changed.
    setAppliedFilters({
      tank,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  const [axisParameters, setAxisParameters] = useState<JournalAxisParameters>({
    left: [],
    right: [],
  });
  const parameters = useMemo<JournalGraphParameter[]>(() => [
    ...axisParameters.left.map((parameter) => ({
      ...parameter,
      axis: "left" as const,
    })),
    ...axisParameters.right.map((parameter) => ({
      ...parameter,
      axis: "right" as const,
    })),
  ], [axisParameters]);
  const [parameterData, setParameterData] = useState<
    Record<string, TankParameterData[]>
  >({});
  const graphSeries = useMemo(
    () => parameters.map((parameter) => ({
      ...parameter,
      data: parameterData[parameter.value] ?? [],
    })),
    [parameters, parameterData],
  );
  const baseURL = process.env.API_URL || "http://localhost:5000";
  const dataLoadError = content.DataLoadError.value;
  const parameterLoadError = content.ParameterDataLoadError.value;

  useEffect(() => {
    setParameterData({});
    if (!appliedFilters || parameters.length === 0) {
      setGraphLoading(false);
      return;
    }

    const filters = appliedFilters;
    const controller = new AbortController();
    setGraphLoading(true);

    async function loadGraphData() {
      try {
        const { data, failures } = await loadJournalGraphData(
          baseURL,
          filters,
          parameters,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setParameterData(data);
          if (failures.length > 0) {
            failures.forEach(({ parameter, error }) => {
              console.error(`Error loading ${parameter.value}:`, error);
            });
            toast.error(parameterLoadError, {
              description: failures.map(({ parameter }) => parameter.label).join(", "),
            });
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading parameter data:", error);
          toast.error(dataLoadError);
        }
      } finally {
        if (!controller.signal.aborted) setGraphLoading(false);
      }
    }

    void loadGraphData();
    return () => controller.abort();
  }, [appliedFilters, parameters, baseURL, dataLoadError, parameterLoadError]);

  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const updateSize = () => {
      const { width, height } = box.getBoundingClientRect();
      setWidth(width);
      setHeight(Math.max(0, height - 50));
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative my-1 h-full w-full overflow-auto md:mb-0">
      <div className="sticky top-0 z-50 w-full items-center justify-center border-x border-b bg-muted/60 backdrop-blur-sm">
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 px-2 py-2 md:px-4">
          <div className="flex w-full flex-row sm:w-auto">
            <Label className="mr-2" htmlFor="tankSelect">
              {content.TankSelectHeader}
            </Label>
            <Select name="Tank name" value={tank} onValueChange={setTank}>
              <SelectTrigger className="w-full" id="tankSelect">
                <SelectValue placeholder={content.SelectTankPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {loaderData?.map((tank, index) => {
                  return (
                    <SelectItem key={index} value={tank?.value}>
                      {tank?.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-full flex-row sm:w-auto justify-between sm:max-w-96 md:w-auto">
            <Label className="pr-2">{content.DatetimeStartNote}</Label>
            <DateTimePicker
              granularity="minute"
              className="w-auto text-foreground max-w-96 md:w-auto"
              placeholder=""
              value={startDate}
              onChange={(newValue) => {
                if (newValue) setStartDate(newValue);
              }}
            />
          </div>

          <div className="flex w-full flex-row sm:w-auto justify-between sm:max-w-96 md:w-auto">
            <Label className="pr-2">{content.DatetimeEndNote}</Label>
            <DateTimePicker
              granularity="minute"
              className="w-auto text-foreground max-w-96 md:w-auto"
              placeholder=""
              value={endDate}
              onChange={(newValue) => {
                if (newValue) setEndDate(newValue);
              }}
            />
          </div>
          <Button
            type="button"
            onClick={updateData}
            disabled={
              !filtersRestored ||
              !tank ||
              !validRange ||
              tableLoading ||
              graphLoading
            }
            aria-busy={tableLoading || graphLoading}
          >
            <RefreshCw
              aria-hidden="true"
              className={tableLoading || graphLoading ? "animate-spin" : undefined}
            />
            {tableLoading || graphLoading
              ? content.UpdatingData
              : content.UpdateData}
          </Button>
          {!validRange && (
            <p role="alert" className="w-full text-center text-sm text-destructive">
              {content.InvalidDateRange}
            </p>
          )}
        </div>
      </div>
      <div className="w-full px-2 pt-2">
        <JournalTable
          lang={locale}
          filters={appliedFilters}
          pagination={pagination}
          onPaginationChange={setPagination}
          onLoadingChange={setTableLoading}
        />
      </div>
      <div className="mt-4 mb-18 w-full px-1">
        <Tabs defaultValue="main" className="w-full px-1 md:px-2">
          <TabsList className="grid w-full grid-cols-1 ">
            <TabsTrigger value="main">Графік</TabsTrigger>
          </TabsList>
          <TabsContent value="main">
            <Card className="h-[80vh] p-0">
              <CardHeader />
              <CardContent className="m-0 flex h-full min-h-0 w-full flex-col">
                <div className="grid w-full shrink-0 grid-cols-1 gap-4 px-4 md:grid-cols-2">
                  {(["left", "right"] as const).map((axis) => (
                    <div key={axis} className="min-w-0 space-y-2">
                      <Label htmlFor={`journal-${axis}-parameters`}>
                        {axis === "left" ? content.LeftYAxis : content.RightYAxis}
                      </Label>
                      <MultipleSelector
                        maxSelected={2}
                        onMaxSelected={() => {
                          toast.warning(content.MaxAxisParameters.value);
                        }}
                        value={axisParameters[axis]}
                        onChange={(value) => {
                          setAxisParameters((current) =>
                            setJournalAxisParameters(current, axis, value),
                          );
                        }}
                        options={getJournalAxisOptions(
                          OPTIONS,
                          axisParameters[axis === "left" ? "right" : "left"],
                        )}
                        inputProps={{ id: `journal-${axis}-parameters` }}
                        placeholder={content.SelectGraphParameters.value}
                        emptyIndicator={
                          <p className="py-2 text-center text-sm text-muted-foreground">
                            {content.NoParametersFound}
                          </p>
                        }
                      />
                    </div>
                  ))}
                </div>
                <div ref={boxRef} className="flex min-h-0 w-full flex-1 touch-none">
                  {width > 0 && height > 0 && (
                    <HooksApp
                      width={width}
                      height={height}
                      series={graphSeries}
                      leftAxisLabel={content.LeftYAxis.value}
                      rightAxisLabel={content.RightYAxis.value}
                    />
                  )}
                </div>
              </CardContent>

              <CardFooter />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
