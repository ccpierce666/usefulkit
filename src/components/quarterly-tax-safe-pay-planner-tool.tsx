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

type PaymentRow = {
  label: string;
  dueDate: string;
  amount: number;
};

function getQuarterRows(year: number, quarterlyAmount: number): PaymentRow[] {
  return [
    { label: "Q1", dueDate: `${year}-04-15`, amount: quarterlyAmount },
    { label: "Q2", dueDate: `${year}-06-15`, amount: quarterlyAmount },
    { label: "Q3", dueDate: `${year}-09-15`, amount: quarterlyAmount },
    { label: "Q4", dueDate: `${year + 1}-01-15`, amount: quarterlyAmount },
  ];
}

export function QuarterlyTaxSafePayPlannerTool() {
  const [income, setIncome] = useState("120000");
  const [deductions, setDeductions] = useState("15000");
  const [withholding, setWithholding] = useState("8000");
  const [effectiveTaxRate, setEffectiveTaxRate] = useState("18");
  const [selfEmployment, setSelfEmployment] = useState(true);

  const result = useMemo(() => {
    const gross = Math.max(0, parseNum(income));
    const deduct = Math.max(0, parseNum(deductions));
    const withheld = Math.max(0, parseNum(withholding));
    const taxableIncome = Math.max(0, gross - deduct);
    const federalTax = taxableIncome * (Math.max(0, parseNum(effectiveTaxRate)) / 100);
    const seTax = selfEmployment ? taxableIncome * 0.1413 : 0;
    const annualTarget = Math.max(0, federalTax + seTax - withheld);
    const quarterly = annualTarget / 4;

    const now = new Date();
    const currentYear = now.getFullYear();
    const schedule = getQuarterRows(currentYear, quarterly);
    const nextDue = schedule.find((row) => new Date(`${row.dueDate}T23:59:59`) >= now);

    return {
      taxableIncome,
      federalTax,
      seTax,
      annualTarget,
      quarterly,
      schedule,
      nextDue,
    };
  }, [deductions, effectiveTaxRate, income, selfEmployment, withholding]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Quarterly Tax Safe-Pay Planner</h2>
        <p className="mt-2 text-sm text-muted">
          Plan quarterly estimated payments for freelance and side-income taxes with safe buffer targets.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Expected Annual Income (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Estimated Deductions (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={deductions}
              onChange={(event) => setDeductions(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Tax Already Withheld (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={withholding}
              onChange={(event) => setWithholding(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Effective Federal Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              max={45}
              step="0.1"
              value={effectiveTaxRate}
              onChange={(event) => setEffectiveTaxRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={selfEmployment}
              onChange={(event) => setSelfEmployment(event.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            Include self-employment tax estimate
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Taxable Income</p>
          <p className="mt-2 text-3xl font-bold">{money(result.taxableIncome)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Annual Tax Target</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(result.annualTarget)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suggested Quarterly Pay</p>
          <p className="mt-2 text-3xl font-bold">{money(result.quarterly)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Next Due Date</p>
          <p className="mt-2 text-2xl font-bold">
            {result.nextDue ? `${result.nextDue.label} - ${result.nextDue.dueDate}` : "Current year complete"}
          </p>
        </article>
      </div>

      <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold sm:text-xl">Quarterly Payment Plan</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-2 py-2">Quarter</th>
                <th className="px-2 py-2">Due Date</th>
                <th className="px-2 py-2">Suggested Payment</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((item) => (
                <tr key={item.label} className="border-b border-line/70">
                  <td className="px-2 py-2 font-semibold">{item.label}</td>
                  <td className="px-2 py-2">{item.dueDate}</td>
                  <td className="px-2 py-2">{money(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          This planner is an estimate, not tax advice. Use IRS safe-harbor rules and your CPA guidance for final amounts.
        </p>
      </div>
    </section>
  );
}

