"use client";

import { useMemo, useState } from "react";

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
  const [hourlyRate, setHourlyRate] = useState(30);
  const [workedHours, setWorkedHours] = useState(48);
  const [regularThreshold, setRegularThreshold] = useState(40);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);
  const [doubletimeHours, setDoubletimeHours] = useState(0);
  const [doubletimeMultiplier, setDoubletimeMultiplier] = useState(2);

  const calc = useMemo(() => {
    const rate = Math.max(0, hourlyRate);
    const totalHours = Math.max(0, workedHours);
    const regularCap = Math.max(0, regularThreshold);
    const dtHours = Math.max(0, Math.min(totalHours, doubletimeHours));
    const otHours = Math.max(0, totalHours - regularCap - dtHours);
    const regularHours = Math.max(0, totalHours - otHours - dtHours);

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
  }, [doubletimeHours, doubletimeMultiplier, hourlyRate, overtimeMultiplier, regularThreshold, workedHours]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Overtime Pay Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate weekly pay by splitting hours into regular, overtime, and optional double-time
          buckets.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

