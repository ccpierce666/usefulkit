"use client";

import { useMemo, useState } from "react";

type RepaymentMode = "amortized" | "equal-principal";
const TERM_MONTH_OPTIONS = [12, 24, 36, 48, 60, 84, 120, 180, 240, 300, 360, 480];

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

export function LoanPaymentCalculatorTool() {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [annualRate, setAnnualRate] = useState("6.5");
  const [termMonths, setTermMonths] = useState("360");
  const [mode, setMode] = useState<RepaymentMode>("amortized");

  const calc = useMemo(() => {
    const principal = Math.max(0, parseNum(loanAmount));
    const rate = Math.max(0, parseNum(annualRate)) / 100 / 12;
    const months = Math.max(1, Math.round(parseNum(termMonths)));
    const principalPerMonth = principal / months;

    let amortizedMonthlyPayment = 0;
    if (rate === 0) {
      amortizedMonthlyPayment = principal / months;
    } else {
      const factor = (1 + rate) ** months;
      amortizedMonthlyPayment = (principal * rate * factor) / (factor - 1);
    }

    const amortizedTotalPayment = amortizedMonthlyPayment * months;
    const amortizedTotalInterest = amortizedTotalPayment - principal;
    const amortizedFirstMonthInterest = principal * rate;
    const amortizedFirstMonthPrincipal = amortizedMonthlyPayment - amortizedFirstMonthInterest;
    const amortizedLastMonthPayment = amortizedMonthlyPayment;

    const equalPrincipalFirstMonthInterest = principal * rate;
    const equalPrincipalFirstMonthPayment = principalPerMonth + equalPrincipalFirstMonthInterest;
    const equalPrincipalLastMonthInterest = principalPerMonth * rate;
    const equalPrincipalLastMonthPayment = principalPerMonth + equalPrincipalLastMonthInterest;
    const equalPrincipalTotalInterest = rate === 0 ? 0 : (principal * rate * (months + 1)) / 2;
    const equalPrincipalTotalPayment = principal + equalPrincipalTotalInterest;

    const isAmortized = mode === "amortized";

    return {
      principal,
      months,
      monthlyPayment: isAmortized ? amortizedMonthlyPayment : equalPrincipalFirstMonthPayment,
      lastMonthPayment: isAmortized ? amortizedLastMonthPayment : equalPrincipalLastMonthPayment,
      totalPayment: isAmortized ? amortizedTotalPayment : equalPrincipalTotalPayment,
      totalInterest: isAmortized ? amortizedTotalInterest : equalPrincipalTotalInterest,
      firstMonthInterest: isAmortized
        ? amortizedFirstMonthInterest
        : equalPrincipalFirstMonthInterest,
      firstMonthPrincipal: isAmortized
        ? amortizedFirstMonthPrincipal
        : principalPerMonth,
      amortizedTotalInterest,
      equalPrincipalTotalInterest,
    };
  }, [annualRate, loanAmount, mode, termMonths]);

  const interestGap = Math.max(0, calc.amortizedTotalInterest - calc.equalPrincipalTotalInterest);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Loan Payment Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate monthly payments for loans such as mortgage, auto loan, or personal loan.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("amortized")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "amortized"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Equal Monthly (Amortized)
          </button>
          <button
            type="button"
            onClick={() => setMode("equal-principal")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "equal-principal"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Equal Principal
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Loan Amount (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={loanAmount}
              onChange={(event) => setLoanAmount(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Annual Interest Rate (%)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={annualRate}
              onChange={(event) => setAnnualRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Loan Term (Months)</span>
            <select
              value={termMonths}
              onChange={(event) => setTermMonths(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {TERM_MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month} months ({(month / 12).toFixed(month % 12 === 0 ? 0 : 1)} years)
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Month 1 Payment</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.monthlyPayment)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Last Month Payment</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.lastMonthPayment)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Repayment</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.totalPayment)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Interest</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.totalInterest)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Term Length</p>
          <p className="mt-2 text-3xl font-bold">{calc.months.toLocaleString()} months</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Month 1 Principal</p>
          <p className="mt-2 text-2xl font-bold">{money(Math.max(0, calc.firstMonthPrincipal))}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Month 1 Interest</p>
          <p className="mt-2 text-2xl font-bold">{money(Math.max(0, calc.firstMonthInterest))}</p>
        </article>
        {mode === "equal-principal" ? (
          <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Interest Saved vs Amortized
            </p>
            <p className="mt-2 text-2xl font-bold">{money(interestGap)}</p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
