"use client";

import { useSearchParams } from "next/navigation";
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

export function EvTripChargingCostPlannerTool() {
  const searchParams = useSearchParams();
  const [tripMiles, setTripMiles] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [batteryKwh, setBatteryKwh] = useState("");
  const [startSoc, setStartSoc] = useState("90");
  const [arrivalSoc, setArrivalSoc] = useState("12");
  const [chargeToSoc, setChargeToSoc] = useState("80");
  const [dcRate, setDcRate] = useState("0.44");
  const [homeRate, setHomeRate] = useState("0.16");
  const [avgDcSpeedKw, setAvgDcSpeedKw] = useState("90");
  const [overheadPerStopMin, setOverheadPerStopMin] = useState("8");
  const [gasPrice, setGasPrice] = useState("");
  const [gasMpg, setGasMpg] = useState("");

  const tripMilesValue = tripMiles || searchParams.get("tripMiles") || "850";
  const efficiencyValue = efficiency || searchParams.get("efficiency") || "3.3";
  const batteryKwhValue = batteryKwh || searchParams.get("batteryKwh") || "75";
  const gasPriceValue = gasPrice || searchParams.get("gasPrice") || "3.70";
  const gasMpgValue = gasMpg || searchParams.get("gasMpg") || "30";

  const calc = useMemo(() => {
    const miles = Math.max(0, parseNum(tripMilesValue));
    const miPerKwh = Math.max(0.1, parseNum(efficiencyValue));
    const battery = Math.max(1, parseNum(batteryKwhValue));
    const start = Math.min(100, Math.max(0, parseNum(startSoc))) / 100;
    const reserve = Math.min(100, Math.max(0, parseNum(arrivalSoc))) / 100;
    const chargeTo = Math.min(100, Math.max(0, parseNum(chargeToSoc))) / 100;
    const dcPrice = Math.max(0, parseNum(dcRate));
    const homePrice = Math.max(0, parseNum(homeRate));
    const dcSpeed = Math.max(10, parseNum(avgDcSpeedKw));
    const overhead = Math.max(0, parseNum(overheadPerStopMin));
    const mpg = Math.max(1, parseNum(gasMpgValue));
    const gas = Math.max(0, parseNum(gasPriceValue));

    const tripEnergyNeed = miles / miPerKwh;
    const startEnergy = battery * start;
    const reserveEnergy = battery * reserve;

    // Energy that must be purchased on route to complete trip with arrival reserve.
    const enRouteEnergyNeed = Math.max(0, tripEnergyNeed + reserveEnergy - startEnergy);

    // Typical energy gained per DC stop under a charge window strategy.
    const perStopEnergy = Math.max(0.1, battery * Math.max(0.02, chargeTo - reserve));
    const chargingStops = enRouteEnergyNeed > 0 ? Math.ceil(enRouteEnergyNeed / perStopEnergy) : 0;

    const preTripHomeEnergy = Math.max(0, startEnergy - reserveEnergy);
    const dcCost = enRouteEnergyNeed * dcPrice;
    const homeCost = preTripHomeEnergy * homePrice;
    const totalEvCost = dcCost + homeCost;

    const dcMinutes = (enRouteEnergyNeed / dcSpeed) * 60;
    const totalChargingMinutes = dcMinutes + chargingStops * overhead;

    const gasTripCost = (miles / mpg) * gas;

    return {
      tripEnergyNeed,
      enRouteEnergyNeed,
      perStopEnergy,
      chargingStops,
      homeCost,
      dcCost,
      totalEvCost,
      totalChargingMinutes,
      gasTripCost,
      savingsVsGas: gasTripCost - totalEvCost,
      estimatedDriveRange: miPerKwh * battery * Math.max(0, chargeTo - reserve),
    };
  }, [
    arrivalSoc,
    avgDcSpeedKw,
    batteryKwhValue,
    chargeToSoc,
    dcRate,
    efficiencyValue,
    gasMpgValue,
    gasPriceValue,
    homeRate,
    tripMilesValue,
    overheadPerStopMin,
    startSoc,
  ]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">EV Trip Charging Cost Planner</h2>
        <p className="mt-2 text-sm text-muted">
          Plan long-distance EV trips with charging-stop estimates, trip charging time, and total cost.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Trip Distance (miles)</span>
            <input
              type="number"
              min={0}
              step="10"
              value={tripMilesValue}
              onChange={(event) => setTripMiles(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Efficiency (mi/kWh)</span>
            <input
              type="number"
              min={1}
              step="0.1"
              value={efficiencyValue}
              onChange={(event) => setEfficiency(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Battery (kWh)</span>
            <input
              type="number"
              min={10}
              step="0.1"
              value={batteryKwhValue}
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
            <span className="text-sm font-semibold text-foreground">Arrival Buffer SoC (%)</span>
            <input
              type="number"
              min={0}
              max={60}
              step="1"
              value={arrivalSoc}
              onChange={(event) => setArrivalSoc(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Charge Up To SoC (%)</span>
            <input
              type="number"
              min={40}
              max={100}
              step="1"
              value={chargeToSoc}
              onChange={(event) => setChargeToSoc(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">DC Fast Rate ($/kWh)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={dcRate}
              onChange={(event) => setDcRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Home Rate ($/kWh)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={homeRate}
              onChange={(event) => setHomeRate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Avg DC Speed (kW)</span>
            <input
              type="number"
              min={10}
              step="5"
              value={avgDcSpeedKw}
              onChange={(event) => setAvgDcSpeedKw(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Stop Overhead (min/stop)</span>
            <input
              type="number"
              min={0}
              step="1"
              value={overheadPerStopMin}
              onChange={(event) => setOverheadPerStopMin(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Gas Price ($/gal)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={gasPriceValue}
              onChange={(event) => setGasPrice(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Gas MPG</span>
            <input
              type="number"
              min={1}
              step="0.5"
              value={gasMpgValue}
              onChange={(event) => setGasMpg(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estimated Charging Stops</p>
          <p className="mt-2 text-3xl font-bold text-brand">{calc.chargingStops}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">En-Route Charge Needed</p>
          <p className="mt-2 text-3xl font-bold">{calc.enRouteEnergyNeed.toFixed(1)} kWh</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total EV Trip Cost</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.totalEvCost)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trip Charging Time</p>
          <p className="mt-2 text-2xl font-bold">
            {Math.round(calc.totalChargingMinutes)} min
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Gas Trip Cost</p>
          <p className="mt-2 text-2xl font-bold">{money(calc.gasTripCost)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Savings vs Gas</p>
          <p className={`mt-2 text-2xl font-bold ${calc.savingsVsGas >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.savingsVsGas)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Range per Typical Stop Window</p>
          <p className="mt-2 text-2xl font-bold">{Math.round(calc.estimatedDriveRange)} miles</p>
        </article>
      </div>
    </section>
  );
}
