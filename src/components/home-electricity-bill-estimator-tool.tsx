"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { US_STATE_ELECTRICITY_RATES } from "@/lib/us-state-electricity-rates";

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

function cents(rate: number): string {
  return `${(rate * 100).toFixed(1)} c/kWh`;
}

export function HomeElectricityBillEstimatorTool() {
  const [stateCode, setStateCode] = useState("CA");
  const [monthlyKwh, setMonthlyKwh] = useState("900");
  const [fixedFee, setFixedFee] = useState("18");
  const [otherFees, setOtherFees] = useState("6");
  const [offPeakShare, setOffPeakShare] = useState("35");
  const [offPeakDiscount, setOffPeakDiscount] = useState("12");
  const [manualRate, setManualRate] = useState("");

  const baseRate =
    US_STATE_ELECTRICITY_RATES.find((item) => item.code === stateCode)?.rate ?? 0.16;
  const usingRate = manualRate.trim() ? Math.max(0, parseNum(manualRate)) : baseRate;
  const nationalAverage =
    US_STATE_ELECTRICITY_RATES.reduce((sum, item) => sum + item.rate, 0) /
    US_STATE_ELECTRICITY_RATES.length;

  const result = useMemo(() => {
    const usage = Math.max(0, parseNum(monthlyKwh));
    const fixed = Math.max(0, parseNum(fixedFee));
    const extras = Math.max(0, parseNum(otherFees));
    const offPeakPct = Math.min(100, Math.max(0, parseNum(offPeakShare))) / 100;
    const discountPct = Math.min(90, Math.max(0, parseNum(offPeakDiscount))) / 100;
    const effectiveRate = usingRate * (1 - offPeakPct * discountPct);
    const energyCost = usage * effectiveRate;
    const totalBill = energyCost + fixed + extras;
    const annualBill = totalBill * 12;

    return {
      effectiveRate,
      energyCost,
      totalBill,
      annualBill,
      costPerDay: totalBill / 30.4,
    };
  }, [fixedFee, monthlyKwh, offPeakDiscount, offPeakShare, otherFees, usingRate]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Home Electricity Bill Estimator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate a monthly home power bill from state-average electricity rates, monthly kWh,
          fixed charges, and off-peak usage assumptions.
        </p>

        <div className="mt-3">
          <Link
            href="/electricity-rates"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            View U.S. State Electricity Rates
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">State</span>
            <select
              value={stateCode}
              onChange={(event) => setStateCode(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {US_STATE_ELECTRICITY_RATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">State Average Rate</span>
            <input
              type="text"
              value={`${baseRate.toFixed(3)} $/kWh`}
              readOnly
              className="h-10 rounded-lg border border-line bg-slate-50 px-2 text-sm font-semibold text-foreground outline-none"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Monthly Usage (kWh)</span>
            <input
              type="number"
              min={0}
              step="10"
              value={monthlyKwh}
              onChange={(event) => setMonthlyKwh(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Manual Rate Override</span>
            <input
              type="number"
              min={0}
              step="0.001"
              value={manualRate}
              onChange={(event) => setManualRate(event.target.value)}
              placeholder="Optional custom $/kWh"
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Fixed Service Fee</span>
            <input
              type="number"
              min={0}
              step="1"
              value={fixedFee}
              onChange={(event) => setFixedFee(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Other Monthly Fees</span>
            <input
              type="number"
              min={0}
              step="1"
              value={otherFees}
              onChange={(event) => setOtherFees(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Off-Peak Share (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={offPeakShare}
              onChange={(event) => setOffPeakShare(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Off-Peak Discount (%)</span>
            <input
              type="number"
              min={0}
              max={90}
              step="1"
              value={offPeakDiscount}
              onChange={(event) => setOffPeakDiscount(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Effective Rate</p>
          <p className="mt-2 text-3xl font-bold">{cents(result.effectiveRate)}</p>
          <p className="mt-1 text-sm text-muted">After off-peak usage adjustment</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Estimated Monthly Bill
          </p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(result.totalBill)}</p>
          <p className="mt-1 text-sm text-muted">
            Energy plus fixed and other monthly charges
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Estimated Annual Bill
          </p>
          <p className="mt-2 text-2xl font-bold">{money(result.annualBill)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Energy Charge</p>
          <p className="mt-2 text-2xl font-bold">{money(result.energyCost)}</p>
          <p className="mt-1 text-sm text-muted">Usage charge before fixed fees</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            State vs National Average
          </p>
          <p className="mt-2 text-2xl font-bold">
            {cents(usingRate)} vs {cents(nationalAverage)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Quick way to judge whether your state is relatively high-cost
          </p>
        </article>
      </div>
    </section>
  );
}
