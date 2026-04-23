"use client";

import { useMemo, useState } from "react";

type Mode = "from-cost" | "from-price";

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function money(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function pct(value: number): string {
  if (!Number.isFinite(value)) return "--";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

export function MarkupMarginCalculatorTool() {
  const [mode, setMode] = useState<Mode>("from-cost");
  const [cost, setCost] = useState("50");
  const [price, setPrice] = useState("80");
  const [markupPct, setMarkupPct] = useState("30");

  const result = useMemo(() => {
    const c = Math.max(0, parseNum(cost));
    const p = Math.max(0, parseNum(price));
    const m = Math.max(0, parseNum(markupPct));

    if (mode === "from-cost") {
      const sellingPrice = c * (1 + m / 100);
      const profit = sellingPrice - c;
      const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
      return {
        cost: c,
        price: sellingPrice,
        profit,
        markup: m,
        margin,
      };
    }

    const profit = p - c;
    const markup = c > 0 ? (profit / c) * 100 : 0;
    const margin = p > 0 ? (profit / p) * 100 : 0;
    return {
      cost: c,
      price: p,
      profit,
      markup,
      margin,
    };
  }, [cost, markupPct, mode, price]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Markup & Margin Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Calculate selling price, markup, margin, and profit for pricing decisions.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("from-cost")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "from-cost"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Cost + Markup % to Price
          </button>
          <button
            type="button"
            onClick={() => setMode("from-price")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "from-price"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Cost + Price to Margin
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Cost (USD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          {mode === "from-cost" ? (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Markup (%)</span>
              <input
                type="number"
                min={0}
                step="0.1"
                value={markupPct}
                onChange={(event) => setMarkupPct(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          ) : (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Selling Price (USD)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selling Price</p>
          <p className="mt-2 text-3xl font-bold">{money(result.price)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Profit</p>
          <p className={`mt-2 text-3xl font-bold ${result.profit >= 0 ? "text-brand" : "text-red-600"}`}>
            {money(result.profit)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Markup</p>
          <p className="mt-2 text-3xl font-bold">{pct(result.markup)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Margin</p>
          <p className="mt-2 text-3xl font-bold">{pct(result.margin)}</p>
        </article>
      </div>
    </section>
  );
}
