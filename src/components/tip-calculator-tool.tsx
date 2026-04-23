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

export function TipCalculatorTool() {
  const [bill, setBill] = useState("80");
  const [tipPercent, setTipPercent] = useState("18");
  const [taxPercent, setTaxPercent] = useState("0");
  const [people, setPeople] = useState("2");

  const calc = useMemo(() => {
    const billNum = Math.max(0, parseNum(bill));
    const tipRate = Math.max(0, parseNum(tipPercent)) / 100;
    const taxRate = Math.max(0, parseNum(taxPercent)) / 100;
    const peopleNum = Math.max(1, Math.floor(parseNum(people) || 1));

    const taxAmount = billNum * taxRate;
    const tipAmount = billNum * tipRate;
    const total = billNum + taxAmount + tipAmount;
    const perPerson = total / peopleNum;

    return {
      billNum,
      taxAmount,
      tipAmount,
      total,
      perPerson,
      peopleNum,
    };
  }, [bill, tipPercent, taxPercent, people]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Tip Calculator</h2>
        <p className="mt-2 text-sm text-muted">Calculate tip, total bill, and per-person split instantly.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Bill Amount (USD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={bill}
              onChange={(event) => setBill(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Tip (%)</span>
            <input
              type="number"
              min={0}
              step="1"
              value={tipPercent}
              onChange={(event) => setTipPercent(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Tax (%)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={taxPercent}
              onChange={(event) => setTaxPercent(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Split Between</span>
            <input
              type="number"
              min={1}
              step="1"
              value={people}
              onChange={(event) => setPeople(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[15, 18, 20, 25].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTipPercent(String(n))}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                Number(tipPercent) === n
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
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tip Amount</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.tipAmount)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tax Amount</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.taxAmount)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Bill</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.total)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Per Person ({calc.peopleNum})
          </p>
          <p className="mt-2 text-3xl font-bold">{money(calc.perPerson)}</p>
        </article>
      </div>
    </section>
  );
}
