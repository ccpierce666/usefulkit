"use client";

import { useMemo, useState } from "react";

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function W2Vs1099CalculatorTool() {
  const [annualGross, setAnnualGross] = useState(120000);
  const [w2IncomeTaxRate, setW2IncomeTaxRate] = useState(24);
  const [w2EmployeeFicaRate, setW2EmployeeFicaRate] = useState(7.65);
  const [w2BenefitsValue, setW2BenefitsValue] = useState(9000);

  const [expenseRate, setExpenseRate] = useState(18);
  const [contractorIncomeTaxRate, setContractorIncomeTaxRate] = useState(24);
  const [selfEmploymentTaxRate, setSelfEmploymentTaxRate] = useState(15.3);

  const calc = useMemo(() => {
    const gross = Math.max(0, annualGross);

    const w2IncomeTax = gross * Math.max(0, w2IncomeTaxRate) / 100;
    const w2FicaTax = gross * Math.max(0, w2EmployeeFicaRate) / 100;
    const w2NetCash = gross - w2IncomeTax - w2FicaTax;
    const w2TotalValue = w2NetCash + Math.max(0, w2BenefitsValue);

    const businessExpenses = gross * Math.max(0, expenseRate) / 100;
    const contractorNetBusinessIncome = Math.max(0, gross - businessExpenses);

    const seTax = contractorNetBusinessIncome * Math.max(0, selfEmploymentTaxRate) / 100;
    const deductibleHalfSeTax = seTax * 0.5;
    const taxableAfterHalfSe = Math.max(0, contractorNetBusinessIncome - deductibleHalfSeTax);
    const contractorIncomeTax =
      taxableAfterHalfSe * Math.max(0, contractorIncomeTaxRate) / 100;

    const contractorNetCash =
      gross - businessExpenses - seTax - contractorIncomeTax;

    const valueGap = contractorNetCash - w2TotalValue;

    return {
      w2IncomeTax,
      w2FicaTax,
      w2NetCash,
      w2TotalValue,
      businessExpenses,
      contractorNetBusinessIncome,
      seTax,
      deductibleHalfSeTax,
      contractorIncomeTax,
      contractorNetCash,
      valueGap,
    };
  }, [
    annualGross,
    contractorIncomeTaxRate,
    expenseRate,
    selfEmploymentTaxRate,
    w2BenefitsValue,
    w2EmployeeFicaRate,
    w2IncomeTaxRate,
  ]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">1099 vs W-2 Take-Home Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Compare estimated annual value between a W-2 role and a 1099 contractor setup using tax,
          self-employment, expense, and benefits assumptions.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-3">
            <h3 className="text-sm font-semibold text-foreground">Shared Input</h3>
            <label className="mt-2 grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Annual Gross (USD)</span>
              <input
                type="number"
                min={0}
                value={annualGross}
                onChange={(event) => setAnnualGross(Number(event.target.value) || 0)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-line bg-white p-3">
            <h3 className="text-sm font-semibold text-foreground">W-2 Assumptions</h3>
            <div className="mt-2 grid gap-2">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Income Tax Rate %</span>
                <input
                  type="number"
                  min={0}
                  max={60}
                  step="0.1"
                  value={w2IncomeTaxRate}
                  onChange={(event) => setW2IncomeTaxRate(Number(event.target.value) || 0)}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Employee FICA %</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step="0.01"
                  value={w2EmployeeFicaRate}
                  onChange={(event) => setW2EmployeeFicaRate(Number(event.target.value) || 0)}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Benefits Value / Year</span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={w2BenefitsValue}
                  onChange={(event) => setW2BenefitsValue(Number(event.target.value) || 0)}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-3 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground">1099 Assumptions</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Business Expense %</span>
                <input
                  type="number"
                  min={0}
                  max={80}
                  step="0.1"
                  value={expenseRate}
                  onChange={(event) => setExpenseRate(Number(event.target.value) || 0)}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Income Tax Rate %</span>
                <input
                  type="number"
                  min={0}
                  max={60}
                  step="0.1"
                  value={contractorIncomeTaxRate}
                  onChange={(event) => setContractorIncomeTaxRate(Number(event.target.value) || 0)}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Self-Employment Tax %</span>
                <input
                  type="number"
                  min={0}
                  max={25}
                  step="0.1"
                  value={selfEmploymentTaxRate}
                  onChange={(event) => setSelfEmploymentTaxRate(Number(event.target.value) || 0)}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">W-2 Total Value (Est.)</p>
          <p className="mt-2 text-2xl font-bold text-brand">{money(calc.w2TotalValue)}</p>
          <p className="mt-1 text-xs text-muted">Includes benefits value</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">1099 Net Cash (Est.)</p>
          <p className="mt-2 text-2xl font-bold text-brand">{money(calc.contractorNetCash)}</p>
          <p className="mt-1 text-xs text-muted">After expenses, SE tax, and income tax</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">1099 - W-2 Difference</p>
          <p className={`mt-2 text-2xl font-bold ${calc.valueGap >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.valueGap)}
          </p>
        </article>
      </div>
    </section>
  );
}

