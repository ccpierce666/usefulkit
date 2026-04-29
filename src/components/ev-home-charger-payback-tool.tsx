"use client";

import Link from "next/link";
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

export function EvHomeChargerPaybackTool() {
  const [monthlyMiles, setMonthlyMiles] = useState("1100");
  const [efficiency, setEfficiency] = useState("3.4");
  const [homeRate, setHomeRate] = useState("0.17");
  const [publicRate, setPublicRate] = useState("0.43");
  const [homeShareBefore, setHomeShareBefore] = useState("20");
  const [homeShareAfter, setHomeShareAfter] = useState("82");
  const [installCost, setInstallCost] = useState("1900");
  const [rebate, setRebate] = useState("500");
  const [annualMaintenance, setAnnualMaintenance] = useState("36");

  const calc = useMemo(() => {
    const miles = Math.max(0, parseNum(monthlyMiles));
    const miPerKwh = Math.max(0.1, parseNum(efficiency));
    const homePrice = Math.max(0, parseNum(homeRate));
    const publicPrice = Math.max(0, parseNum(publicRate));
    const beforeHomePct = Math.min(100, Math.max(0, parseNum(homeShareBefore))) / 100;
    const afterHomePct = Math.min(100, Math.max(0, parseNum(homeShareAfter))) / 100;
    const netInstall = Math.max(0, parseNum(installCost) - parseNum(rebate));
    const monthlyMaintenance = Math.max(0, parseNum(annualMaintenance)) / 12;

    const monthlyKwh = miles / miPerKwh;
    const monthlyCostBefore = monthlyKwh * (beforeHomePct * homePrice + (1 - beforeHomePct) * publicPrice);
    const monthlyCostAfter =
      monthlyKwh * (afterHomePct * homePrice + (1 - afterHomePct) * publicPrice) + monthlyMaintenance;
    const monthlySavings = monthlyCostBefore - monthlyCostAfter;
    const paybackMonths = monthlySavings > 0 ? netInstall / monthlySavings : Number.POSITIVE_INFINITY;
    const annualSavings = monthlySavings * 12;
    const threeYearNet = monthlySavings * 36 - netInstall;
    const fiveYearNet = monthlySavings * 60 - netInstall;

    return {
      monthlyKwh,
      monthlyCostBefore,
      monthlyCostAfter,
      monthlySavings,
      annualSavings,
      netInstall,
      paybackMonths,
      threeYearNet,
      fiveYearNet,
    };
  }, [
    annualMaintenance,
    efficiency,
    homeRate,
    homeShareAfter,
    homeShareBefore,
    installCost,
    monthlyMiles,
    publicRate,
    rebate,
  ]);

  const paybackLabel =
    Number.isFinite(calc.paybackMonths) && calc.paybackMonths > 0
      ? `${Math.ceil(calc.paybackMonths)} months`
      : "No payback under current assumptions";

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">EV Home Charger Payback Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate how quickly a Level 2 home charger pays back compared with relying more on public charging.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/tools/ev-charging-cost-calculator"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            EV Charging Cost Calculator
          </Link>
          <Link
            href="/tools/ev-charge-time-estimator"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            EV Charge Time Estimator
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Monthly Miles</span>
            <input
              type="number"
              min={0}
              step="50"
              value={monthlyMiles}
              onChange={(event) => setMonthlyMiles(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">EV Efficiency (mi/kWh)</span>
            <input
              type="number"
              min={1}
              step="0.1"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Home Rate ($/kWh)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={homeRate}
              onChange={(event) => setHomeRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Public DC Rate ($/kWh)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={publicRate}
              onChange={(event) => setPublicRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Home Share Before Install (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={homeShareBefore}
              onChange={(event) => setHomeShareBefore(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Home Share After Install (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={homeShareAfter}
              onChange={(event) => setHomeShareAfter(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Install Cost ($)</span>
            <input
              type="number"
              min={0}
              step="50"
              value={installCost}
              onChange={(event) => setInstallCost(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Rebate or Tax Credit ($)</span>
            <input
              type="number"
              min={0}
              step="50"
              value={rebate}
              onChange={(event) => setRebate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Annual Charger Maintenance ($)</span>
            <input
              type="number"
              min={0}
              step="5"
              value={annualMaintenance}
              onChange={(event) => setAnnualMaintenance(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Payback</p>
          <p className="mt-2 text-2xl font-bold text-brand">{paybackLabel}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Net Install Cost</p>
          <p className="mt-2 text-2xl font-bold">{money(calc.netInstall)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly Savings</p>
          <p className={`mt-2 text-2xl font-bold ${calc.monthlySavings >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.monthlySavings)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Annual Savings</p>
          <p className={`mt-2 text-2xl font-bold ${calc.annualSavings >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.annualSavings)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">3-Year Net Impact</p>
          <p className={`mt-2 text-2xl font-bold ${calc.threeYearNet >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.threeYearNet)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">5-Year Net Impact</p>
          <p className={`mt-2 text-2xl font-bold ${calc.fiveYearNet >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.fiveYearNet)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly Energy Use</p>
          <p className="mt-2 text-2xl font-bold">{calc.monthlyKwh.toFixed(1)} kWh</p>
        </article>
      </div>
    </section>
  );
}
