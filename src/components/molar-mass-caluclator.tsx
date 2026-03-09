import React, { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Copy, Plus, Trash2 } from "lucide-react";

type GasOption = {
  key: string;
  name: string;
  formula: string;
  molarMass: number;
};

type MixtureRow = {
  id: string;
  gasKey: string;
  percent: number;
};

const GAS_OPTIONS: GasOption[] = [
  { key: "hydrogen", name: "Hydrogen", formula: "H2", molarMass: 2.0159 },
  { key: "helium", name: "Helium", formula: "He", molarMass: 4.0026 },
  { key: "water", name: "Water", formula: "H2O", molarMass: 18.0153 },
  {
    key: "carbon_monoxide",
    name: "Carbon monoxide",
    formula: "CO",
    molarMass: 28.01,
  },
  { key: "nitrogen", name: "Nitrogen", formula: "N2", molarMass: 28.0134 },
  { key: "oxygen", name: "Oxygen", formula: "O2", molarMass: 31.9988 },
  {
    key: "hydrogen_sulfide",
    name: "Hydrogen sulfide",
    formula: "H2S",
    molarMass: 34.08,
  },
  { key: "argon", name: "Argon", formula: "Ar", molarMass: 39.948 },
  {
    key: "carbon_dioxide",
    name: "Carbon dioxide",
    formula: "CO2",
    molarMass: 44.01,
  },
  { key: "air", name: "Air", formula: "E", molarMass: 28.9625 },
  { key: "methane", name: "Methane", formula: "CH4", molarMass: 16.043 },
  { key: "ethane", name: "Ethane", formula: "C2H6", molarMass: 30.07 },
  { key: "propane", name: "Propane", formula: "C3H8", molarMass: 44.097 },
  { key: "i_butane", name: "i-Butane", formula: "C4H10", molarMass: 58.123 },
  { key: "n_butane", name: "n-Butane", formula: "C4H10", molarMass: 58.123 },
  { key: "i_pentane", name: "i-Pentane", formula: "C5H12", molarMass: 72.15 },
  { key: "n_pentane", name: "n-Pentane", formula: "C5H12", molarMass: 72.15 },
  { key: "n_hexane", name: "n-Hexane", formula: "C6H14", molarMass: 86.177 },
  { key: "n_heptane", name: "n-Heptane", formula: "C7H16", molarMass: 100.204 },
  { key: "n_octane", name: "n-Octane", formula: "C8H18", molarMass: 114.231 },
  { key: "n_nonane", name: "n-Nonane", formula: "C9H20", molarMass: 128.258 },
  { key: "n_decane", name: "n-Decane", formula: "C10H22", molarMass: 142.285 },
  {
    key: "neopentane",
    name: "Neopentane",
    formula: "C5H12",
    molarMass: 72.015,
  },
  {
    key: "2_methylpentane",
    name: "2-Methylpentane",
    formula: "C6H14",
    molarMass: 86.177,
  },
  {
    key: "3_methylpentane",
    name: "3-Methylpentane",
    formula: "C6H14",
    molarMass: 86.177,
  },
  {
    key: "2_2_dimethylbutane",
    name: "2,2-Dimethylbutane",
    formula: "C6H14",
    molarMass: 86.177,
  },
  {
    key: "2_3_dimethylbutane",
    name: "2,3-Dimethylbutane",
    formula: "C6H14",
    molarMass: 86.177,
  },
  {
    key: "cyclopropane",
    name: "Cyclopropane",
    formula: "C3H6",
    molarMass: 42.081,
  },
  {
    key: "cyclobutane",
    name: "Cyclobutane",
    formula: "C4H8",
    molarMass: 56.108,
  },
  {
    key: "cyclopentane",
    name: "Cyclopentane",
    formula: "C5H10",
    molarMass: 70.134,
  },
  {
    key: "cyclohexane",
    name: "Cyclohexane",
    formula: "C6H12",
    molarMass: 84.161,
  },
  {
    key: "ethyne",
    name: "Ethyne (acetylene)",
    formula: "C2H2",
    molarMass: 26.038,
  },
  {
    key: "ethene",
    name: "Ethene (ethylene)",
    formula: "C2H4",
    molarMass: 28.054,
  },
  {
    key: "propene",
    name: "Propene (propylene)",
    formula: "C3H6",
    molarMass: 42.081,
  },
  { key: "benzene", name: "Benzene", formula: "C6H6", molarMass: 78.114 },
  {
    key: "butanes_average",
    name: "Butanes (ave)",
    formula: "C4H10",
    molarMass: 58.123,
  },
  {
    key: "pentanes_average",
    name: "Pentanes (ave)",
    formula: "C5H12",
    molarMass: 72.15,
  },
  {
    key: "hexanes_average",
    name: "Hexanes (ave)",
    formula: "C6H14",
    molarMass: 86.177,
  },
  {
    key: "butenes_average",
    name: "Butenes (ave)",
    formula: "C4H8",
    molarMass: 56.108,
  },
  {
    key: "pentenes_average",
    name: "Pentenes (ave)",
    formula: "C5H10",
    molarMass: 70.134,
  },
];

