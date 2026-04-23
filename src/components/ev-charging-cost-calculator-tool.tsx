"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { US_STATE_ELECTRICITY_RATES } from "@/lib/us-state-electricity-rates";

type EvPreset = { id: string; label: string; miPerKwh: number; batteryKwh: number };
type PublicRatePreset = { id: string; label: string; rate: number };

const EV_PRESETS: EvPreset[] = [
  { id: "custom", label: "Custom Vehicle", miPerKwh: 3.5, batteryKwh: 75 },
  { id: "tesla-model-3-rwd", label: "Tesla Model 3 RWD", miPerKwh: 4.2, batteryKwh: 60 },
  { id: "tesla-model-y-lr", label: "Tesla Model Y Long Range", miPerKwh: 3.6, batteryKwh: 82 },
  { id: "hyundai-ioniq-5", label: "Hyundai IONIQ 5", miPerKwh: 3.3, batteryKwh: 77 },
  { id: "kia-ev6", label: "Kia EV6", miPerKwh: 3.2, batteryKwh: 77.4 },
  { id: "ford-mustang-mach-e", label: "Ford Mustang Mach-E", miPerKwh: 3.0, batteryKwh: 91 },
  { id: "chevy-equinox-ev", label: "Chevrolet Equinox EV", miPerKwh: 3.4, batteryKwh: 85 },
  { id: "chevy-bolt-ev", label: "Chevrolet Bolt EV", miPerKwh: 3.9, batteryKwh: 66 },
  { id: "rivian-r1s", label: "Rivian R1S", miPerKwh: 2.3, batteryKwh: 135 },
  { id: "vw-id4", label: "Volkswagen ID.4", miPerKwh: 3.1, batteryKwh: 82 },
  { id: "nissan-ariya", label: "Nissan Ariya", miPerKwh: 3.0, batteryKwh: 87 },
];

const PUBLIC_RATE_PRESETS: PublicRatePreset[] = [
  { id: "custom", label: "Custom Public Rate", rate: 0.4 },
  { id: "tesla-supercharger", label: "Tesla Supercharger (avg)", rate: 0.32 },
  { id: "electrify-america", label: "Electrify America (avg)", rate: 0.48 },
  { id: "evgo", label: "EVgo (avg)", rate: 0.45 },
  { id: "chargepoint-fast", label: "ChargePoint DC Fast (avg)", rate: 0.4 },
];

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

function formatRate(rate: number): string {
  return `${rate.toFixed(3)} $/kWh (${(rate * 100).toFixed(1)}¢/kWh)`;
}

