"use client";

import Link from "next/link";
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

function toHourMinute(totalHours: number): string {
  const minutes = Math.max(0, Math.round(totalHours * 60));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function EvChargeTimeEstimatorTool() {
  const [batteryKwh, setBatteryKwh] = useState("75");
  const [startSoc, setStartSoc] = useState("18");
  const [targetSoc, setTargetSoc] = useState("80");
  const [chargerPowerKw, setChargerPowerKw] = useState("7.2");
  const [lossPct, setLossPct] = useState("10");
  const [electricityRate, setElectricityRate] = useState("0.17");

  const calc = useMemo(() => {
    const battery = Math.max(1, parseNum(batteryKwh));
    const start = Math.min(100, Math.max(0, parseNum(startSoc))) / 100;
    const target = Math.min(100, Math.max(0, parseNum(targetSoc))) / 100;
    const chargerKw = Math.max(0.3, parseNum(chargerPowerKw));
    const loss = Math.min(35, Math.max(0, parseNum(lossPct))) / 100;
    const rate = Math.max(0, parseNum(electricityRate));

    const socDelta = Math.max(0, target - start);
    const batteryEnergyAdded = battery * socDelta;
    const wallEnergy = loss >= 0.99 ? batteryEnergyAdded : batteryEnergyAdded / (1 - loss);
    const chargeHours = wallEnergy / chargerKw;
    const chargeCost = wallEnergy * rate;

    return {
      batteryEnergyAdded,
      wallEnergy,
      chargeHours,
      chargeCost,
      effectiveSpeedPctPerHour: battery > 0 ? (chargerKw / battery) * 100 * (1 - loss) : 0,
    };
  }, [batteryKwh, chargerPowerKw, electricityRate, lossPct, startSoc, targetSoc]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">EV Charge Time Estimator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate charging duration and cost from start SoC to target SoC for home or public charging.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/tools/ev-charging-cost-calculator"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            EV Charging Cost Calculator
          </Link>
          <Link
            href="/tools/ev-home-charger-payback-calculator"
            className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Home Charger Payback
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
            <span className="text-sm font-semibold text-foreground">Start SoC (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={startSoc}
              onChange={(event) => setStartSoc(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Target SoC (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={targetSoc}
              onChange={(event) => setTargetSoc(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Charger Power (kW)</span>
            <input
              type="number"
              min={0.3}
              step="0.1"
              value={chargerPowerKw}
              onChange={(event) => setChargerPowerKw(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
            <p className="text-xs text-muted">Examples: Level 1 = 1.4, Level 2 = 7.2, DC fast = 120+</p>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Charging Loss (%)</span>
            <input
              type="number"
              min={0}
              max={35}
              step="1"
              value={lossPct}
              onChange={(event) => setLossPct(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Electricity Rate ($/kWh)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={electricityRate}
              onChange={(event) => setElectricityRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Charge Time</p>
          <p className="mt-2 text-2xl font-bold text-brand">{toHourMinute(calc.chargeHours)}</p>
          <p className="mt-1 text-sm text-muted">{calc.chargeHours.toFixed(2)} hours</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Battery Energy Added</p>
          <p className="mt-2 text-2xl font-bold">{calc.batteryEnergyAdded.toFixed(1)} kWh</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Wall Energy Needed</p>
          <p className="mt-2 text-2xl font-bold">{calc.wallEnergy.toFixed(1)} kWh</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Charge Cost</p>
          <p className="mt-2 text-2xl font-bold">{money(calc.chargeCost)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Effective Speed</p>
          <p className="mt-2 text-2xl font-bold">{calc.effectiveSpeedPctPerHour.toFixed(1)}% battery/hour</p>
        </article>
      </div>
    </section>
  );
}
