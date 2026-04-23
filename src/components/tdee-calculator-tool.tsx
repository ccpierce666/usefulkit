"use client";

import { useMemo, useState } from "react";

type UnitMode = "metric" | "imperial";
type Sex = "male" | "female";

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary (little/no exercise)", factor: 1.2 },
  { id: "light", label: "Light (1-3 days/week)", factor: 1.375 },
  { id: "moderate", label: "Moderate (3-5 days/week)", factor: 1.55 },
  { id: "active", label: "Active (6-7 days/week)", factor: 1.725 },
  { id: "very-active", label: "Very active (physical job + training)", factor: 1.9 },
] as const;

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function TdeeCalculatorTool() {
  const [mode, setMode] = useState<UnitMode>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("72");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [weightLb, setWeightLb] = useState("165");
  const [activity, setActivity] = useState<(typeof ACTIVITY_LEVELS)[number]["id"]>("moderate");

  const result = useMemo(() => {
    const ageNum = Math.max(0, parseNum(age));

    let weightKgNum = 0;
    let heightCmNum = 0;

    if (mode === "metric") {
      weightKgNum = Math.max(0, parseNum(weightKg));
      heightCmNum = Math.max(0, parseNum(heightCm));
    } else {
      weightKgNum = Math.max(0, parseNum(weightLb)) * 0.45359237;
      const totalInches = Math.max(0, parseNum(heightFt)) * 12 + Math.max(0, parseNum(heightIn));
      heightCmNum = totalInches * 2.54;
    }

    if (ageNum <= 0 || weightKgNum <= 0 || heightCmNum <= 0) {
      return null;
    }

    // Mifflin-St Jeor equation
    const bmr =
      sex === "male"
        ? 10 * weightKgNum + 6.25 * heightCmNum - 5 * ageNum + 5
        : 10 * weightKgNum + 6.25 * heightCmNum - 5 * ageNum - 161;

    const factor = ACTIVITY_LEVELS.find((x) => x.id === activity)?.factor ?? 1.55;
    const tdee = bmr * factor;

    return {
      bmr,
      tdee,
      cut: tdee - 500,
      bulk: tdee + 300,
    };
  }, [activity, age, heightCm, heightFt, heightIn, mode, sex, weightKg, weightLb]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">TDEE Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate daily maintenance calories based on body metrics and activity.
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
            Metric
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
            Imperial
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Sex</span>
            <select
              value={sex}
              onChange={(event) => setSex(event.target.value as Sex)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Age</span>
            <input
              type="number"
              min={1}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          {mode === "metric" ? (
            <>
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
            </>
          ) : (
            <>
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-foreground">Height (ft/in)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    value={heightFt}
                    onChange={(event) => setHeightFt(event.target.value)}
                    className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                  />
                  <input
                    type="number"
                    min={0}
                    value={heightIn}
                    onChange={(event) => setHeightIn(event.target.value)}
                    className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                  />
                </div>
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
            </>
          )}

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Activity Level</span>
            <select
              value={activity}
              onChange={(event) => setActivity(event.target.value as (typeof ACTIVITY_LEVELS)[number]["id"])}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">BMR</p>
          <p className="mt-2 text-3xl font-bold">
            {result ? `${Math.round(result.bmr).toLocaleString()} kcal/day` : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">TDEE</p>
          <p className="mt-2 text-3xl font-bold text-brand">
            {result ? `${Math.round(result.tdee).toLocaleString()} kcal/day` : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cutting Target</p>
          <p className="mt-2 text-2xl font-bold">
            {result ? `${Math.round(result.cut).toLocaleString()} kcal/day` : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lean Bulk Target</p>
          <p className="mt-2 text-2xl font-bold">
            {result ? `${Math.round(result.bulk).toLocaleString()} kcal/day` : "--"}
          </p>
        </article>
      </div>
    </section>
  );
}
