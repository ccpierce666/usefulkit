"use client";

import { useMemo, useState } from "react";

type IncomeMode = "salary" | "hourly";
type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function PaycheckCalculatorTool() {
  const [incomeMode, setIncomeMode] = useState<IncomeMode>("salary");
  const [annualSalary, setAnnualSalary] = useState(85000);
  const [hourlyRate, setHourlyRate] = useState(32);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [preTaxDeduction, setPreTaxDeduction] = useState(150);
  const [federalRate, setFederalRate] = useState(12);
  const [stateRate, setStateRate] = useState(5);
  const [localRate, setLocalRate] = useState(0);
  const [applyFica, setApplyFica] = useState(true);

  const result = useMemo(() => {
    const periods = PAY_PERIODS[payFrequency];
    const grossAnnual =
      incomeMode === "salary"
        ? Math.max(0, annualSalary)
        : Math.max(0, hourlyRate) * Math.max(0, hoursPerWeek) * 52;

    const grossPerPaycheck = grossAnnual / periods;
    const taxablePerPaycheck = Math.max(0, grossPerPaycheck - Math.max(0, preTaxDeduction));

    const federalTax = taxablePerPaycheck * Math.max(0, federalRate) / 100;
    const stateTax = taxablePerPaycheck * Math.max(0, stateRate) / 100;
    const localTax = taxablePerPaycheck * Math.max(0, localRate) / 100;
    const ficaTax = applyFica ? grossPerPaycheck * 0.0765 : 0;

    const totalTaxes = federalTax + stateTax + localTax + ficaTax;
    const netPay = Math.max(0, grossPerPaycheck - Math.max(0, preTaxDeduction) - totalTaxes);

    return {
      periods,
      grossAnnual,
      grossPerPaycheck,
      federalTax,
      stateTax,
      localTax,
      ficaTax,
      totalTaxes,
      netPay,
      annualNet: netPay * periods,
      annualTaxes: totalTaxes * periods,
    };
  }, [
    annualSalary,
    hourlyRate,
    hoursPerWeek,
    payFrequency,
    incomeMode,
    preTaxDeduction,
    federalRate,
    stateRate,
    localRate,
    applyFica,
  ]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Paycheck Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate gross pay, taxes, and take-home pay using your pay frequency and tax assumptions.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIncomeMode("salary")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              incomeMode === "salary"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-white text-muted"
            }`}
          >
            Annual Salary
          </button>
          <button
            type="button"
            onClick={() => setIncomeMode("hourly")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              incomeMode === "hourly"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-white text-muted"
            }`}
          >
            Hourly Pay
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {incomeMode === "salary" ? (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Annual Salary (USD)</span>
              <input
                type="number"
                min={0}
                value={annualSalary}
                onChange={(event) => setAnnualSalary(Number(event.target.value) || 0)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          ) : (
            <>
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-foreground">Hourly Rate (USD)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(Number(event.target.value) || 0)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-foreground">Hours Per Week</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={hoursPerWeek}
                  onChange={(event) => setHoursPerWeek(Number(event.target.value) || 0)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
            </>
          )}
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
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Pre-tax Deduction / Paycheck</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={preTaxDeduction}
              onChange={(event) => setPreTaxDeduction(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Federal Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={federalRate}
              onChange={(event) => setFederalRate(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">State Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={stateRate}
              onChange={(event) => setStateRate(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Local Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={localRate}
              onChange={(event) => setLocalRate(Number(event.target.value) || 0)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={applyFica}
              onChange={(event) => setApplyFica(event.target.checked)}
            />
            Include FICA (Social Security + Medicare, 7.65%)
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Take-home Pay</p>
          <p className="mt-2 text-3xl font-bold text-brand">{currency(result.netPay)}</p>
          <p className="mt-1 text-sm text-muted">Per paycheck ({result.periods} pay periods/year)</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Gross Pay</p>
          <p className="mt-2 text-xl font-semibold">{currency(result.grossPerPaycheck)} / paycheck</p>
          <p className="mt-1 text-sm text-muted">{currency(result.grossAnnual)} annual gross</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Taxes / Paycheck</p>
          <div className="mt-2 space-y-1 text-sm text-foreground">
            <p>Federal: {currency(result.federalTax)}</p>
            <p>State: {currency(result.stateTax)}</p>
            <p>Local: {currency(result.localTax)}</p>
            <p>FICA: {currency(result.ficaTax)}</p>
            <p className="font-semibold">Total: {currency(result.totalTaxes)}</p>
          </div>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Annual Net Estimate</p>
          <p className="mt-2 text-xl font-semibold">{currency(result.annualNet)}</p>
          <p className="mt-1 text-sm text-muted">Estimated annual taxes: {currency(result.annualTaxes)}</p>
        </article>
      </div>
    </section>
  );
}
