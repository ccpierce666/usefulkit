"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ClimateMode = "mild" | "normal" | "hot";

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

export function EvBatteryDegradationEstimatorTool() {
  const [originalRange, setOriginalRange] = useState("300");
  const [batteryKwh, setBatteryKwh] = useState("75");
  const [yearsOwned, setYearsOwned] = useState("6");
  const [annualMiles, setAnnualMiles] = useState("12000");
  const [baseAnnualDeg, setBaseAnnualDeg] = useState("2.0");
  const [fastChargeShare, setFastChargeShare] = useState("25");
  const [climate, setClimate] = useState<ClimateMode>("normal");
  const [replacementCost, setReplacementCost] = useState("13000");

  const calc = useMemo(() => {
    const range0 = Math.max(10, parseNum(originalRange));
    const battery = Math.max(10, parseNum(batteryKwh));
    const years = Math.max(0, parseNum(yearsOwned));
    const milesPerYear = Math.max(0, parseNum(annualMiles));
    const baseDeg = Math.min(12, Math.max(0.5, parseNum(baseAnnualDeg))) / 100;
    const dcShare = Math.min(100, Math.max(0, parseNum(fastChargeShare))) / 100;
    const replaceCost = Math.max(0, parseNum(replacementCost));

    const climateExtra =
      climate === "mild" ? 0 : climate === "normal" ? 0.004 : 0.010;
    const fastChargeExtra = dcShare * 0.012;
    const mileageExtra = Math.min(0.01, (milesPerYear / 10000) * 0.0018);
    const effectiveAnnualDeg = Math.min(0.2, baseDeg + climateExtra + fastChargeExtra + mileageExtra);

    const healthAfterYears = Math.max(0.55, Math.pow(1 - effectiveAnnualDeg, years));
    const lostPct = 1 - healthAfterYears;
    const estimatedRange = range0 * healthAfterYears;
    const usableBattery = battery * healthAfterYears;
    const replacementReserve = replaceCost * lostPct;

    return {
      effectiveAnnualDeg,
      healthAfterYears,
      estimatedRange,
      usableBattery,
      lostPct,
      replacementReserve,
    };
  }, [annualMiles, baseAnnualDeg, batteryKwh, climate, fastChargeShare, originalRange, replacementCost, yearsOwned]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">EV Battery Degradation Estimator</h2>
        <p className="mt-2 text-sm text-muted">
          Forecast battery health, expected range, and replacement-reserve planning based on usage profile and climate.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/tools/ev-charge-time-estimator"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            EV Charge Time Estimator
          </Link>
          <Link
            href="/tools/ev-trip-charging-cost-planner"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            EV Trip Planner
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Original EPA Range (miles)</span>
            <input
              type="number"
              min={50}
              step="5"
              value={originalRange}
              onChange={(event) => setOriginalRange(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Battery Capacity (kWh)</span>
            <input
              type="number"
              min={10}
              step="0.1"
              value={batteryKwh}
              onChange={(event) => setBatteryKwh(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Years of Ownership</span>
            <input
              type="number"
              min={0}
              step="1"
              value={yearsOwned}
              onChange={(event) => setYearsOwned(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Annual Mileage</span>
            <input
              type="number"
              min={0}
              step="500"
              value={annualMiles}
              onChange={(event) => setAnnualMiles(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Base Degradation (%/year)</span>
            <input
              type="number"
              min={0.5}
              max={12}
              step="0.1"
              value={baseAnnualDeg}
              onChange={(event) => setBaseAnnualDeg(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">DC Fast Charging Share (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={fastChargeShare}
              onChange={(event) => setFastChargeShare(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Climate Profile</span>
            <select
              value={climate}
              onChange={(event) => setClimate(event.target.value as ClimateMode)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="mild">Mild (garage + moderate weather)</option>
              <option value="normal">Normal mixed climate</option>
              <option value="hot">Hot climate / frequent high-heat parking</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Battery Replacement Cost ($)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={replacementCost}
              onChange={(event) => setReplacementCost(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Battery Health After Period</p>
          <p className="mt-2 text-2xl font-bold text-brand">{(calc.healthAfterYears * 100).toFixed(1)}%</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Real-World Range</p>
          <p className="mt-2 text-2xl font-bold">{Math.round(calc.estimatedRange)} miles</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Usable Battery Capacity</p>
          <p className="mt-2 text-2xl font-bold">{calc.usableBattery.toFixed(1)} kWh</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Annual Degradation</p>
          <p className="mt-2 text-2xl font-bold">{(calc.effectiveAnnualDeg * 100).toFixed(2)}%</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Capacity Loss</p>
          <p className="mt-2 text-2xl font-bold">{(calc.lostPct * 100).toFixed(1)}%</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Replacement Reserve Target</p>
          <p className="mt-2 text-2xl font-bold">{money(calc.replacementReserve)}</p>
          <p className="mt-1 text-xs text-muted">Planning metric only, not a repair quote.</p>
        </article>
      </div>
    </section>
  );
}
