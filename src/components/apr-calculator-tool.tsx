"use client";

import { useMemo, useState } from "react";

type Mode = "payment-from-apr" | "apr-from-payment";

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

function calcMonthlyPayment(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const factor = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * factor) / (factor - 1);
}

function solveAprFromPayment(principal: number, payment: number, months: number): number {
  if (principal <= 0 || payment <= 0 || months <= 0) return 0;
  const minPayment = principal / months;
  if (payment <= minPayment) return 0;

  let low = 0;
  let high = 1; // monthly rate upper bound 100%
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const p = calcMonthlyPayment(principal, mid, months);
    if (p > payment) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return ((low + high) / 2) * 12 * 100;
}

export function AprCalculatorTool() {
  const [mode, setMode] = useState<Mode>("payment-from-apr");
  const [loanAmount, setLoanAmount] = useState("300000");
  const [termMonths, setTermMonths] = useState("360");
  const [apr, setApr] = useState("6.5");
  const [monthlyPayment, setMonthlyPayment] = useState("1896.20");

  const result = useMemo(() => {
    const principal = Math.max(0, parseNum(loanAmount));
    const months = Math.max(1, Math.round(parseNum(termMonths)));

    if (mode === "payment-from-apr") {
      const aprNum = Math.max(0, parseNum(apr));
      const monthlyRate = aprNum / 100 / 12;
      const payment = calcMonthlyPayment(principal, monthlyRate, months);
      const totalPayment = payment * months;
      const totalInterest = totalPayment - principal;
      return {
        payment,
        apr: aprNum,
        totalPayment,
        totalInterest,
      };
    }

    const payment = Math.max(0, parseNum(monthlyPayment));
    const solvedApr = solveAprFromPayment(principal, payment, months);
    const totalPayment = payment * months;
    const totalInterest = totalPayment - principal;
    return {
      payment,
      apr: solvedApr,
      totalPayment,
      totalInterest,
    };
  }, [apr, loanAmount, mode, monthlyPayment, termMonths]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">APR Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Calculate monthly payment from APR, or reverse-calculate APR from monthly payment.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("payment-from-apr")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "payment-from-apr"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            APR to Payment
          </button>
          <button
            type="button"
            onClick={() => setMode("apr-from-payment")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "apr-from-payment"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Payment to APR
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
            <span className="text-sm font-semibold text-foreground">Loan Term (Months)</span>
            <input
              type="number"
              min={1}
              step="1"
              value={termMonths}
              onChange={(event) => setTermMonths(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>

          {mode === "payment-from-apr" ? (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">APR (%)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={apr}
                onChange={(event) => setApr(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          ) : (
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-foreground">Monthly Payment (USD)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={monthlyPayment}
                onChange={(event) => setMonthlyPayment(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated APR</p>
          <p className="mt-2 text-3xl font-bold text-brand">{result.apr.toFixed(3)}%</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly Payment</p>
          <p className="mt-2 text-3xl font-bold">{money(result.payment)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Repayment</p>
          <p className="mt-2 text-3xl font-bold">{money(result.totalPayment)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Interest</p>
          <p className="mt-2 text-3xl font-bold">{money(result.totalInterest)}</p>
        </article>
      </div>
    </section>
  );
}

