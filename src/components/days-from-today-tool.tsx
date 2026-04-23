"use client";

import { useMemo, useState } from "react";

type Mode = "calendar" | "business";

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function atLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addCalendarDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addBusinessDays(base: Date, days: number): Date {
  if (days === 0) return new Date(base);
  const step = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);
  const cursor = new Date(base);
  while (remaining > 0) {
    cursor.setDate(cursor.getDate() + step);
    if (isBusinessDay(cursor)) {
      remaining -= 1;
    }
  }
  return cursor;
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function DaysFromTodayTool() {
  const [baseDate, setBaseDate] = useState<string>(toIsoDate(new Date()));
  const [offset, setOffset] = useState<number>(30);
  const [mode, setMode] = useState<Mode>("calendar");
  const [includeStartDate, setIncludeStartDate] = useState(false);

  const result = useMemo(() => {
    const source = atLocalMidnight(new Date(baseDate));
    if (Number.isNaN(source.getTime())) {
      return null;
    }
    const effectiveOffset = includeStartDate && offset !== 0 ? offset - (offset > 0 ? 1 : -1) : offset;
    const target =
      mode === "business"
        ? addBusinessDays(source, effectiveOffset)
        : addCalendarDays(source, effectiveOffset);

    return {
      source,
      target,
      days: Math.trunc(offset),
      summary:
        offset === 0
          ? "Same day selected."
          : offset > 0
            ? `${Math.abs(offset)} day(s) after base date`
            : `${Math.abs(offset)} day(s) before base date`,
    };
  }, [baseDate, offset, mode, includeStartDate]);

  const quickOptions = [7, 14, 30, 60, 90, 180];

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Days From Today Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Add or subtract calendar days or business days from any base date.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Base Date</span>
            <input
              type="date"
              value={baseDate}
              onChange={(event) => setBaseDate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Days Offset</span>
            <input
              type="number"
              value={offset}
              onChange={(event) => setOffset(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setOffset(value)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
            >
              +{value}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOffset(-30)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            -30
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Mode</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as Mode)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="calendar">Calendar Days</option>
              <option value="business">Business Days (Mon-Fri)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground sm:self-end">
            <input
              type="checkbox"
              checked={includeStartDate}
              onChange={(event) => setIncludeStartDate(event.target.checked)}
            />
            Include start date in count
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Result Date</p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {result ? formatLongDate(result.target) : "Invalid date"}
          </p>
          <p className="mt-1 text-sm text-muted">{result?.summary ?? ""}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">ISO Output</p>
          <p className="mt-2 text-2xl font-bold text-brand">
            {result ? toIsoDate(result.target) : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Base Date</p>
          <p className="mt-2 text-sm text-foreground">
            {result ? formatLongDate(result.source) : "--"}
          </p>
        </article>
      </div>
    </section>
  );
}
