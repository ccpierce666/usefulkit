"use client";

import { useMemo, useState } from "react";

type UnitMode = "metric" | "imperial";

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function WaterIntakeCalculatorTool() {
  const [mode, setMode] = useState<UnitMode>("metric");
  const [weightKg, setWeightKg] = useState("70");
  const [weightLb, setWeightLb] = useState("154");
  const [activityMinutes, setActivityMinutes] = useState("30");
  const [hotWeather, setHotWeather] = useState(false);

  const result = useMemo(() => {
    const weight =
      mode === "metric" ? Math.max(0, parseNum(weightKg)) : Math.max(0, parseNum(weightLb)) * 0.45359237;
    const activity = Math.max(0, parseNum(activityMinutes));

    // Baseline: ~35ml per kg body weight.
    let liters = (weight * 35) / 1000;
    liters += activity / 30 / 4; // +250ml per 30 mins activity
    if (hotWeather) liters += 0.5;

    const cups = liters / 0.236588;
    return { liters, cups };
  }, [activityMinutes, hotWeather, mode, weightKg, weightLb]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Water Intake Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate your recommended daily water intake based on body weight and activity.
        </p>

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
            Metric (kg)
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
            Imperial (lb)
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {mode === "metric" ? (
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-semibold text-foreground">Weight (kg)</span>
              <input
                type="number"
                min={1}
                step="0.1"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          ) : (
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-semibold text-foreground">Weight (lb)</span>
              <input
                type="number"
                min={1}
                step="0.1"
                value={weightLb}
                onChange={(event) => setWeightLb(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          )}

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Daily Activity (minutes)</span>
            <input
              type="number"
              min={0}
              step="5"
              value={activityMinutes}
              onChange={(event) => setActivityMinutes(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={hotWeather}
              onChange={(event) => setHotWeather(event.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            Hot climate / high heat exposure
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Daily Water (Liters)</p>
          <p className="mt-2 text-3xl font-bold text-brand">{result.liters.toFixed(2)} L</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Daily Water (US Cups)</p>
          <p className="mt-2 text-3xl font-bold">{Math.round(result.cups)} cups</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Reminder</p>
          <p className="mt-2 text-sm text-muted">
            This is a general estimate. Individual hydration needs vary by age, health, and medical advice.
          </p>
        </article>
      </div>
    </section>
  );
}

