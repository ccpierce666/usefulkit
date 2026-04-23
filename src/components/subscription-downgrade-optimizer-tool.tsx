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

export function SubscriptionDowngradeOptimizerTool() {
  const [streaming, setStreaming] = useState("65");
  const [software, setSoftware] = useState("30");
  const [cloud, setCloud] = useState("12");
  const [fitness, setFitness] = useState("28");
  const [news, setNews] = useState("15");

  const [adTier, setAdTier] = useState(true);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [bundleDeals, setBundleDeals] = useState(true);
  const [familyPlan, setFamilyPlan] = useState(false);

  const result = useMemo(() => {
    const currentMonthly =
      Math.max(0, parseNum(streaming)) +
      Math.max(0, parseNum(software)) +
      Math.max(0, parseNum(cloud)) +
      Math.max(0, parseNum(fitness)) +
      Math.max(0, parseNum(news));

    const streamingSave = adTier ? Math.max(0, parseNum(streaming)) * 0.25 : 0;
    const annualSave =
      annualBilling
        ? (Math.max(0, parseNum(software)) + Math.max(0, parseNum(cloud)) + Math.max(0, parseNum(news))) * 0.16
        : 0;
    const bundleSave = bundleDeals ? Math.max(0, parseNum(streaming)) * 0.12 : 0;
    const familySave = familyPlan ? Math.max(0, parseNum(streaming)) * 0.2 : 0;

    const totalMonthlySave = Math.min(
      currentMonthly,
      streamingSave + annualSave + bundleSave + familySave,
    );
    const optimizedMonthly = Math.max(0, currentMonthly - totalMonthlySave);

    return {
      currentMonthly,
      optimizedMonthly,
      monthlySave: totalMonthlySave,
      annualSave: totalMonthlySave * 12,
      savings: [
        { label: "Switch to Ad Tiers", amount: streamingSave, enabled: adTier },
        { label: "Move to Annual Billing", amount: annualSave, enabled: annualBilling },
        { label: "Use Bundle Deals", amount: bundleSave, enabled: bundleDeals },
        { label: "Family Plan Sharing", amount: familySave, enabled: familyPlan },
      ],
    };
  }, [adTier, annualBilling, bundleDeals, cloud, familyPlan, fitness, news, software, streaming]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Subscription Downgrade Optimizer</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate how much you can save by switching to lower-cost plans without cancelling everything.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Streaming ($/mo)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={streaming}
              onChange={(event) => setStreaming(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Software ($/mo)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={software}
              onChange={(event) => setSoftware(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Cloud Storage ($/mo)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={cloud}
              onChange={(event) => setCloud(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Fitness ($/mo)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={fitness}
              onChange={(event) => setFitness(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">News & Other ($/mo)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={news}
              onChange={(event) => setNews(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-2">
          {[
            { label: "Switch some streaming plans to ad tier", checked: adTier, onChange: setAdTier },
            { label: "Use annual billing where possible", checked: annualBilling, onChange: setAnnualBilling },
            { label: "Apply available bundle discounts", checked: bundleDeals, onChange: setBundleDeals },
            { label: "Use shareable family plans", checked: familyPlan, onChange: setFamilyPlan },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(event) => item.onChange(event.target.checked)}
                className="h-4 w-4 rounded border-line"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Current Monthly Cost</p>
          <p className="mt-2 text-3xl font-bold">{money(result.currentMonthly)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Optimized Monthly Cost</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(result.optimizedMonthly)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly Savings</p>
          <p className="mt-2 text-3xl font-bold">{money(result.monthlySave)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Annual Savings</p>
          <p className="mt-2 text-3xl font-bold">{money(result.annualSave)}</p>
        </article>
      </div>

      <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold sm:text-xl">Savings Breakdown</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {result.savings.map((item) => (
            <div key={item.label} className="rounded-xl border border-line bg-white p-3 text-sm">
              <p className="font-semibold">{item.label}</p>
              <p className="mt-1 text-muted">{item.enabled ? money(item.amount) : "$0.00"}/mo potential</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

