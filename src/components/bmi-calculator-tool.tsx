"use client";

import { useMemo, useState } from "react";

type UnitMode = "metric" | "imperial";

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function BmiCalculatorTool() {
  const [mode, setMode] = useState<UnitMode>("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("65");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weightLb, setWeightLb] = useState("150");

  const result = useMemo(() => {
    let heightM = 0;
    let weight = 0;

    if (mode === "metric") {
      heightM = parseNum(heightCm) / 100;
      weight = parseNum(weightKg);
    } else {
      const inches = parseNum(heightFt) * 12 + parseNum(heightIn);
      heightM = inches * 0.0254;
      weight = parseNum(weightLb) * 0.45359237;
    }

    if (heightM <= 0 || weight <= 0) {
      return null;
    }

    const bmi = weight / (heightM * heightM);
    return {
      bmi,
      label: bmiLabel(bmi),
    };
  }, [heightCm, heightFt, heightIn, mode, weightKg, weightLb]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">BMI Calculator</h2>
        <p className="mt-2 text-sm text-muted">Estimate body mass index from height and weight.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("metric")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "metric"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Metric (cm/kg)
          </button>
          <button
            type="button"
            onClick={() => setMode("imperial")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "imperial"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Imperial (ft/in/lb)
          </button>
        </div>

        {mode === "metric" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Height (cm)</span>
              <input
                type="number"
                min={1}
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Weight (kg)</span>
              <input
                type="number"
                min={1}
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Height (ft)</span>
              <input
                type="number"
                min={0}
                value={heightFt}
                onChange={(event) => setHeightFt(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Height (in)</span>
              <input
                type="number"
                min={0}
                value={heightIn}
                onChange={(event) => setHeightIn(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Weight (lb)</span>
              <input
                type="number"
                min={1}
                value={weightLb}
                onChange={(event) => setWeightLb(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">BMI</p>
          <p className="mt-2 text-3xl font-bold">
            {result ? result.bmi.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Category</p>
          <p className="mt-2 text-2xl font-bold">{result ? result.label : "--"}</p>
        </article>
      </div>
    </section>
  );
}
