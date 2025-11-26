"use client";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { DateTimePicker } from "@/components/ui/date-range-picker";

type TankApiRow = { label: string; value: string | number; park: string };

export default function ReportsSelection() {
  const [reportReady, setReportReady] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedTanks, setSelectedTanks] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/tanks");
        if (!res.ok) throw new Error("Failed to fetch tanks");
        const rows: TankApiRow[] = await res.json();
        if (cancelled) return;
        const opts: Option[] = rows.map((r) => ({
          label: r.label,
          value: String(r.value),
          park: r.park,
        }));
        setOptions(opts);
        setSelectedTanks(opts);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="flex h-auto w-full flex-col items-center justify-center  md:flex-row">
      <Tabs
        defaultValue="daily"
        className="h-full min-h-96 w-full max-w-96 p-2"
      >
        <MultipleSelector
          groupBy="park"
          className="mb-2"
          value={selectedTanks}
          defaultOptions={options}
          placeholder="Оберіть резервуари:"
          emptyIndicator={
            <p className="text-center text-gray-600 text-lg leading-10 dark:text-gray-400">
              no results found.
            </p>
          }
          onChange={(opt) => setSelectedTanks(opt)}
        />
        <TabsList className="grid h-auto w-full grid-cols-2">
          <TabsTrigger value="daily">Добовий</TabsTrigger>
          <TabsTrigger value="period">За період</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="h-72">
            <CardHeader>
              <CardTitle>Щоденний звіт</CardTitle>
              <CardDescription>
                Вичерпний щоденний звіт, що документує показники роботи та стан
                термінала резервуарів.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex w-full flex-row">
                <DateTimePicker
                  note="Report date: "
                  granularity="minute"
                  className="w-full text-foreground"
                  placeholder="Select start date"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-4">
              <Button className="bg-red-800">Сформувати PDF</Button>
              <Button className="bg-green-800" hidden={true}>
                Create Excel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="period">
          <Card className="h-72">
            <CardHeader>
              <CardTitle>За період</CardTitle>
              <CardDescription>
                Щоденне операційне зведення для термінала резервуарів, яке
                охоплює різні параметри за вибраний період.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex w-full flex-row">
                <DateTimePicker
                  note="Start date: "
                  granularity="minute"
                  className="w-full text-foreground"
                  placeholder="Select start date"
                />
              </div>
              <div className="flex w-full flex-row">
                <DateTimePicker
                  note="End date: "
                  granularity="minute"
                  className="w-full text-foreground"
                  placeholder="Select end date"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-4">
              <Button className="bg-red-800">Сформувати PDF</Button>
              <Button className="bg-green-800" hidden={true}>
                Create Excel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
