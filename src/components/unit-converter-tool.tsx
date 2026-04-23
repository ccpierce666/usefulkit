"use client";

import { useMemo, useState } from "react";

type Category = "length" | "weight" | "temperature" | "area";

type UnitDef = {
  id: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
};

const UNIT_MAP: Record<Category, UnitDef[]> = {
  length: [
    { id: "m", label: "Meter (m)", toBase: (v) => v, fromBase: (v) => v },
    { id: "km", label: "Kilometer (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: "ft", label: "Foot (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: "in", label: "Inch (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { id: "mi", label: "Mile (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  ],
  weight: [
    { id: "kg", label: "Kilogram (kg)", toBase: (v) => v, fromBase: (v) => v },
    { id: "g", label: "Gram (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: "lb", label: "Pound (lb)", toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
    { id: "oz", label: "Ounce (oz)", toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
  ],
  temperature: [
    { id: "c", label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
    { id: "f", label: "Fahrenheit (°F)", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
    { id: "k", label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  area: [
    { id: "sqm", label: "Square Meter (m²)", toBase: (v) => v, fromBase: (v) => v },
    { id: "sqft", label: "Square Foot (ft²)", toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
    { id: "acre", label: "Acre", toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
    { id: "hectare", label: "Hectare (ha)", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  ],
};

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function format(v: number): string {
  return v.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

export function UnitConverterTool() {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [inputValue, setInputValue] = useState("1");

  const units = UNIT_MAP[category];

  const result = useMemo(() => {
    const from = units.find((u) => u.id === fromUnit) ?? units[0];
    const to = units.find((u) => u.id === toUnit) ?? units[1] ?? units[0];
    const input = parseNum(inputValue);
    const base = from.toBase(input);
    const converted = to.fromBase(base);
    return {
      from,
      to,
      input,
      converted,
    };
  }, [fromUnit, inputValue, toUnit, units]);

  const onChangeCategory = (next: Category) => {
    setCategory(next);
    const nextUnits = UNIT_MAP[next];
    setFromUnit(nextUnits[0]?.id ?? "");
    setToUnit(nextUnits[1]?.id ?? nextUnits[0]?.id ?? "");
    setInputValue("1");
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Unit Converter</h2>
        <p className="mt-2 text-sm text-muted">
          Convert units instantly for everyday calculations.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { id: "length", label: "Length" },
              { id: "weight", label: "Weight" },
              { id: "temperature", label: "Temperature" },
              { id: "area", label: "Area" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeCategory(item.id)}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                category === item.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 sm:col-span-1">
            <span className="text-sm font-semibold text-foreground">Value</span>
            <input
              type="number"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1 sm:col-span-1">
            <span className="text-sm font-semibold text-foreground">From</span>
            <select
              value={fromUnit}
              onChange={(event) => setFromUnit(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 sm:col-span-1">
            <span className="text-sm font-semibold text-foreground">To</span>
            <select
              value={toUnit}
              onChange={(event) => setToUnit(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Converted Value</p>
          <p className="mt-2 text-3xl font-bold">{format(result.converted)}</p>
          <p className="mt-1 text-sm text-muted">{result.to.label}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Equation</p>
          <p className="mt-2 text-sm text-foreground">
            {format(result.input)} {result.from.id} = {format(result.converted)} {result.to.id}
          </p>
        </article>
      </div>
    </section>
  );
}
