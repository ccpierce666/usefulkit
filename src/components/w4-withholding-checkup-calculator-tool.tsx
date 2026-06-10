"use client";

import { useMemo, useState } from "react";

type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
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

export function W4WithholdingCheckupCalculatorTool() {
  const [annualWages, setAnnualWages] = useState("98000");
  const [otherIncome, setOtherIncome] = useState("4000");
  const [preTaxDeductions, setPreTaxDeductions] = useState("6000");
  const [taxCredits, setTaxCredits] = useState("2000");
  const [effectiveTaxRate, setEffectiveTaxRate] = useState("14");
  const [currentWithholdingPerPaycheck, setCurrentWithholdingPerPaycheck] = useState("420");
  const [federalWithheldYtd, setFederalWithheldYtd] = useState("3900");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [remainingPaychecks, setRemainingPaychecks] = useState("14");

  const result = useMemo(() => {
    const gross = Math.max(0, parseNum(annualWages));
    const extraIncome = Math.max(0, parseNum(otherIncome));
    const preTax = Math.max(0, parseNum(preTaxDeductions));
    const credits = Math.max(0, parseNum(taxCredits));
    const effectiveRate = Math.max(0, parseNum(effectiveTaxRate)) / 100;
    const currentPerCheck = Math.max(0, parseNum(currentWithholdingPerPaycheck));
    const withheldYtd = Math.max(0, parseNum(federalWithheldYtd));
    const checksLeft = Math.max(1, Math.round(parseNum(remainingPaychecks)));
    const annualChecks = PAY_PERIODS[payFrequency];

    const estimatedTaxableIncome = Math.max(0, gross + extraIncome - preTax);
    const estimatedFederalTax = Math.max(0, estimatedTaxableIncome * effectiveRate - credits);
    const projectedFutureWithholding = currentPerCheck * checksLeft;
    const projectedAnnualWithholding = withheldYtd + projectedFutureWithholding;
    const refundOrBalance = projectedAnnualWithholding - estimatedFederalTax;
    const extraPerPaycheckNeeded =
      refundOrBalance >= 0 ? 0 : Math.abs(refundOrBalance) / checksLeft;
    const possibleReductionPerPaycheck =
      refundOrBalance > 0 ? refundOrBalance / checksLeft : 0;
    const targetWithholdingPerPaycheck =
      refundOrBalance >= 0
        ? Math.max(0, currentPerCheck - possibleReductionPerPaycheck)
        : currentPerCheck + extraPerPaycheckNeeded;

    return {
      annualChecks,
      estimatedTaxableIncome,
      estimatedFederalTax,
      projectedFutureWithholding,
      projectedAnnualWithholding,
      refundOrBalance,
      extraPerPaycheckNeeded,
      possibleReductionPerPaycheck,
      targetWithholdingPerPaycheck,
    };
  }, [
    annualWages,
    currentWithholdingPerPaycheck,
    effectiveTaxRate,
    federalWithheldYtd,
    otherIncome,
    payFrequency,
    preTaxDeductions,
    remainingPaychecks,
    taxCredits,
  ]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">W-4 Withholding Checkup Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate whether your federal withholding is on track and how much extra withholding per
          paycheck may be needed.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Annual W-2 Wages (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={annualWages}
              onChange={(event) => setAnnualWages(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Other Taxable Income (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={otherIncome}
              onChange={(event) => setOtherIncome(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Pre-tax Deductions (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={preTaxDeductions}
              onChange={(event) => setPreTaxDeductions(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Tax Credits (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={taxCredits}
              onChange={(event) => setTaxCredits(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">
              Effective Federal Tax Rate (%)
            </span>
            <input
              type="number"
              min={0}
              max={40}
              step="0.1"
              value={effectiveTaxRate}
              onChange={(event) => setEffectiveTaxRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Pay Frequency</span>
            <select
              value={payFrequency}
              onChange={(event) => setPayFrequency(event.target.value as PayFrequency)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="weekly">Weekly (52)</option>
              <option value="biweekly">Biweekly (26)</option>
              <option value="semimonthly">Semi-monthly (24)</option>
              <option value="monthly">Monthly (12)</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">
              Current Federal Withholding / Paycheck
            </span>
            <input
              type="number"
              min={0}
              step="1"
              value={currentWithholdingPerPaycheck}
              onChange={(event) => setCurrentWithholdingPerPaycheck(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Federal Tax Withheld YTD</span>
            <input
              type="number"
              min={0}
              step="100"
              value={federalWithheldYtd}
              onChange={(event) => setFederalWithheldYtd(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Remaining Paychecks This Year</span>
            <input
              type="number"
              min={1}
              step="1"
              value={remainingPaychecks}
              onChange={(event) => setRemainingPaychecks(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Estimated Federal Tax
          </p>
          <p className="mt-2 text-3xl font-bold">{money(result.estimatedFederalTax)}</p>
          <p className="mt-1 text-sm text-muted">
            Planning estimate on {result.annualChecks} pay periods/year
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Projected Annual Withholding
          </p>
          <p className="mt-2 text-3xl font-bold">{money(result.projectedAnnualWithholding)}</p>
          <p className="mt-1 text-sm text-muted">
            YTD plus remaining paycheck withholding
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Expected Refund / Balance
          </p>
          <p
            className={`mt-2 text-3xl font-bold ${
              result.refundOrBalance >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {money(result.refundOrBalance)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Positive = likely refund, negative = likely shortfall
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Suggested W-4 Step 4(c)
          </p>
          <p className="mt-2 text-3xl font-bold text-brand">
            {money(result.extraPerPaycheckNeeded)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Extra withholding per remaining paycheck if you are behind
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Target Federal Withholding / Paycheck
          </p>
          <p className="mt-2 text-2xl font-bold">{money(result.targetWithholdingPerPaycheck)}</p>
          <p className="mt-1 text-sm text-muted">
            Use this as a check when updating payroll elections
          </p>
        </article>
      </div>
    </section>
  );
}
