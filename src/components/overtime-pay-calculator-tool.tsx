"use client";

import { useMemo, useState } from "react";

type RuleMode = "weekly" | "california-daily";

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function hours(value: number): string {
  return `${value.toFixed(2)}h`;
}

export function OvertimePayCalculatorTool() {
  const [ruleMode, setRuleMode] = useState<RuleMode>("weekly");
  const [hourlyRate, setHourlyRate] = useState(30);
  const [workedHours, setWorkedHours] = useState(48);
  const [dailyHours, setDailyHours] = useState<number[]>([8, 8, 8, 8, 8, 4, 0]);
  const [regularThreshold, setRegularThreshold] = useState(40);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);
  const [doubletimeHours, setDoubletimeHours] = useState(0);
  const [doubletimeMultiplier, setDoubletimeMultiplier] = useState(2);

  const calc = useMemo(() => {
    const rate = Math.max(0, hourlyRate);
    let totalHours = Math.max(0, workedHours);
    let regularHours = 0;
    let otHours = 0;
    let dtHours = 0;

    if (ruleMode === "california-daily") {
      totalHours = dailyHours.reduce((sum, day) => sum + Math.max(0, day), 0);
      let dailyRegular = 0;
      let dailyOt = 0;
      let dailyDt = 0;

      dailyHours.forEach((day) => {
        const h = Math.max(0, day);
        dailyRegular += Math.min(h, 8);
        dailyOt += Math.min(Math.max(h - 8, 0), 4);
        dailyDt += Math.max(h - 12, 0);
      });

      // Simplified weekly adjustment: regular hours over 40 are overtime.
      const weeklyOtAdjustment = Math.max(0, dailyRegular - 40);
      regularHours = Math.max(0, dailyRegular - weeklyOtAdjustment);
      otHours = dailyOt + weeklyOtAdjustment;
      dtHours = dailyDt;
    } else {
      const regularCap = Math.max(0, regularThreshold);
      dtHours = Math.max(0, Math.min(totalHours, doubletimeHours));
      otHours = Math.max(0, totalHours - regularCap - dtHours);
      regularHours = Math.max(0, totalHours - otHours - dtHours);
    }

    const regularPay = regularHours * rate;
    const overtimePay = otHours * rate * Math.max(1, overtimeMultiplier);
    const doubletimePay = dtHours * rate * Math.max(1, doubletimeMultiplier);
    const grossPay = regularPay + overtimePay + doubletimePay;

    return {
      regularHours,
      otHours,
      dtHours,
      regularPay,
      overtimePay,
      doubletimePay,
      grossPay,
      blendedRate: totalHours > 0 ? grossPay / totalHours : 0,
    };
  }, [
    dailyHours,
    doubletimeHours,
    doubletimeMultiplier,
    hourlyRate,
    overtimeMultiplier,
    regularThreshold,
    ruleMode,
    workedHours,
  ]);

  function updateDailyHours(index: number, value: number) {
    setDailyHours((prev) => prev.map((item, i) => (i === index ? Math.max(0, value) : item)));
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Overtime Pay Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate weekly pay by splitting hours into regular, overtime, and optional double-time
          buckets.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Rule Mode</span>
            <select
              value={ruleMode}
              onChange={(event) => setRuleMode(event.target.value as RuleMode)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="weekly">Federal-Style Weekly Rule (40h+ OT)</option>
              <option value="california-daily">California-Style Daily Rule (8h+/12h+)</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Hourly Rate (USD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          {ruleMode === "weekly" ? (
            <>
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-foreground">Total Worked Hours</span>
                <input
                  type="number"
                  min={0}
                  step="0.25"
                  value={workedHours}
                  onChange={(event) => setWorkedHours(Number(event.target.value) || 0)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-foreground">Regular Hours Threshold</span>
                <input
                  type="number"
                  min={0}
                  step="0.25"
                  value={regularThreshold}
                  onChange={(event) => setRegularThreshold(Number(event.target.value) || 0)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
            </>
          ) : (
            <div className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold text-foreground">Daily Worked Hours (Mon-Sun)</span>
              <div className="grid grid-cols-7 gap-2">
                {dailyHours.map((day, index) => (
                  <input
                    key={index}
                    type="number"
                    min={0}
                    step="0.25"
                    value={day}
                    onChange={(event) => updateDailyHours(index, Number(event.target.value) || 0)}
                    className="h-10 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
                    aria-label={`Day ${index + 1} hours`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted">
                Simplified CA mode: first 8h regular, 8-12h overtime, 12h+ double-time.
              </p>
            </div>
          )}
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Overtime Multiplier</span>
            <input
              type="number"
              min={1}
              step="0.1"
              value={overtimeMultiplier}
              onChange={(event) => setOvertimeMultiplier(Number(event.target.value) || 1)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          {ruleMode === "weekly" ? (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Double-time Hours (Optional)</span>
              <input
                type="number"
                min={0}
                step="0.25"
                value={doubletimeHours}
                onChange={(event) => setDoubletimeHours(Number(event.target.value) || 0)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          ) : null}
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Double-time Multiplier</span>
            <input
              type="number"
              min={1}
              step="0.1"
              value={doubletimeMultiplier}
              onChange={(event) => setDoubletimeMultiplier(Number(event.target.value) || 1)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Gross Pay</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.grossPay)}</p>
          <p className="mt-1 text-sm text-muted">Blended hourly: {money(calc.blendedRate)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Hour Split</p>
          <p className="mt-2 text-sm text-foreground">Regular: {hours(calc.regularHours)}</p>
          <p className="mt-1 text-sm text-foreground">Overtime: {hours(calc.otHours)}</p>
          <p className="mt-1 text-sm text-foreground">Double-time: {hours(calc.dtHours)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pay Breakdown</p>
          <p className="mt-2 text-sm text-foreground">Regular pay: {money(calc.regularPay)}</p>
          <p className="mt-1 text-sm text-foreground">Overtime pay: {money(calc.overtimePay)}</p>
          <p className="mt-1 text-sm text-foreground">Double-time pay: {money(calc.doubletimePay)}</p>
        </article>
      </div>
    </section>
  );
}
