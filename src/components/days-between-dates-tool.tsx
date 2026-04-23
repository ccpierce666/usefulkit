"use client";

import { useMemo, useState } from "react";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function utcDayStamp(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DaysBetweenDatesTool() {
  const today = new Date();
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 30);

  const [startDate, setStartDate] = useState(toDateInputValue(today));
  const [endDate, setEndDate] = useState(toDateInputValue(defaultEnd));
  const [includeBoundaries, setIncludeBoundaries] = useState(false);

  const result = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) {
      return null;
    }

    const diffMs = utcDayStamp(end) - utcDayStamp(start);
    const rawDays = Math.floor(Math.abs(diffMs) / 86400000);
    const signed = diffMs >= 0 ? 1 : -1;
    const days = includeBoundaries ? rawDays + 1 : rawDays;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    return {
      days,
      weeks,
      remainingDays,
      direction: signed >= 0 ? "forward" : "backward",
    };
  }, [endDate, includeBoundaries, startDate]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Days Between Dates</h2>
        <p className="mt-2 text-sm text-muted">Calculate exact day difference between two dates.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={includeBoundaries}
            onChange={(event) => setIncludeBoundaries(event.target.checked)}
          />
          Include start and end dates in total
        </label>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Days</p>
          <p className="mt-2 text-3xl font-bold">{result ? result.days.toLocaleString() : "--"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Weeks + Days</p>
          <p className="mt-2 text-2xl font-bold">
            {result ? `${result.weeks} weeks ${result.remainingDays} days` : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Direction</p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {result ? (result.direction === "forward" ? "End is after start" : "End is before start") : "--"}
          </p>
        </article>
      </div>
    </section>
  );
}
