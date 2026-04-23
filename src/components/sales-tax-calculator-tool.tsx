"use client";

import { useMemo, useState } from "react";

type Mode = "add-tax" | "extract-tax";

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

export function SalesTaxCalculatorTool() {
  const [mode, setMode] = useState<Mode>("add-tax");
  const [amount, setAmount] = useState("100");
  const [taxRate, setTaxRate] = useState("8.25");

  const calc = useMemo(() => {
    const inputAmount = Math.max(0, parseNum(amount));
    const rate = Math.max(0, parseNum(taxRate)) / 100;

    if (mode === "add-tax") {
      const preTax = inputAmount;
      const taxAmount = preTax * rate;
      const total = preTax + taxAmount;
      return { preTax, taxAmount, total };
    }

    const total = inputAmount;
    const preTax = rate === 0 ? total : total / (1 + rate);
    const taxAmount = total - preTax;
    return { preTax, taxAmount, total };
  }, [amount, mode, taxRate]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Sales Tax Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Add sales tax to a pre-tax amount or reverse-calculate pre-tax price from a tax-included total.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("add-tax")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "add-tax"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Pre-tax to Total
          </button>
          <button
            type="button"
            onClick={() => setMode("extract-tax")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "extract-tax"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Total to Pre-tax
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">
              {mode === "add-tax" ? "Pre-tax Amount (USD)" : "Total Amount (Tax Included, USD)"}
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Sales Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[0, 5, 8.25, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTaxRate(String(n))}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                Number(taxRate) === n
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {n}%
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pre-tax Amount</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.preTax)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tax Amount</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.taxAmount)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Final Total</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.total)}</p>
        </article>
      </div>
    </section>
  );
}