export function EvChargingCostCalculatorTool() {
  const [stateCode, setStateCode] = useState("CA");
  const [vehiclePreset, setVehiclePreset] = useState("custom");
  const [batteryKwh, setBatteryKwh] = useState("75");
  const [monthlyMiles, setMonthlyMiles] = useState("1000");
  const [efficiency, setEfficiency] = useState("3.5");
  const [homeShare, setHomeShare] = useState("80");
  const [publicPreset, setPublicPreset] = useState("custom");
  const [publicRate, setPublicRate] = useState("0.40");
  const [offPeakShare, setOffPeakShare] = useState("60");
  const [offPeakDiscount, setOffPeakDiscount] = useState("20");
  const [includeHomeChargerCost, setIncludeHomeChargerCost] = useState(false);
  const [homeChargerCost, setHomeChargerCost] = useState("1200");
  const [amortMonths, setAmortMonths] = useState("48");
  const [gasPrice, setGasPrice] = useState("3.70");
  const [gasMpg, setGasMpg] = useState("28");
  const [apiKey, setApiKey] = useState("");
  const [stateRates, setStateRates] = useState(US_STATE_ELECTRICITY_RATES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState("Using built-in state average rates");
  const [error, setError] = useState("");
  const tripPlannerHref = {
    pathname: "/tools/ev-trip-charging-cost-planner",
    query: {
      efficiency,
      batteryKwh,
      gasPrice,
      gasMpg,
    },
  };

  const selectedRate = stateRates.find((item) => item.code === stateCode)?.rate ?? 0.16;
  const selectedPreset = EV_PRESETS.find((item) => item.id === vehiclePreset) ?? EV_PRESETS[0];

  const calc = useMemo(() => {
    const miles = Math.max(0, parseNum(monthlyMiles));
    const miPerKwh = Math.max(0.1, parseNum(efficiency));
    const battery = Math.max(1, parseNum(batteryKwh));
    const homePct = Math.min(100, Math.max(0, parseNum(homeShare))) / 100;
    const publicPct = 1 - homePct;

    const offPeakPct = Math.min(100, Math.max(0, parseNum(offPeakShare))) / 100;
    const discountPct = Math.min(90, Math.max(0, parseNum(offPeakDiscount))) / 100;

    const homeBaseRate = selectedRate;
    const homeEffectiveRate = homeBaseRate * (1 - offPeakPct * discountPct);
    const publicRateNum = Math.max(0, parseNum(publicRate));

    const totalKwh = miles / miPerKwh;
    const homeKwh = totalKwh * homePct;
    const publicKwh = totalKwh * publicPct;

    const homeCost = homeKwh * homeEffectiveRate;
    const publicCost = publicKwh * publicRateNum;
    const chargerMonthlyCost =
      includeHomeChargerCost
        ? Math.max(0, parseNum(homeChargerCost)) / Math.max(1, parseNum(amortMonths))
        : 0;
    const totalCost = homeCost + publicCost + chargerMonthlyCost;
    const annualCost = totalCost * 12;

    const gasPriceNum = Math.max(0, parseNum(gasPrice));
    const mpg = Math.max(1, parseNum(gasMpg));
    const gasMonthly = (miles / mpg) * gasPriceNum;
    const gasAnnual = gasMonthly * 12;

    return {
      totalKwh,
      battery,
      homeEffectiveRate,
      homeCost,
      publicCost,
      chargerMonthlyCost,
      totalCost,
      annualCost,
      costPerMile: miles > 0 ? totalCost / miles : 0,
      gasMonthly,
      gasAnnual,
      annualSavingsVsGas: gasAnnual - annualCost,
    };
  }, [
    efficiency,
    batteryKwh,
    gasMpg,
    gasPrice,
    homeShare,
    monthlyMiles,
    offPeakDiscount,
    offPeakShare,
    publicRate,
    includeHomeChargerCost,
    homeChargerCost,
    amortMonths,
    selectedRate,
  ]);

  async function syncFromEia() {
    setIsSyncing(true);
    setError("");
    try {
      const params = new URLSearchParams({
        frequency: "monthly",
        "data[0]": "price",
        "facets[sectorid][]": "RES",
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        offset: "0",
        length: "5000",
      });
      if (apiKey.trim()) {
        params.set("api_key", apiKey.trim());
      }

      const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("EIA request failed");
      const json = (await res.json()) as {
        response?: {
          data?: Array<{
            stateid?: string;
            period?: string;
            price?: string | number;
          }>;
        };
      };

      const rows = json.response?.data ?? [];
      if (!rows.length) throw new Error("No EIA rows");

      const latestByState = new Map<string, { price: number; period: string }>();
      for (const row of rows) {
        const code = (row.stateid ?? "").toUpperCase();
        const period = row.period ?? "";
        const price = Number(row.price);
        if (!code || !period || !Number.isFinite(price) || price <= 0) continue;
        if (!latestByState.has(code)) {
          latestByState.set(code, { price: price / 100, period }); // cents/kWh -> $/kWh
        }
      }

      const merged = US_STATE_ELECTRICITY_RATES.map((item) => {
        const hit = latestByState.get(item.code);
        return hit ? { ...item, rate: hit.price } : item;
      });
      setStateRates(merged);

      const latestPeriod = [...latestByState.values()][0]?.period;
      setSyncInfo(
        latestPeriod
          ? `Synced from EIA monthly retail data (${latestPeriod})`
          : "Synced from EIA monthly retail data",
      );
    } catch {
      setError("Could not sync EIA data. Check network/API key and try again.");
    } finally {
      setIsSyncing(false);
    }
  }

  function applyVehiclePreset(id: string) {
    setVehiclePreset(id);
    const preset = EV_PRESETS.find((item) => item.id === id);
    if (!preset || preset.id === "custom") return;
    setEfficiency(String(preset.miPerKwh));
    setBatteryKwh(String(preset.batteryKwh));
  }

  function applyPublicRatePreset(id: string) {
    setPublicPreset(id);
    const preset = PUBLIC_RATE_PRESETS.find((item) => item.id === id);
    if (!preset || preset.id === "custom") return;
    setPublicRate(String(preset.rate));
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">EV Charging Cost Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate monthly and annual EV charging costs with U.S. state rates, charging mix, TOU discount, and gas comparison.
        </p>
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/electricity-rates"
              className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
            >
              View U.S. State Electricity Rates
            </Link>
            <Link
              href={tripPlannerHref}
              className="inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
            >
              Plan Trip Cost
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Vehicle Model</span>
            <select
              value={vehiclePreset}
              onChange={(event) => applyVehiclePreset(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {EV_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">State</span>
            <select
              value={stateCode}
              onChange={(event) => setStateCode(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {stateRates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">State Home Rate ($/kWh)</span>
            <input
              type="text"
              value={selectedRate.toFixed(3)}
              readOnly
              className="h-10 rounded-lg border border-line bg-slate-50 px-2 text-sm font-semibold text-foreground outline-none"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Monthly Miles</span>
            <input
              type="number"
              min={0}
              step="50"
              value={monthlyMiles}
              onChange={(event) => setMonthlyMiles(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">EV Efficiency (mi/kWh)</span>
            <input
              type="number"
              min={1}
              step="0.1"
              value={efficiency}
              onChange={(event) => {
                setVehiclePreset("custom");
                setEfficiency(event.target.value);
              }}
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
              onChange={(event) => {
                setVehiclePreset("custom");
                setBatteryKwh(event.target.value);
              }}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Home Charging Share (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={homeShare}
              onChange={(event) => setHomeShare(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Public Network Preset</span>
            <select
              value={publicPreset}
              onChange={(event) => applyPublicRatePreset(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {PUBLIC_RATE_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Public Charging Rate ($/kWh)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={publicRate}
              onChange={(event) => {
                setPublicPreset("custom");
                setPublicRate(event.target.value);
              }}
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
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Gas Price ($/gallon)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={gasPrice}
              onChange={(event) => setGasPrice(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={includeHomeChargerCost}
              onChange={(event) => setIncludeHomeChargerCost(event.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            Include home charger hardware amortization
          </label>
          {includeHomeChargerCost ? (
            <>
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-foreground">Home Charger Cost ($)</span>
                <input
                  type="number"
                  min={0}
                  step="50"
                  value={homeChargerCost}
                  onChange={(event) => setHomeChargerCost(event.target.value)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-foreground">Amortization (months)</span>
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={amortMonths}
                  onChange={(event) => setAmortMonths(event.target.value)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                />
              </label>
            </>
          ) : null}
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Gas Vehicle MPG</span>
            <input
              type="number"
              min={1}
              step="0.5"
              value={gasMpg}
              onChange={(event) => setGasMpg(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">EIA Rate Sync (Monthly)</p>
          <p className="mt-1 text-xs text-muted">{syncInfo}</p>
          <label className="mt-2 grid gap-1">
            <span className="text-xs font-semibold text-foreground">EIA API Key (optional)</span>
            <input
              type="text"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Optional, improves reliability"
              className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <button
            type="button"
            onClick={() => void syncFromEia()}
            disabled={isSyncing}
            className="mt-2 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {isSyncing ? "Syncing..." : "Refresh From EIA"}
          </button>
          {error ? <p className="mt-2 text-xs font-semibold text-rose-700">{error}</p> : null}
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selected Vehicle</p>
          <p className="mt-2 text-base font-bold">{selectedPreset.label}</p>
          <p className="mt-1 text-xs text-muted">{calc.battery.toFixed(1)} kWh battery</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Home Rate (Selected State)</p>
          <p className="mt-2 text-2xl font-bold">{formatRate(selectedRate)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Home Effective Rate (TOU)</p>
          <p className="mt-2 text-2xl font-bold">{formatRate(calc.homeEffectiveRate)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly EV Charging Cost</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.totalCost)}</p>
        </article>
        {includeHomeChargerCost ? (
          <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Home Charger Monthly Cost</p>
            <p className="mt-2 text-2xl font-bold">{money(calc.chargerMonthlyCost)}</p>
          </article>
        ) : null}
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Annual EV Charging Cost</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.annualCost)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">EV Cost per Mile</p>
          <p className="mt-2 text-2xl font-bold">{money(calc.costPerMile)} /mi</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Annual Savings vs Gas</p>
          <p className={`mt-2 text-2xl font-bold ${calc.annualSavingsVsGas >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.annualSavingsVsGas)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly Energy Use</p>
          <p className="mt-2 text-2xl font-bold">{calc.totalKwh.toFixed(1)} kWh</p>
        </article>
      </div>

      <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold sm:text-xl">How To Use This Calculator</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Select your state to load average home electricity price.</li>
          <li>Pick a vehicle model, or choose Custom and set your own efficiency.</li>
          <li>Enter monthly miles and home charging share (the rest is public charging).</li>
          <li>Choose public charging preset or enter your own $/kWh rate.</li>
          <li>Set off-peak share and discount if you mostly charge at night.</li>
          <li>Optionally include home charger cost amortization for full ownership cost.</li>
          <li>Add gas price and MPG to compare EV vs gasoline annual cost.</li>
        </ol>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-line bg-white p-3 text-sm">
            <p className="font-semibold text-foreground">Quick Example</p>
            <p className="mt-1 text-muted">
              1,000 miles/month, 3.5 mi/kWh, 80% home charging, and $0.40 public rate.
            </p>
            <p className="mt-1 text-muted">
              Use this as a baseline, then adjust one parameter at a time.
            </p>
          </article>
          <article className="rounded-xl border border-line bg-white p-3 text-sm">
            <p className="font-semibold text-foreground">Result Reading Tips</p>
            <p className="mt-1 text-muted">
              Focus on <strong>Annual EV Charging Cost</strong> and <strong>Annual Savings vs Gas</strong>.
            </p>
            <p className="mt-1 text-muted">
              If savings are negative, reduce public charging share or update rates.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
