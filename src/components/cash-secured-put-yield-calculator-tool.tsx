"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function CashSecuredPutYieldCalculatorTool() {
  const [stockPrice, setStockPrice] = useState("185");
  const [strike, setStrike] = useState("175");
  const [premium, setPremium] = useState("2.8");
  const [contracts, setContracts] = useState("1");
  const [dte, setDte] = useState("30");
  const [rangePct, setRangePct] = useState("30");

  const calc = useMemo(() => {
    const s0 = Math.max(0.01, parseNum(stockPrice));
    const k = Math.max(0.01, parseNum(strike));
    const p = Math.max(0, parseNum(premium));
    const c = Math.max(1, Math.floor(parseNum(contracts) || 1));
    const qty = c * 100;
    const t = Math.max(1, parseNum(dte));
    const r = Math.min(80, Math.max(10, parseNum(rangePct)));

    const premiumIncome = p * qty;
    const collateral = k * qty;
    const breakeven = k - p;
    const effectiveBuyCost = breakeven * qty;
    const returnOnCollateral = premiumIncome / collateral;
    const annualizedYield = returnOnCollateral * (365 / t);
    const cushionPct = (s0 - breakeven) / s0;

    const lower = Math.max(0, s0 * (1 - r / 100));
    const upper = s0 * (1 + r / 100);
    const steps = 14;
    const rows = Array.from({ length: steps + 1 }, (_, i) => {
      const st = lower + ((upper - lower) * i) / steps;
      const pnl = st >= k ? premiumIncome : (st - k + p) * qty;
      const assigned = st < k;
      return { st, pnl, assigned };
    });

    return {
      s0,
      k,
      p,
      qty,
      t,
      premiumIncome,
      collateral,
      breakeven,
      effectiveBuyCost,
      returnOnCollateral,
      annualizedYield,
      cushionPct,
      rows,
    };
  }, [stockPrice, strike, premium, contracts, dte, rangePct]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Cash-Secured Put Yield Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate premium yield, breakeven, assignment cost basis, annualized return, and
          expiration outcomes for a cash-secured put.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/tools/covered-call-return-calculator"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Covered Call Tool
          </Link>
          <Link
            href="/tools/options-breakeven-pl-calculator"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Options Breakeven Tool
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Stock Price Now ($)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={stockPrice}
              onChange={(event) => setStockPrice(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Put Strike ($)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={strike}
              onChange={(event) => setStrike(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Premium Received ($/share)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={premium}
              onChange={(event) => setPremium(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Contracts</span>
            <input
              type="number"
              min={1}
              step="1"
              value={contracts}
              onChange={(event) => setContracts(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Days to Expiration</span>
            <input
              type="number"
              min={1}
              step="1"
              value={dte}
              onChange={(event) => setDte(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Scenario Range (+/- %)</span>
            <input
              type="number"
              min={10}
              max={80}
              step="5"
              value={rangePct}
              onChange={(event) => setRangePct(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-muted">
          Educational estimate only. Real assignment behavior and final fill quality can differ in
          live markets.
        </p>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Breakeven</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.breakeven)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Premium Income</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.premiumIncome)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Collateral Required</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.collateral)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Return on Collateral</p>
          <p className="mt-2 text-2xl font-bold">{pct(calc.returnOnCollateral)}</p>
          <p className="mt-1 text-xs text-muted">Annualized: {pct(calc.annualizedYield)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">If Assigned Cost Basis</p>
          <p className="mt-2 text-2xl font-bold">{money(calc.breakeven)} / share</p>
          <p className="mt-1 text-xs text-muted">Total basis: {money(calc.effectiveBuyCost)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Downside Cushion</p>
          <p className="mt-2 text-2xl font-bold">{pct(calc.cushionPct)}</p>
        </article>
      </div>

      <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold sm:text-xl">Expiration Scenario P/L</h3>
        <div className="mt-3 overflow-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th className="px-3 py-2 font-semibold text-foreground">Underlying at Expiry</th>
                <th className="px-3 py-2 font-semibold text-foreground">Assigned?</th>
                <th className="px-3 py-2 font-semibold text-foreground">Position P/L</th>
              </tr>
            </thead>
            <tbody>
              {calc.rows.map((row) => (
                <tr key={row.st} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2">{money(row.st)}</td>
                  <td className="px-3 py-2">{row.assigned ? "Yes" : "No"}</td>
                  <td className={`px-3 py-2 font-semibold ${row.pnl >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {money(row.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