const rowSchema = z.object({
  id: z.string(),
  gasKey: z.string().min(1, "Выберите компонент."),
  percent: z
    .number({ invalid_type_error: "Процент должен быть числом." })
    .min(0, "Процент не может быть меньше 0.")
    .max(100, "Процент не может быть больше 100."),
});

const mixtureSchema = z
  .array(rowSchema)
  .min(1, "Добавьте хотя бы один компонент.")
  .superRefine((rows, ctx) => {
    const total = rows.reduce((sum, row) => sum + row.percent, 0);

    if (Math.abs(total - 100) > 0.0001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Сумма компонентов должна быть равна 100%. Сейчас: ${total.toFixed(4)}%.`,
      });
    }

    const seen = new Set<string>();
    rows.forEach((row, index) => {
      if (seen.has(row.gasKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "gasKey"],
          message: "Один и тот же газ нельзя выбирать дважды.",
        });
      }
      seen.add(row.gasKey);
    });
  });

const roundPercent = (value: number) => Math.round(value * 10000) / 10000;

const createRow = (gasKey = "nitrogen", percent = 100): MixtureRow => ({
  id: Math.random().toString(36).slice(2, 11),
  gasKey,
  percent,
});

const getGas = (gasKey: string) =>
  GAS_OPTIONS.find((item) => item.key === gasKey);

const rebalanceRows = (
  rows: MixtureRow[],
  changedId: string,
  nextRawValue: number,
): MixtureRow[] => {
  if (rows.length === 1) {
    return [{ ...rows[0], percent: 100 }];
  }

  const nextValue = Number.isFinite(nextRawValue)
    ? Math.min(100, Math.max(0, nextRawValue))
    : 0;
  const nextRows = rows.map((row) => ({ ...row }));
  const changedIndex = nextRows.findIndex((row) => row.id === changedId);

  if (changedIndex === -1) return rows;

  const currentValue = nextRows[changedIndex].percent;
  let delta = roundPercent(nextValue - currentValue);

  if (delta === 0) return nextRows;

  const otherIndexes = nextRows
    .map((_, index) => index)
    .filter((index) => index !== changedIndex);

  if (delta > 0) {
    let remainingDelta = delta;

    for (const index of otherIndexes) {
      if (remainingDelta <= 0) break;
      const available = nextRows[index].percent;
      const deduction = Math.min(available, remainingDelta);
      nextRows[index].percent = roundPercent(
        nextRows[index].percent - deduction,
      );
      remainingDelta = roundPercent(remainingDelta - deduction);
    }

    const appliedDelta = roundPercent(delta - remainingDelta);
    nextRows[changedIndex].percent = roundPercent(currentValue + appliedDelta);
  } else {
    const freed = Math.abs(delta);
    nextRows[changedIndex].percent = roundPercent(nextValue);
    nextRows[otherIndexes[0]].percent = roundPercent(
      nextRows[otherIndexes[0]].percent + freed,
    );
  }

  const total = nextRows.reduce((sum, row) => sum + row.percent, 0);
  const correction = roundPercent(100 - total);
  if (Math.abs(correction) > 0 && otherIndexes.length > 0) {
    nextRows[otherIndexes[0]].percent = roundPercent(
      nextRows[otherIndexes[0]].percent + correction,
    );
  }

  return nextRows;
};

export default function GasMixtureMolarMassCalculator() {
  const [rows, setRows] = useState<MixtureRow[]>([createRow("nitrogen", 100)]);
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => mixtureSchema.safeParse(rows), [rows]);

  const errors = useMemo(() => {
    if (validation.success) return [] as string[];
    return validation.error.issues.map((issue) => issue.message);
  }, [validation]);

  const totalPercent = useMemo(
    () => roundPercent(rows.reduce((sum, row) => sum + row.percent, 0)),
    [rows],
  );

  const molarMass = useMemo(() => {
    return rows.reduce((sum, row) => {
      const gas = getGas(row.gasKey);
      if (!gas) return sum;
      return sum + gas.molarMass * (row.percent / 100);
    }, 0);
  }, [rows]);

  const addRow = () => {
    const firstUnusedGas = GAS_OPTIONS.find(
      (option) => !rows.some((row) => row.gasKey === option.key),
    );
    if (!firstUnusedGas) return;
    setRows((current) => [...current, createRow(firstUnusedGas.key, 0)]);
  };

  const removeRow = (id: string) => {
    setRows((current) => {
      if (current.length === 1) return current;

      const rowToRemove = current.find((row) => row.id === id);
      const remaining = current
        .filter((row) => row.id !== id)
        .map((row) => ({ ...row }));

      if (!rowToRemove || remaining.length === 0) return current;

      remaining[0].percent = roundPercent(
        remaining[0].percent + rowToRemove.percent,
      );
      return remaining;
    });
  };

  const updateGas = (id: string, gasKey: string) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, gasKey } : row)),
    );
  };

  const updatePercent = (id: string, rawValue: string) => {
    const normalized = rawValue.replace(",", ".");
    const parsed = normalized === "" ? 0 : Number(normalized);
    if (Number.isNaN(parsed)) return;

    setRows((current) => rebalanceRows(current, id, parsed));
  };

  const handleCopy = async () => {
    if (!validation.success) return;

    await navigator.clipboard.writeText(molarMass.toFixed(6));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col mx-auto max-w-5xl p-2 ">
      <div className="space-y-3 pb-4">
        <div className="flex flex-col gap-3  md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl text-sm leading-6 ">
            Оберіть компоненти суміші та вкажіть їх частки у відсотках.
            Компонент не може бути більше 100%, а сума всіх часток автоматично
            підтримується на рівні 100% за рахунок перерозподілу залишку між
            іншими рядками.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              Сума: {totalPercent.toFixed(2)}%
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              Компонентів: {rows.length}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4">
          {rows.map((row, index) => {
            const gas = getGas(row.gasKey);
            const selectedKeys = new Set(
              rows
                .filter((item) => item.id !== row.id)
                .map((item) => item.gasKey),
            );

            return (
              <div
                key={row.id}
                className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[1.5fr_180px_160px_auto] items-start"
              >
                <div className="space-y-2">
                  <Label>Компонент #{index + 1}</Label>
                  <Select
                    value={row.gasKey}
                    onValueChange={(value) => updateGas(row.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть газ" />
                    </SelectTrigger>
                    <SelectContent>
                      {GAS_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.key}
                          value={option.key}
                          disabled={selectedKeys.has(option.key)}
                        >
                          {option.name} ({option.formula}) — {option.molarMass}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Частка, %</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step="0.0001"
                    value={row.percent}
                    onChange={(event) =>
                      updatePercent(row.id, event.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Молярна маса</Label>
                  <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm">
                    {gas ? `${gas.molarMass.toFixed(4)}` : "—"}
                  </div>
                </div>

                <div className="">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    title="Удалить компонент"
                    className="w-6 h-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            disabled={rows.length >= GAS_OPTIONS.length}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Додати компонент
          </Button>

          <div className="text-sm text-muted-foreground">
            При зменшенні частки поточний залишок автоматично передається до
            першого іншого рядка, а при збільшенні — знімається з інших рядків.
          </div>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-5">
                {errors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 rounded-2xl border bg-muted/20 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Молярна маса суміші</Label>
            <div className="flex flex-row justify-between rounded-xl border bg-background px-4 py-3 text-2xl font-semibold tracking-tight">
              <div className="flex justify-center items-center">
                {molarMass.toFixed(6)}
              </div>
              <Button
                type="button"
                onClick={handleCopy}
                disabled={!validation.success}
                className="h-11 min-w-52"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Скопійовано" : "Копіювати результат"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
