"use client";

import { useMemo, useState } from "react";

type RaiseMode = "percent" | "amount";
type StateTaxPreset = "none" | "ca" | "ny" | "tx" | "fl" | "wa";

const STATE_TAX_PRESETS: Record<StateTaxPreset, number> = {
  none: 0,
  ca: 8.5,
  ny: 6.5,
  tx: 0,
  fl: 0,
  wa: 0,
};

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function PayRaiseCalculatorTool() {
  const [currentSalary, setCurrentSalary] = useState(90000);
  const [raiseMode, setRaiseMode] = useState<RaiseMode>("percent");
  const [statePreset, setStatePreset] = useState<StateTaxPreset>("none");
  const [raisePercent, setRaisePercent] = useState(5);
  const [raiseAmount, setRaiseAmount] = useState(5000);
  const [currentBonus, setCurrentBonus] = useState(0);
  const [newBonus, setNewBonus] = useState(0);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState(26);
  const [retirementContributionPct, setRetirementContributionPct] = useState(6);

  const calc = useMemo(() => {
    const salary = Math.max(0, currentSalary);
    const bonusNow = Math.max(0, currentBonus);
    const bonusAfter = Math.max(0, newBonus);
    const stateRate = STATE_TAX_PRESETS[statePreset] / 100;
    const taxRate =
      Math.max(0, Math.min(70, effectiveTaxRate)) / 100 + stateRate;
    const cappedTaxRate = Math.min(0.75, taxRate);

    const raiseValue =
      raiseMode === "percent"
        ? salary * (Math.max(-100, raisePercent) / 100)
        : raiseAmount;

    const nextSalary = Math.max(0, salary + raiseValue);
    const contributionRate = Math.max(0, Math.min(50, retirementContributionPct)) / 100;

    const retirementNow = salary * contributionRate;
    const retirementAfter = nextSalary * contributionRate;
    const annualGrossNow = salary + bonusNow;
    const annualGrossAfter = nextSalary + bonusAfter;
    const annualGrossDiff = annualGrossAfter - annualGrossNow;

    const annualNetNow = (annualGrossNow - retirementNow) * (1 - cappedTaxRate);
    const annualNetAfter = (annualGrossAfter - retirementAfter) * (1 - cappedTaxRate);
    const annualNetDiff = annualNetAfter - annualNetNow;

    return {
      raiseValue,
      nextSalary,
      contributionRate,
      retirementNow,
      retirementAfter,
      annualGrossNow,
      annualGrossAfter,
      annualGrossDiff,
      monthlyGrossDiff: annualGrossDiff / 12,
      annualNetNow,
      annualNetAfter,
      annualNetDiff,
      monthlyNetDiff: annualNetDiff / 12,
      cappedTaxRate,
    };
  }, [
    currentSalary,
    currentBonus,
    effectiveTaxRate,
    newBonus,
    raiseAmount,
    raiseMode,
    raisePercent,
    retirementContributionPct,
    statePreset,
  ]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Pay Raise Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate how a raise changes your annual and monthly gross pay, plus approximate take-home
          difference using an effective tax rate.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Current Base Salary (USD)</span>
            <input
              type="number"
              min={0}
              value={currentSalary}
              onChange={(event) => setCurrentSalary(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Raise Type</span>
            <select
              value={raiseMode}
              onChange={(event) => setRaiseMode(event.target.value as RaiseMode)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="percent">Percent Raise</option>
              <option value="amount">Fixed Amount Raise</option>
            </select>
          </label>

          {raiseMode === "percent" ? (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Raise Percent (%)</span>
              <input
                type="number"
                step="0.1"
                value={raisePercent}
                onChange={(event) => setRaisePercent(Number(event.target.value) || 0)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          ) : (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Raise Amount (USD)</span>
              <input
                type="number"
                step="1"
                value={raiseAmount}
                onChange={(event) => setRaiseAmount(Number(event.target.value) || 0)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          )}

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Current Annual Bonus (USD)</span>
            <input
              type="number"
              min={0}
              step="1"
              value={currentBonus}
              onChange={(event) => setCurrentBonus(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">New Annual Bonus (USD)</span>
            <input
              type="number"
              min={0}
              step="1"
              value={newBonus}
              onChange={(event) => setNewBonus(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Effective Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              max={70}
              step="0.1"
              value={effectiveTaxRate}
              onChange={(event) => setEffectiveTaxRate(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">State Tax Preset</span>
            <select
              value={statePreset}
              onChange={(event) => setStatePreset(event.target.value as StateTaxPreset)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="none">None / Custom Only</option>
              <option value="ca">California</option>
              <option value="ny">New York</option>
              <option value="tx">Texas</option>
              <option value="fl">Florida</option>
              <option value="wa">Washington</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">401(k) Contribution (%)</span>
            <input
              type="number"
              min={0}
              max={50}
              step="0.1"
              value={retirementContributionPct}
              onChange={(event) => setRetirementContributionPct(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">New Base Salary</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.nextSalary)}</p>
          <p className="mt-1 text-sm text-muted">Raise value: {money(calc.raiseValue)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Gross Pay Difference</p>
          <p className={`mt-2 text-2xl font-bold ${calc.annualGrossDiff >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.annualGrossDiff)} / year
          </p>
          <p className="mt-1 text-sm text-muted">{money(calc.monthlyGrossDiff)} / month</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Take-Home Difference (Est.)</p>
          <p className={`mt-2 text-2xl font-bold ${calc.annualNetDiff >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.annualNetDiff)} / year
          </p>
          <p className="mt-1 text-sm text-muted">{money(calc.monthlyNetDiff)} / month</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Before vs After Snapshot</p>
          <div className="mt-2 space-y-1 text-sm text-foreground">
            <p>Before net: {money(calc.annualNetNow)}</p>
            <p>After net: {money(calc.annualNetAfter)}</p>
            <p>Before 401(k): {money(calc.retirementNow)}</p>
            <p>After 401(k): {money(calc.retirementAfter)}</p>
          </div>
          <p className="mt-2 text-xs text-muted">
            Combined estimated tax rate used: {(calc.cappedTaxRate * 100).toFixed(2)}%
          </p>
        </article>
      </div>
    </section>
  );
}
