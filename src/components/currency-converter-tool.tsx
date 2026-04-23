"use client";

import { useEffect, useMemo, useState } from "react";

type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "CNY";

const RATES_FROM_USD_FALLBACK: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.51,
  JPY: 151.5,
  CNY: 7.23,
};

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function CurrencyConverterTool() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState<Currency>("USD");
  const [to, setTo] = useState<Currency>("EUR");
  const [rates, setRates] = useState<Record<Currency, number>>(RATES_FROM_USD_FALLBACK);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const refreshRates = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const symbols = ["EUR", "GBP", "CAD", "AUD", "JPY", "CNY"].join(",");
      const res = await fetch(
        `https://api.frankfurter.app/latest?from=USD&to=${symbols}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        throw new Error("Unable to fetch exchange rates.");
      }
      const data = (await res.json()) as {
        date?: string;
        rates?: Partial<Record<Exclude<Currency, "USD">, number>>;
      };
      if (!data.rates) {
        throw new Error("Invalid exchange rate response.");
      }

      setRates({
        USD: 1,
        EUR: data.rates.EUR ?? RATES_FROM_USD_FALLBACK.EUR,
        GBP: data.rates.GBP ?? RATES_FROM_USD_FALLBACK.GBP,
        CAD: data.rates.CAD ?? RATES_FROM_USD_FALLBACK.CAD,
        AUD: data.rates.AUD ?? RATES_FROM_USD_FALLBACK.AUD,
        JPY: data.rates.JPY ?? RATES_FROM_USD_FALLBACK.JPY,
        CNY: data.rates.CNY ?? RATES_FROM_USD_FALLBACK.CNY,
      });
      setLastUpdated(data.date ?? "");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load rates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshRates();
  }, []);

  const converted = useMemo(() => {
    const input = parseNum(amount);
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    const inUsd = fromRate > 0 ? input / fromRate : 0;
    return inUsd * toRate;
  }, [amount, from, rates, to]);

  const pairRate = useMemo(() => {
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return fromRate > 0 ? toRate / fromRate : 0;
  }, [from, rates, to]);

  const updateRate = (currency: Currency, value: string) => {
    setRates((prev) => ({
      ...prev,
      [currency]: Math.max(0.000001, parseNum(value)),
    }));
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Currency Converter</h2>
        <p className="mt-2 text-sm text-muted">
          Convert between common currencies. Rates are client-fetched from Frankfurter and use USD
          as base.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 sm:col-span-1">
            <span className="text-sm font-semibold text-foreground">Amount</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1 sm:col-span-1">
            <span className="text-sm font-semibold text-foreground">From</span>
            <select
              value={from}
              onChange={(event) => setFrom(event.target.value as Currency)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {Object.keys(rates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 sm:col-span-1">
            <span className="text-sm font-semibold text-foreground">To</span>
            <select
              value={to}
              onChange={(event) => setTo(event.target.value as Currency)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {Object.keys(rates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-white p-3 text-sm">
          <p className="font-semibold text-foreground">
            {fmt(parseNum(amount))} {from} = {fmt(converted)} {to}
          </p>
          <p className="mt-1 text-muted">
            1 {from} = {fmt(pairRate)} {to}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <button
              type="button"
              onClick={() => void refreshRates()}
              disabled={isLoading}
              className="rounded-md border border-line px-2 py-1 font-semibold transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Refreshing..." : "Refresh Rates"}
            </button>
            {lastUpdated ? <span>Last updated: {lastUpdated}</span> : null}
          </div>
          {loadError ? <p className="mt-2 text-xs font-semibold text-red-600">{loadError}</p> : null}
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Editable USD Base Rates</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(Object.keys(rates) as Currency[]).map((currency) => (
              <label key={currency} className="grid gap-1">
                <span className="text-xs font-semibold text-foreground">{currency} to USD</span>
                <input
                  type="number"
                  min={0.000001}
                  step="0.000001"
                  value={rates[currency]}
                  onChange={(event) => updateRate(currency, event.target.value)}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Quick Note</p>
          <p className="mt-2 text-sm text-foreground">
            For production finance use-cases, connect a live FX rate API and timestamp updates.
          </p>
        </article>
      </div>
    </section>
  );
}
