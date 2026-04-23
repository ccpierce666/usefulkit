"use client";

import { useMemo, useState } from "react";

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

export function DiscountCalculatorTool() {
  const [originalPrice, setOriginalPrice] = useState("100");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [taxPercent, setTaxPercent] = useState("0");

  const calc = useMemo(() => {
    const original = Math.max(0, parseNum(originalPrice));
    const discount = Math.max(0, parseNum(discountPercent));
    const tax = Math.max(0, parseNum(taxPercent));

    const discountAmount = original * (discount / 100);
    const discountedPrice = Math.max(0, original - discountAmount);
    const taxAmount = discountedPrice * (tax / 100);
    const finalPrice = discountedPrice + taxAmount;

    return {
      original,
      discountAmount,
      discountedPrice,
      taxAmount,
      finalPrice,
    };
  }, [discountPercent, originalPrice, taxPercent]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Discount Calculator</h2>
        <p className="mt-2 text-sm text-muted">Calculate sale price, savings, and optional tax in one step.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Original Price (USD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Discount (%)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={discountPercent}
              onChange={(event) => setDiscountPercent(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Tax After Discount (%)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={taxPercent}
              onChange={(event) => setTaxPercent(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[10, 15, 20, 30, 50].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setDiscountPercent(String(n))}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                Number(discountPercent) === n
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {n}% OFF
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">You Save</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.discountAmount)}</p>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Price After Discount</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.discountedPrice)}</p>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tax Amount</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.taxAmount)}</p>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Final Price</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.finalPrice)}</p>
        </article>
      </div>
    </section>
  );
}
