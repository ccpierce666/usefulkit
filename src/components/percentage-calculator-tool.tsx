"use client";

import { useMemo, useState } from "react";

type Mode = "what-percent" | "percent-of" | "percent-change";

function safeNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(value: number): string {
  if (!Number.isFinite(value)) return "--";
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function PercentageCalculatorTool() {
  const [mode, setMode] = useState<Mode>("what-percent");
  const [a, setA] = useState("50");
  const [b, setB] = useState("200");

  const result = useMemo(() => {
    const x = safeNumber(a);
    const y = safeNumber(b);

    if (mode === "what-percent") {
      if (y === 0) return "--";
      return `${fmt((x / y) * 100)}%`;
    }
    if (mode === "percent-of") {
      return fmt((x / 100) * y);
    }
    if (x === 0) return "--";
    return `${fmt(((y - x) / x) * 100)}%`;
  }, [a, b, mode]);

  const labelA =
    mode === "what-percent"
      ? "Part Value"
      : mode === "percent-of"
        ? "Percentage (%)"
        : "Old Value";
  const labelB =
    mode === "what-percent"
      ? "Total Value"
      : mode === "percent-of"
        ? "Base Number"
        : "New Value";

  const formula =
    mode === "what-percent"
      ? "(part / total) × 100"
      : mode === "percent-of"
        ? "(percentage / 100) × base"
        : "((new - old) / old) × 100";

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Percentage Calculator</h2>
        <p className="mt-2 text-sm text-muted">Choose a mode and get instant percentage results.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("what-percent")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "what-percent"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            X is what % of Y
          </button>
          <button
            type="button"
            onClick={() => setMode("percent-of")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "percent-of"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            X% of Y
          </button>
          <button
            type="button"
            onClick={() => setMode("percent-change")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "percent-change"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            % Change
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">{labelA}</span>
            <input
              type="number"
              value={a}
              onChange={(event) => setA(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">{labelB}</span>
            <input
              type="number"
              value={b}
              onChange={(event) => setB(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Result</p>
          <p className="mt-2 text-3xl font-bold">{result}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Formula</p>
          <p className="mt-2 text-sm text-foreground">{formula}</p>
        </article>
      </div>
    </section>
  );
}
