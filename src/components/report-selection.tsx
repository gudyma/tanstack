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
import { useState } from "react";
import { DateTimePicker } from "@/components/ui/date-range-picker";
import { createDiffReportPdf } from "@/lib/createDiffReportPdf";
import { createSnapshotReportPdf } from "@/lib/createSnapshotReportPdf";
import { Label } from "@/components/ui/label";
import { TankMeasurement } from "./tank.types";

export default function ReportsSelection() {
  const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const today: Date = new Date();
  const yesterday: Date = ((d) => new Date(d.setDate(d.getDate() - 1)))(
    new Date(),
  );
  const [baseDate, setBaseDate] = useState(today);
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(today);
  return (
    <div className="flex h-auto w-full flex-col items-center justify-center  md:flex-row">
      <Tabs defaultValue="daily" className="h-62 w-full">
        <TabsList className="grid h-auto w-full grid-cols-2">
          <TabsTrigger value="daily">На дату</TabsTrigger>
          <TabsTrigger value="period">За період</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="h-52 py-4 gap-2 justify-between">
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
                  value={baseDate}
                  onChange={(value) => value && setBaseDate(value)}
                  granularity="minute"
                  className="w-auto flex-1 text-foreground max-w-96"
                  placeholder="Оберіть дату"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-4">
              <Button
                className="bg-red-800"
                onClick={async () => {
                  try {
                    await fetch(
                      baseUrl +
                        `/api/report/nearestTankData?date=${baseDate.toISOString()}`,
                    )
                      .then((res) => (res.ok ? res.json() : Promise.reject()))
                      .then((rows: TankMeasurement[]) => {
                        return createSnapshotReportPdf(rows, baseDate);
                      });
                  } catch (error) {
                    console.error(
                      `Error loading /api/report/nearestTankData: ${error}`,
                    );
                  }
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
          <Card className="h-52 py-4 gap-2 justify-between">
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
                  value={startDate}
                  onChange={(value) => value && setStartDate(value)}
                  className="w-auto flex-1 text-foreground max-w-96"
                  placeholder="Оберіть початкову дату"
                />
              </div>
              <div className="flex w-full flex-row justify-between gap-2">
                <Label>Кінцева дата</Label>
                <DateTimePicker
                  granularity="minute"
                  value={endDate}
                  onChange={(value) => value && setEndDate(value)}
                  className="w-auto flex-1 text-foreground max-w-96"
                  placeholder="Оберіть кінцеву дату"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-4">
              <Button
                className="bg-red-800"
                disabled={startDate > endDate}
                onClick={async () => {
                  try {
                    const [startData, endData] = await Promise.all(
                      [startDate, endDate].map(async (date): Promise<TankMeasurement[]> => {
                        const response = await fetch(
                          baseUrl + `/api/report/nearestTankData?date=${date.toISOString()}`,
                        );
                        if (!response.ok) {
                          throw new Error(`Cannot load report data: ${response.status}`);
                        }
                        return response.json();
                      }),
                    );
                    await createDiffReportPdf(startData, endData, startDate, endDate);
                  } catch (error) {
                    console.error(`Error creating period report: ${error}`);
                  }
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
