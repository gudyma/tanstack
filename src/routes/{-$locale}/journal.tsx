import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer, useLocale } from "react-intlayer";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import HooksAppRange from "@/components/uplot/uplot-react-2";
import HooksApp from "@/components/uplot/uplot-react-example";
import JournalTable from "@/components/journal-table";
import { Tank, TankParameterData } from "@/components/tank.types";

const OPTIONS: Option[] = [
  { label: "Рівень продукту, мм", value: "product_level" },
  { label: "Рівень осаду, мм", value: "sediment_level" },
  { label: "Температура продукту, С", value: "product_temperature" },
  { label: "Температура ПФ, С", value: "free_temperature" },
  { label: "Тиск, бар", value: "pressure" },
  { label: "Швидкість, мм/хв", value: "product_speed" },
  { label: "Об'єм, м3", value: "total_observed_volume" },
  { label: "Об'єм прродукту, м3", value: "gross_observed_volume" },
  { label: "Об'єм ПФ, м3", value: "vapor_gross_observed_volume" },
  { label: "Об'єм осаду, м3", value: "sediment_volume" },
  { label: "Об'єм 15 С, м3", value: "standard_gross_volume_at15c" },
  { label: "Об'єм 20 С, м3", value: "standard_gross_volume_at20c" },
  { label: "Густина, ", value: "observed_density" },
  { label: "Маса продукту (вак.), т", value: "standard_gross_mass_in_vacuume" },
  { label: "Маса продукту, т", value: "product_mass" },
  { label: "Маса ПФ (вак.), т", value: "vapor_gross_mass_in_vacuum" },
  { label: "Маса ПФ, т", value: "vapor_gross_mass" },
  { label: "Загальна маса", value: "gas_product_mass" },
  { label: "Молярна маса", value: "molar_mass" },
];

