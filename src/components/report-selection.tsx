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
import { TankDiffReport } from "@/lib/diffReport";
import { createDiffReportPdf } from "@/lib/buildReportContent";
import {
  createSnapshotReportPdf,
  TankSnapshot,
} from "@/lib/createSnapshotReportPdf";

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
              <Button
                className="bg-red-800"
                onClick={() => {
                  const mockData: TankSnapshot[] = [
                    {
                      tank_id: "550e8400-e29b-41d4-a716-446655440000",
                      timestamp: "2025-11-30T14:30:00Z",
                      product_level: 8540.5, // Високий рівень
                      product_temperature: 22.4, // Нормальна температура
                      observed_density: 745.2, // Бензин/дизель
                      gross_observed_volume: 54000, // Великий об'єм
                      pressure: 0.105, // Невеликий надлишковий тиск
                      product_mass: 40250, // Маса
                    },
                    {
                      tank_id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
                      timestamp: "2025-11-30T14:35:00Z",
                      product_level: 1200.0, // Низький рівень
                      product_temperature: 18.5,
                      observed_density: 820.5,
                      gross_observed_volume: 8500,
                      pressure: 0.0,
                      product_mass: 6970,
                    },
                    {
                      // Сценарій: Датчики відключені або помилка зв'язку (NULL)
                      tank_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                      timestamp: "2025-11-30T10:00:00Z", // Старі дані
                      product_level: null,
                      product_temperature: null,
                      observed_density: null,
                      gross_observed_volume: null,
                      pressure: null,
                      product_mass: null,
                    },
                    {
                      // Сценарій: Майже порожній резервуар
                      tank_id: "98765432-1234-5678-90ab-cdef12345678",
                      timestamp: "2025-11-30T14:28:00Z",
                      product_level: 5.0,
                      product_temperature: 15.0,
                      observed_density: 0.0,
                      gross_observed_volume: 10,
                      pressure: 0.0,
                      product_mass: 0,
                    },
                  ];

                  // 2. Виклик функції генерації PDF
                  const targetDate = new Date().toLocaleString("uk-UA"); // Поточна дата для заголовка
                  createSnapshotReportPdf(mockData, targetDate);
                }}
              >
                Сформувати PDF
              </Button>
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
              <Button
                className="bg-red-800"
                onClick={() => {
                  // ==========================================
                  // Usage Example
                  // ==========================================

                  // Mock Data (matches output from previous step)
                  const mockReports: TankDiffReport[] = [
                    {
                      tank_id: "a1b2-c3d4-e5f6",
                      timestampFrom: "2024-01-01T10:00:00Z",
                      timestampTo: "2024-01-02T10:00:00Z",
                      changes: {
                        product_level: {
                          oldValue: 5000.5,
                          newValue: 5200,
                          delta: 199.5,
                          percentChange: 3.99,
                        },
                        pressure: {
                          oldValue: 1.2,
                          newValue: 1.1,
                          delta: -0.1,
                          percentChange: -8.33,
                        },
                        product_temperature: {
                          oldValue: 22.5,
                          newValue: 22.5,
                          delta: 0,
                          percentChange: 0,
                        },
                        gross_observed_volume: {
                          oldValue: null,
                          newValue: 15000,
                          delta: null,
                          percentChange: null,
                        }, // New data case
                      },
                    },
                  ];

                  // Run generator
                  createDiffReportPdf(mockReports, "weekly_diff_report.pdf");
                }}
              >
                Сформувати PDF
              </Button>
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
