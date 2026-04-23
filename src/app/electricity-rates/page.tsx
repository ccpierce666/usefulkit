import type { Metadata } from "next";
import Link from "next/link";
import { US_STATE_ELECTRICITY_RATES } from "@/lib/us-state-electricity-rates";

export const metadata: Metadata = {
  title: "U.S. Electricity Rates by State",
  description:
    "Browse average residential electricity rates by U.S. state in $/kWh and cents per kWh.",
  keywords: [
    "us electricity rates by state",
    "state electricity prices",
    "residential kwh rates",
    "electricity cost by state",
    "ev charging electricity rates",
  ],
  alternates: {
    canonical: "https://usefulkit.io/electricity-rates",
  },
  openGraph: {
    title: "U.S. Electricity Rates by State | UsefulKit",
    description:
      "Browse average residential electricity rates by U.S. state in $/kWh and cents per kWh.",
    url: "https://usefulkit.io/electricity-rates",
    siteName: "UsefulKit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "U.S. Electricity Rates by State | UsefulKit",
    description:
      "Browse average residential electricity rates by U.S. state in $/kWh and cents per kWh.",
  },
};

function toCents(rate: number): string {
  return (rate * 100).toFixed(1);
}

export default function ElectricityRatesPage() {
  const rows = [...US_STATE_ELECTRICITY_RATES].sort((a, b) => b.rate - a.rate);
  const avg = rows.reduce((sum, row) => sum + row.rate, 0) / rows.length;
  const highest = rows[0];
  const lowest = rows[rows.length - 1];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Energy Data</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          U.S. Electricity Rates by State
        </h1>
        <p className="mt-3 max-w-3xl text-base text-muted sm:text-lg">
          Residential average electricity rates shown in both dollars and cents per kWh. Use this
          table as a quick reference for EV charging and home energy calculations.
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">U.S. Average</p>
          <p className="mt-2 text-3xl font-bold">{avg.toFixed(3)} $/kWh</p>
          <p className="mt-1 text-sm text-muted">{toCents(avg)} c/kWh</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Highest</p>
          <p className="mt-2 text-2xl font-bold">{highest.name}</p>
          <p className="mt-1 text-sm text-muted">
            {highest.rate.toFixed(3)} $/kWh ({toCents(highest.rate)} c/kWh)
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lowest</p>
          <p className="mt-2 text-2xl font-bold">{lowest.name}</p>
          <p className="mt-1 text-sm text-muted">
            {lowest.rate.toFixed(3)} $/kWh ({toCents(lowest.rate)} c/kWh)
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold">State Table</h2>
          <Link
            href="/tools/ev-charging-cost-calculator"
            className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Open EV Cost Calculator
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-2 py-2">State</th>
                <th className="px-2 py-2">Code</th>
                <th className="px-2 py-2">$/kWh</th>
                <th className="px-2 py-2">c/kWh</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code} className="border-b border-line/70">
                  <td className="px-2 py-2 font-semibold">{row.name}</td>
                  <td className="px-2 py-2">{row.code}</td>
                  <td className="px-2 py-2">{row.rate.toFixed(3)}</td>
                  <td className="px-2 py-2">{toCents(row.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Source basis: state-level residential averages used for the calculator fallback defaults.
          You can refresh from EIA monthly data inside the EV calculator.
        </p>
      </section>
    </main>
  );
}
