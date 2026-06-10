"use client";

import { useMemo, useState } from "react";

type CoverageType = "self" | "family";
type TaxYear = "2025" | "2026";

const HSA_LIMITS: Record<TaxYear, Record<CoverageType, number>> = {
  "2025": { self: 4300, family: 8550 },
  "2026": { self: 4400, family: 8750 },
};

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

export function HsaContributionTaxSavingsCalculatorTool() {
  const [taxYear, setTaxYear] = useState<TaxYear>("2026");
  const [coverageType, setCoverageType] = useState<CoverageType>("self");
  const [monthsEligible, setMonthsEligible] = useState("12");
  const [age55Plus, setAge55Plus] = useState(false);
  const [annualLimit, setAnnualLimit] = useState(String(HSA_LIMITS["2026"].self));
  const [employerContribution, setEmployerContribution] = useState("1200");
  const [yourContribution, setYourContribution] = useState("3200");
  const [throughPayroll, setThroughPayroll] = useState(true);
  const [federalRate, setFederalRate] = useState("22");
  const [stateRate, setStateRate] = useState("5");

  const result = useMemo(() => {
    const months = Math.min(12, Math.max(0, parseNum(monthsEligible)));
    const limit = Math.max(0, parseNum(annualLimit));
    const employer = Math.max(0, parseNum(employerContribution));
    const employee = Math.max(0, parseNum(yourContribution));
    const catchUp = age55Plus ? 1000 : 0;
    const proratedLimit = limit * (months / 12);
    const allowedLimit = proratedLimit + catchUp;
    const totalPlanned = employer + employee;
    const remainingRoom = Math.max(0, allowedLimit - totalPlanned);
    const excessContribution = Math.max(0, totalPlanned - allowedLimit);
    const usedContribution = Math.min(employee, Math.max(0, allowedLimit - employer));
    const taxRate =
      (Math.max(0, parseNum(federalRate)) +
        Math.max(0, parseNum(stateRate)) +
        (throughPayroll ? 7.65 : 0)) /
      100;
    const estimatedTaxSavings = usedContribution * taxRate;
    const netOutOfPocket = Math.max(0, usedContribution - estimatedTaxSavings);

    return {
      catchUp,
      allowedLimit,
      totalPlanned,
      remainingRoom,
      excessContribution,
      estimatedTaxSavings,
      netOutOfPocket,
    };
  }, [
    age55Plus,
    annualLimit,
    employerContribution,
    federalRate,
    monthsEligible,
    stateRate,
    throughPayroll,
    yourContribution,
  ]);

  function handleYearOrCoverage(nextYear: TaxYear, nextCoverage: CoverageType) {
    setTaxYear(nextYear);
    setCoverageType(nextCoverage);
    setAnnualLimit(String(HSA_LIMITS[nextYear][nextCoverage]));
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">
          HSA Contribution & Tax Savings Calculator
        </h2>
        <p className="mt-2 text-sm text-muted">
          Estimate HSA contribution room, catch-up eligibility, and tax savings from payroll or
          direct contributions.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Tax Year</span>
            <select
              value={taxYear}
              onChange={(event) =>
                handleYearOrCoverage(event.target.value as TaxYear, coverageType)
              }
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Coverage Type</span>
            <select
              value={coverageType}
              onChange={(event) =>
                handleYearOrCoverage(taxYear, event.target.value as CoverageType)
              }
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="self">Self-only HDHP</option>
              <option value="family">Family HDHP</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Months Eligible</span>
            <input
              type="number"
              min={0}
              max={12}
              step="1"
              value={monthsEligible}
              onChange={(event) => setMonthsEligible(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Annual HSA Limit</span>
            <input
              type="number"
              min={0}
              step="50"
              value={annualLimit}
              onChange={(event) => setAnnualLimit(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Employer Contribution</span>
            <input
              type="number"
              min={0}
              step="50"
              value={employerContribution}
              onChange={(event) => setEmployerContribution(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Your Contribution</span>
            <input
              type="number"
              min={0}
              step="50"
              value={yourContribution}
              onChange={(event) => setYourContribution(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Federal Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              max={40}
              step="0.1"
              value={federalRate}
              onChange={(event) => setFederalRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">State Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              max={15}
              step="0.1"
              value={stateRate}
              onChange={(event) => setStateRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={age55Plus}
              onChange={(event) => setAge55Plus(event.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            Include age 55+ catch-up contribution
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={throughPayroll}
              onChange={(event) => setThroughPayroll(event.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            Contribution is made through payroll (adds estimated FICA savings)
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Allowed Contribution Limit
          </p>
          <p className="mt-2 text-3xl font-bold">{money(result.allowedLimit)}</p>
          <p className="mt-1 text-sm text-muted">
            Includes {money(result.catchUp)} catch-up if selected
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Remaining Room</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(result.remainingRoom)}</p>
          <p className="mt-1 text-sm text-muted">Available before hitting the annual cap</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Estimated Tax Savings
          </p>
          <p className="mt-2 text-3xl font-bold">{money(result.estimatedTaxSavings)}</p>
          <p className="mt-1 text-sm text-muted">Based on your chosen federal/state rate inputs</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Net Out-of-Pocket Cost
          </p>
          <p className="mt-2 text-2xl font-bold">{money(result.netOutOfPocket)}</p>
          <p className="mt-1 text-sm text-muted">Your contribution minus estimated tax savings</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Excess Contribution Risk
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${
              result.excessContribution > 0 ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            {money(result.excessContribution)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Extra amount above your current planned limit
          </p>
        </article>
      </div>
    </section>
  );
}