export const Route = createFileRoute("/{-$locale}/journal")({
  component: RouteComponent,
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
  const content = useIntlayer("journalContent");
  const { locale } = useLocale();

  const today: Date = new Date();
  const yesterday: Date = ((d) => new Date(d.setHours(d.getHours() - 1)))(
    new Date(),
  );
  const defaultRange: [Date, Date] = [yesterday, today];
  const [dateRange, setDateRange] = useState(defaultRange);
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(today);
  const [tank, setTank] = useState("");
  const [tankList, setTanks] = useState<Tank[]>([]);

  const [parameters, setParameters] = useState<Option[]>([]);
  const [firstParameterName, setFirstParameterName] = useState<string>();
  const [secondParameterName, setSecondParameterName] = useState<string>();
  const [firstParameterData, setFirstParameterData] = useState<
    TankParameterData[]
  >([]);
  const [secondParameterData, setSecondParameterData] = useState<
    TankParameterData[]
  >([]);

  async function loadTanks() {
    try {
      const res = await fetch(`/api/tanks`);
      if (!res.ok) {
        console.warn(`HTTP error! Status: ${res.status}`);
      }
      const rows = await res.json();
      setTanks(rows);
    } catch (error) {
      toast.warning(`Error loading /api/tanks: ${error}`);
    }
  }

  useEffect(() => {
    loadTanks();
  }, []);

  function graphParametersChange() {
    if (tank && parameters) {
      toast.info("Отримую дані");
      try {
        if (parameters[0]?.value) {
          fetch(
            `/api/tankDataByParameter?tank=${tank}&start=${startDate.toISOString()}&end=${endDate.toISOString()}&parameter=${parameters[0]?.value}`,
          )
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((rows) => {
              setFirstParameterData(rows);
            });
          setFirstParameterName(parameters[0]?.label);
        }
        if (parameters[1]?.value) {
          fetch(
            `/api/tankDataByParameter?tank=${tank}&start=${startDate.toISOString()}&end=${endDate.toISOString()}&parameter=${parameters[1]?.value}`,
          )
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((rows: TankParameterData[]) => {
              setSecondParameterData(rows);
            });
          setSecondParameterName(parameters[1]?.label);
        }
        toast.info("Дані отримано");
      } catch (error) {
        toast.warning(`Error loading parameter data :`, error);
      }
    } else {
      toast.warning("Не обрано резервуар");
    }
  }

  useEffect(() => {
    graphParametersChange();
  }, [tank, startDate, endDate, parameters]);

  const boxRef = useRef<any>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // on initial render
    setTimeout(() => {
      updateSize();
    }, 0);
    // gets the size and updates state
    function updateSize() {
      const { width, height } = boxRef.current.getBoundingClientRect();
      setWidth(width);
      setHeight(height - 50);
    }
    // event listener
    window.addEventListener("resize", updateSize);
    // remove the event listener before the component gets unmounted
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative my-1 h-full w-full overflow-auto md:mb-0">
      <div className="fixed top-0 z-50 w-full items-center justify-center border-x border-b bg-muted/60 backdrop-blur-sm">
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 px-2 py-2 md:px-4">
          <div className="flex w-full flex-row sm:w-auto">
            <Label className="mr-2" htmlFor="tankSelect">
              {content.TankSelectHeader}
            </Label>
            <Select name="Tank name" onValueChange={(value) => setTank(value)}>
              <SelectTrigger className="w-full" id="tankSelect">
                <SelectValue placeholder={content.SelectTankPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {tankList?.map((tank, index) => {
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
              onChange={(newValue: Date) => setStartDate(newValue)}
            />
          </div>

          <div className="flex w-full flex-row sm:w-auto justify-between sm:max-w-96 md:w-auto">
            <Label className="pr-2">{content.DatetimeEndNote}</Label>
            <DateTimePicker
              granularity="minute"
              className="w-auto text-foreground max-w-96 md:w-auto"
              placeholder=""
              value={endDate}
              onChange={(newValue: Date) => setEndDate(newValue)}
            />
          </div>
        </div>
      </div>
      <div className="w-full px-2 pt-36 sm:pt-14">
        <JournalTable
          lang={locale}
          tank={tank}
          startDate={startDate.toISOString()}
          endDate={endDate.toISOString()}
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
              <CardContent className="m-0 flex h-full w-full touch-none flex-col">
                <div className="flex h-auto w-full flex-col justify-between gap-2  md:flex-row md:gap-0">
                  <div className="w-full flex-col items-center px-4">
                    <MultipleSelector
                      maxSelected={2}
                      onMaxSelected={(maxLimit) => {
                        toast.warning("Parameters select", {
                          description: `Ви обрали максимальну кількість: ${maxLimit}`,
                        });
                      }}
                      value={parameters}
                      onChange={(value) => {
                        setParameters(value);
                      }}
                      defaultOptions={OPTIONS}
                      placeholder="Оберіть два параметри"
                      emptyIndicator={
                        <p className="text-center text-gray-600 text-lg leading-10 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                    />
                  </div>
                </div>
                <div ref={boxRef} className="flex h-full w-full ">
                  <HooksApp
                    width={width}
                    height={height}
                    x={firstParameterData?.map((item) =>
                      Math.floor(new Date(item.timestamp).getTime() / 1000),
                    )}
                    labely1={firstParameterName ?? ""}
                    y1={firstParameterData?.map((item) =>
                      Number(item.parameter),
                    )}
                    labely2={secondParameterName ?? ""}
                    y2={secondParameterData?.map((item) =>
                      Number(item.parameter),
                    )}
                  />
                </div>
              </CardContent>

              <CardFooter />
            </Card>
          </TabsContent>
          <TabsContent value="full">
            <Card className="h-[80vh] p-0">
              <CardHeader />
              <CardContent
                className="m-0 w-full p-0"
                style={{ pointerEvents: "all" }}
              >
                <HooksAppRange
                  x={firstParameterData?.map((item) => item.timestamp)}
                  y1={firstParameterData?.map((item) => item.parameter)}
                  y2={secondParameterData?.map((item) => item.parameter)}
                />
              </CardContent>

              <CardFooter />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
