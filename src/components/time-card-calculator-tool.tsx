"use client";

import { useMemo, useState } from "react";

type DayEntry = {
  id: string;
  label: string;
  inTime: string;
  outTime: string;
  breakMinutes: number;
};

const WEEK_DAYS: Array<Pick<DayEntry, "id" | "label">> = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

function parseMinutes(timeValue: string): number | null {
  if (!timeValue) return null;
  const [h, m] = timeValue.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function formatHours(hours: number): string {
  return `${hours.toFixed(2)} h`;
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function TimeCardCalculatorTool() {
  const [rows, setRows] = useState<DayEntry[]>(
    WEEK_DAYS.map((day) => ({
      id: day.id,
      label: day.label,
      inTime: "",
      outTime: "",
      breakMinutes: 30,
    })),
  );
  const [hourlyRate, setHourlyRate] = useState<number>(20);
  const [overtimeThreshold, setOvertimeThreshold] = useState<number>(40);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);

  const dayResults = useMemo(() => {
    return rows.map((row) => {
      const inMinutes = parseMinutes(row.inTime);
      const outMinutes = parseMinutes(row.outTime);
      if (inMinutes == null || outMinutes == null) {
        return { ...row, workedMinutes: 0, valid: false };
      }
      let duration = outMinutes - inMinutes;
      if (duration < 0) duration += 24 * 60;
      duration = Math.max(0, duration - Math.max(0, row.breakMinutes));
      return { ...row, workedMinutes: duration, valid: true };
    });
  }, [rows]);

  const totals = useMemo(() => {
    const totalMinutes = dayResults.reduce((sum, row) => sum + row.workedMinutes, 0);
    const totalHours = totalMinutes / 60;
    const regularHours = Math.min(totalHours, Math.max(0, overtimeThreshold));
    const overtimeHours = Math.max(0, totalHours - Math.max(0, overtimeThreshold));
    const regularPay = regularHours * Math.max(0, hourlyRate);
    const overtimePay = overtimeHours * Math.max(0, hourlyRate) * Math.max(1, overtimeMultiplier);
    const grossPay = regularPay + overtimePay;

    return {
      totalHours,
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      grossPay,
    };
  }, [dayResults, hourlyRate, overtimeMultiplier, overtimeThreshold]);

  function updateRow(id: string, patch: Partial<DayEntry>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function resetWeek() {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        inTime: "",
        outTime: "",
        breakMinutes: 30,
      })),
    );
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Time Card Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Enter daily clock-in and clock-out times to calculate weekly hours, overtime, and gross pay.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-2 py-2">Day</th>
                <th className="px-2 py-2">Clock In</th>
                <th className="px-2 py-2">Clock Out</th>
                <th className="px-2 py-2">Break (min)</th>
                <th className="px-2 py-2">Hours</th>
              </tr>
            </thead>
            <tbody>
              {dayResults.map((row) => (
                <tr key={row.id} className="border-b border-line/70">
                  <td className="px-2 py-2 font-semibold">{row.label}</td>
                  <td className="px-2 py-2">
                    <input
                      type="time"
                      value={row.inTime}
                      onChange={(event) => updateRow(row.id, { inTime: event.target.value })}
                      className="h-9 w-28 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="time"
                      value={row.outTime}
                      onChange={(event) => updateRow(row.id, { outTime: event.target.value })}
                      className="h-9 w-28 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      max={240}
                      value={row.breakMinutes}
                      onChange={(event) => updateRow(row.id, { breakMinutes: Number(event.target.value) || 0 })}
                      className="h-9 w-24 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
                    />
                  </td>
                  <td className="px-2 py-2 font-semibold text-foreground">{formatHours(row.workedMinutes / 60)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Hourly Rate</span>
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
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">OT Threshold</span>
            <input
              type="number"
              min={0}
              step="0.5"
              value={overtimeThreshold}
              onChange={(event) => setOvertimeThreshold(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">OT Multiplier</span>
            <input
              type="number"
              min={1}
              step="0.1"
              value={overtimeMultiplier}
              onChange={(event) => setOvertimeMultiplier(Number(event.target.value) || 1)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={resetWeek}
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand sm:text-sm"
          >
            Clear Week
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Hours</p>
          <p className="mt-2 text-3xl font-bold text-brand">{formatHours(totals.totalHours)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Regular vs Overtime</p>
          <p className="mt-2 text-sm text-foreground">Regular: {formatHours(totals.regularHours)}</p>
          <p className="mt-1 text-sm text-foreground">Overtime: {formatHours(totals.overtimeHours)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Gross Pay</p>
          <p className="mt-2 text-2xl font-bold">{currency(totals.grossPay)}</p>
          <p className="mt-1 text-xs text-muted">
            Regular {currency(totals.regularPay)} + Overtime {currency(totals.overtimePay)}
          </p>
        </article>
      </div>
    </section>
  );
}
