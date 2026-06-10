"use client";

import { useMemo, useState } from "react";

type RatePreset = "2025" | "custom";

const MILEAGE_PRESETS: Record<RatePreset, { business: number; medical: number; charity: number }> =
  {
    "2025": { business: 0.7, medical: 0.21, charity: 0.14 },
    custom: { business: 0.7, medical: 0.21, charity: 0.14 },
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

export function MileageDeductionCalculatorTool() {
  const [preset, setPreset] = useState<RatePreset>("2025");
  const [businessMiles, setBusinessMiles] = useState("8600");
  const [medicalMiles, setMedicalMiles] = useState("250");
  const [charityMiles, setCharityMiles] = useState("120");
  const [parkingTolls, setParkingTolls] = useState("480");
  const [businessRate, setBusinessRate] = useState("0.70");
  const [medicalRate, setMedicalRate] = useState("0.21");
  const [charityRate, setCharityRate] = useState("0.14");
  const [marginalTaxRate, setMarginalTaxRate] = useState("27");

  const result = useMemo(() => {
    const business = Math.max(0, parseNum(businessMiles)) * Math.max(0, parseNum(businessRate));
    const medical = Math.max(0, parseNum(medicalMiles)) * Math.max(0, parseNum(medicalRate));
    const charity = Math.max(0, parseNum(charityMiles)) * Math.max(0, parseNum(charityRate));
    const tolls = Math.max(0, parseNum(parkingTolls));
    const businessWithExtras = business + tolls;
    const totalValue = businessWithExtras + medical + charity;
    const estimatedBusinessTaxValue =
      businessWithExtras * (Math.max(0, parseNum(marginalTaxRate)) / 100);

    return {
      business,
      medical,
      charity,
      tolls,
      businessWithExtras,
      totalValue,
      estimatedBusinessTaxValue,
    };
  }, [
    businessMiles,
    businessRate,
    charityMiles,
    charityRate,
    marginalTaxRate,
    medicalMiles,
    medicalRate,
    parkingTolls,
  ]);

  function applyPreset(nextPreset: RatePreset) {
    setPreset(nextPreset);
    const rates = MILEAGE_PRESETS[nextPreset];
    setBusinessRate(rates.business.toFixed(2));
    setMedicalRate(rates.medical.toFixed(2));
    setCharityRate(rates.charity.toFixed(2));
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Mileage Deduction Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate business, medical, and charity mileage value with editable standard-mileage
          rates and parking/toll adjustments.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Rate Preset</span>
            <select
              value={preset}
              onChange={(event) => applyPreset(event.target.value as RatePreset)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="2025">2025 Standard Rate Defaults</option>
              <option value="custom">Custom Rates</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Business Miles</span>
            <input
              type="number"
              min={0}
              step="1"
              value={businessMiles}
              onChange={(event) => setBusinessMiles(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Medical Miles</span>
            <input
              type="number"
              min={0}
              step="1"
              value={medicalMiles}
              onChange={(event) => setMedicalMiles(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Charity Miles</span>
            <input
              type="number"
              min={0}
              step="1"
              value={charityMiles}
              onChange={(event) => setCharityMiles(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Parking + Tolls</span>
            <input
              type="number"
              min={0}
              step="1"
              value={parkingTolls}
              onChange={(event) => setParkingTolls(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Business Rate</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={businessRate}
              onChange={(event) => {
                setPreset("custom");
                setBusinessRate(event.target.value);
              }}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Medical Rate</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={medicalRate}
              onChange={(event) => {
                setPreset("custom");
                setMedicalRate(event.target.value);
              }}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Charity Rate</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={charityRate}
              onChange={(event) => {
                setPreset("custom");
                setCharityRate(event.target.value);
              }}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Marginal Tax Rate (%)</span>
            <input
              type="number"
              min={0}
              max={50}
              step="0.1"
              value={marginalTaxRate}
              onChange={(event) => setMarginalTaxRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Business Mileage Value
          </p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(result.businessWithExtras)}</p>
          <p className="mt-1 text-sm text-muted">
            Includes {money(result.tolls)} of parking and tolls
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Medical Mileage Value
          </p>
          <p className="mt-2 text-2xl font-bold">{money(result.medical)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Charity Mileage Value
          </p>
          <p className="mt-2 text-2xl font-bold">{money(result.charity)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Value</p>
          <p className="mt-2 text-3xl font-bold">{money(result.totalValue)}</p>
          <p className="mt-1 text-sm text-muted">Across all mileage categories entered</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Estimated Business Tax Impact
          </p>
          <p className="mt-2 text-2xl font-bold">{money(result.estimatedBusinessTaxValue)}</p>
          <p className="mt-1 text-sm text-muted">
            Simple estimate from business mileage times marginal rate
          </p>
        </article>
      </div>
    </section>
  );
}
