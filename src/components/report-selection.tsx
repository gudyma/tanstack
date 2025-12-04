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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { DateTimePicker } from "@/components/ui/date-range-picker";
import { TankDiffReport } from "@/lib/diffReport";
import { createDiffReportPdf } from "@/lib/buildReportContent";
import { createSnapshotReportPdf } from "@/lib/createSnapshotReportPdf";
import { Label } from "@/components/ui/label";
import { TankMeasurement } from "./tank.types";

type TankApiRow = { label: string; value: string | number; park: string };

export default function ReportsSelection() {
  const [reportReady, setReportReady] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedTanks, setSelectedTanks] = useState<Option[]>([]);

  return (
    <div className="flex h-auto w-full flex-col items-center justify-center  md:flex-row">
      <Tabs defaultValue="daily" className="h-74 w-full">
        <TabsList className="grid h-auto w-full grid-cols-2">
          <TabsTrigger value="daily">На дату</TabsTrigger>
          <TabsTrigger value="period">За період</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="h-68">
            <CardHeader>
              <CardTitle>Звіт на обрану дату та час</CardTitle>
              <CardDescription>
                Вичерпний звіт, що документує показники резервуарів на обрану
                користувачем дату.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex w-full flex-row justify-between gap-2">
                <Label className="flex-none">Обрана дата</Label>
                <DateTimePicker
                  granularity="minute"
                  className="w-auto flex-1 text-foreground max-w-96"
                  placeholder="Оберіть дату"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-4">
              <Button
                className="bg-red-800"
                onClick={() => {
                  const mockData: TankMeasurement[] = [
                    {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      timestamp: "2025-11-30T14:30:00Z",
                      product_level: 8540.5, // Високий рівень
                      product_temperature: 22.4, // Нормальна температура
                      observed_density: 745.2, // Бензин/дизель
                      gross_observed_volume: 54000, // Великий об'єм
                      pressure: 0.105, // Невеликий надлишковий тиск
                      product_mass: 40250, // Маса
                    },
                    {
                      id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
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
                      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
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
                      id: "98765432-1234-5678-90ab-cdef12345678",
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
          <Card>
            <CardHeader>
              <CardTitle>Звіт за період</CardTitle>
              <CardDescription>
                Звіт порівнює значення параметрів резервуарів між двома обраними
                датами.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex w-full flex-row justify-between gap-2">
                <Label>Початкова дата</Label>
                <DateTimePicker
                  granularity="minute"
                  className="w-auto flex-1 text-foreground max-w-96"
                  placeholder="Оберіть початкову дату"
                />
              </div>
              <div className="flex w-full flex-row justify-between gap-2">
                <Label>Кінцева дата</Label>
                <DateTimePicker
                  granularity="minute"
                  className="w-auto flex-1 text-foreground max-w-96"
                  placeholder="Оберіть кінцеву дату"
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
