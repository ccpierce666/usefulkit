"use client";

import { useMemo, useState } from "react";

type OptionType = "call" | "put";
type PositionSide = "long" | "short";

type LiveQuote = {
  optionSymbol: string;
  bid: number | null;
  ask: number | null;
  mid: number | null;
  last: number | null;
  volume: number | null;
  openInterest: number | null;
  iv: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  underlyingPrice: number | null;
  updated: number | null;
  dataType: string | null;
};

type ChainContract = {
  optionSymbol: string;
  strike: number | null;
  side: string | null;
  bid: number | null;
  ask: number | null;
  mid: number | null;
  last: number | null;
  iv: number | null;
  delta: number | null;
  openInterest: number | null;
  volume: number | null;
};

type OptionPreset = {
  id: string;
  label: string;
  lookupText: string;
  optionSymbol: string;
  optionType: OptionType;
  side: PositionSide;
};

const OPTION_PRESETS: OptionPreset[] = [
  {
    id: "aapl-call-long",
    label: "AAPL Long Call",
    lookupText: "AAPL 12/20/2027 250 Call",
    optionSymbol: "AAPL271217C00250000",
    optionType: "call",
    side: "long",
  },
  {
    id: "msft-put-long",
    label: "MSFT Long Put",
    lookupText: "MSFT 12/20/2027 300 Put",
    optionSymbol: "MSFT271217P00300000",
    optionType: "put",
    side: "long",
  },
  {
    id: "nvda-call-short",
    label: "NVDA Short Call",
    lookupText: "NVDA 12/20/2027 180 Call",
    optionSymbol: "NVDA271217C00180000",
    optionType: "call",
    side: "short",
  },
  {
    id: "spy-put-short",
    label: "SPY Short Put",
    lookupText: "SPY 12/20/2027 450 Put",
    optionSymbol: "SPY271217P00450000",
    optionType: "put",
    side: "short",
  },
];

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function intrinsicPerShare(optionType: OptionType, strike: number, stockAtExpiry: number): number {
  if (optionType === "call") return Math.max(0, stockAtExpiry - strike);
  return Math.max(0, strike - stockAtExpiry);
}

function plPerShare(
  optionType: OptionType,
  side: PositionSide,
  strike: number,
  premium: number,
  stockAtExpiry: number,
): number {
  const intrinsic = intrinsicPerShare(optionType, strike, stockAtExpiry);
  return side === "long" ? intrinsic - premium : premium - intrinsic;
}

// Fast approximation with max absolute error around 1e-7 in practical ranges.
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax));
  return sign * y;
}

function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function d1d2(s: number, k: number, r: number, sigma: number, t: number): { d1: number; d2: number } {
  const rootT = Math.sqrt(t);
  const d1 = (Math.log(s / k) + (r + 0.5 * sigma * sigma) * t) / (sigma * rootT);
  const d2 = d1 - sigma * rootT;
  return { d1, d2 };
}

function optionPriceBs(optionType: OptionType, s: number, k: number, r: number, sigma: number, t: number): number {
  const { d1, d2 } = d1d2(s, k, r, sigma, t);
  if (optionType === "call") return s * normalCdf(d1) - k * Math.exp(-r * t) * normalCdf(d2);
  return k * Math.exp(-r * t) * normalCdf(-d2) - s * normalCdf(-d1);
}

export function OptionsBreakevenPlCalculatorTool() {
  const [optionType, setOptionType] = useState<OptionType>("call");
  const [side, setSide] = useState<PositionSide>("long");
  const [stockPriceNow, setStockPriceNow] = useState("100");
  const [strike, setStrike] = useState("105");
  const [premium, setPremium] = useState("4.2");
  const [contracts, setContracts] = useState("1");
  const [priceRangePct, setPriceRangePct] = useState("40");
  const [daysToExpiry, setDaysToExpiry] = useState("30");
  const [ivPct, setIvPct] = useState("28");
  const [riskFreePct, setRiskFreePct] = useState("4.5");
  const [lookupText, setLookupText] = useState("AAPL 12/20/2027 250 Call");
  const [liveSymbol, setLiveSymbol] = useState("AAPL271217C00250000");
  const [underlyingTicker, setUnderlyingTicker] = useState("AAPL");
  const [expirations, setExpirations] = useState<string[]>([]);
  const [selectedExpiration, setSelectedExpiration] = useState("");
  const [chainContracts, setChainContracts] = useState<ChainContract[]>([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [chainLoading, setChainLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [liveQuote, setLiveQuote] = useState<LiveQuote | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(OPTION_PRESETS[0]?.id ?? "");

  function applyPreset(presetId: string) {
    const preset = OPTION_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setSelectedPreset(preset.id);
    setLookupText(preset.lookupText);
    setLiveSymbol(preset.optionSymbol);
    setOptionType(preset.optionType);
    setSide(preset.side);
    setQuoteError("");
  }

  function applyQuoteToModel() {
    if (!liveQuote) return;
    if (liveQuote.underlyingPrice && Number.isFinite(liveQuote.underlyingPrice)) {
      setStockPriceNow(String(liveQuote.underlyingPrice));
    }
    const marketPremium = liveQuote.mid ?? liveQuote.last ?? liveQuote.ask ?? liveQuote.bid;
    if (marketPremium !== null && Number.isFinite(marketPremium)) {
      setPremium(String(marketPremium));
    }
    if (liveQuote.iv !== null && Number.isFinite(liveQuote.iv)) {
      setIvPct(String((liveQuote.iv * 100).toFixed(2)));
    }
  }

  async function handleLoadExpirations() {
    setQuoteError("");
    setChainLoading(true);
    setExpirations([]);
    setSelectedExpiration("");
    setChainContracts([]);
    setSelectedContract("");
    try {
      const res = await fetch(
        `/api/options-marketdata?mode=expirations&input=${encodeURIComponent(underlyingTicker.trim().toUpperCase())}`,
      );
      const json = (await res.json()) as { expirations?: string[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load expirations");
      const list = (json.expirations ?? []).filter((item) => typeof item === "string");
      setExpirations(list);
      if (list.length > 0) setSelectedExpiration(list[0]);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Failed to load expirations");
    } finally {
      setChainLoading(false);
    }
  }

  async function handleLoadChain() {
    if (!selectedExpiration) {
      setQuoteError("Please select an expiration date first.");
      return;
    }
    setQuoteError("");
    setChainLoading(true);
    setChainContracts([]);
    setSelectedContract("");
    try {
      const params = new URLSearchParams({
        mode: "chain",
        input: underlyingTicker.trim().toUpperCase(),
        expiration: selectedExpiration,
        side: optionType,
        strikeLimit: "30",
      });
      const res = await fetch(`/api/options-marketdata?${params.toString()}`);
      const json = (await res.json()) as { contracts?: ChainContract[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load option chain");
      const contracts = Array.isArray(json.contracts) ? json.contracts : [];
      setChainContracts(contracts);
      if (contracts.length > 0) {
        setSelectedContract(contracts[0].optionSymbol);
        setLiveSymbol(contracts[0].optionSymbol);
      }
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Failed to load option chain");
    } finally {
      setChainLoading(false);
    }
  }

  function applySelectedContract() {
    if (!selectedContract) return;
    const hit = chainContracts.find((item) => item.optionSymbol === selectedContract);
    if (!hit) return;
    setLiveSymbol(hit.optionSymbol);
    if (hit.strike !== null) setStrike(String(hit.strike));
    if (hit.mid !== null) setPremium(String(hit.mid));
    else if (hit.last !== null) setPremium(String(hit.last));
    else if (hit.ask !== null) setPremium(String(hit.ask));
    if (hit.iv !== null) setIvPct(String((hit.iv * 100).toFixed(2)));
  }

  async function handleLookup() {
    setQuoteError("");
    setQuoteLoading(true);
    try {
      const res = await fetch(
        `/api/options-marketdata?mode=lookup&input=${encodeURIComponent(lookupText.trim())}`,
      );
      const json = (await res.json()) as { optionSymbol?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Lookup failed");
      }
      if (!json.optionSymbol) {
        throw new Error("No option symbol returned");
      }
      setLiveSymbol(json.optionSymbol);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Lookup failed");
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleFetchQuote() {
    setQuoteError("");
    setQuoteLoading(true);
    try {
      const res = await fetch(
        `/api/options-marketdata?mode=quote&input=${encodeURIComponent(liveSymbol.trim())}`,
      );
      const json = (await res.json()) as LiveQuote & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Quote fetch failed");
      }
      setLiveQuote(json);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Quote fetch failed");
      setLiveQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  }

  const calc = useMemo(() => {
    const stockNow = Math.max(0.01, parseNum(stockPriceNow));
    const strikePrice = Math.max(0.01, parseNum(strike));
    const premiumPerShare = Math.max(0, parseNum(premium));
    const qtyContracts = Math.max(1, Math.floor(parseNum(contracts) || 1));
    const multiplier = 100 * qtyContracts;
    const rangePct = clamp(parseNum(priceRangePct), 10, 90);
    const tDays = clamp(parseNum(daysToExpiry), 1, 3650);
    const tYears = tDays / 365;
    const sigma = clamp(parseNum(ivPct) / 100, 0.01, 5);
    const riskFreeRate = clamp(parseNum(riskFreePct) / 100, -0.05, 0.25);

    const breakEven =
      optionType === "call" ? strikePrice + premiumPerShare : strikePrice - premiumPerShare;

    const maxLoss =
      side === "long"
        ? premiumPerShare * multiplier
        : optionType === "call"
          ? Number.POSITIVE_INFINITY
          : Math.max(0, strikePrice - premiumPerShare) * multiplier;

    const maxProfit =
      side === "long"
        ? optionType === "call"
          ? Number.POSITIVE_INFINITY
          : Math.max(0, strikePrice - premiumPerShare) * multiplier
        : premiumPerShare * multiplier;

    const currentPl = plPerShare(optionType, side, strikePrice, premiumPerShare, stockNow) * multiplier;
    const intrinsicNow = intrinsicPerShare(optionType, strikePrice, stockNow);
    const extrinsicNow = Math.max(0, premiumPerShare - intrinsicNow);

    const { d1, d2 } = d1d2(stockNow, strikePrice, riskFreeRate, sigma, tYears);
    const bsPricePerShare = optionPriceBs(optionType, stockNow, strikePrice, riskFreeRate, sigma, tYears);
    const theoValuePosition = bsPricePerShare * multiplier;
    const marketValuePosition = premiumPerShare * multiplier;
    const edgeVsTheo = (premiumPerShare - bsPricePerShare) * multiplier;

    const deltaAbs = optionType === "call" ? normalCdf(d1) : normalCdf(d1) - 1;
    const gammaAbs = normalPdf(d1) / (stockNow * sigma * Math.sqrt(tYears));
    const vegaAbs = stockNow * normalPdf(d1) * Math.sqrt(tYears);
    const thetaYear =
      optionType === "call"
        ? -(stockNow * normalPdf(d1) * sigma) / (2 * Math.sqrt(tYears)) -
          riskFreeRate * strikePrice * Math.exp(-riskFreeRate * tYears) * normalCdf(d2)
        : -(stockNow * normalPdf(d1) * sigma) / (2 * Math.sqrt(tYears)) +
          riskFreeRate * strikePrice * Math.exp(-riskFreeRate * tYears) * normalCdf(-d2);
    const rhoAbs =
      optionType === "call"
        ? strikePrice * tYears * Math.exp(-riskFreeRate * tYears) * normalCdf(d2)
        : -strikePrice * tYears * Math.exp(-riskFreeRate * tYears) * normalCdf(-d2);

    const sideSign = side === "long" ? 1 : -1;
    const delta = deltaAbs * sideSign * multiplier;
    const gamma = gammaAbs * sideSign * multiplier;
    const vega = vegaAbs * sideSign * multiplier;
    const thetaPerDay = (thetaYear / 365) * sideSign * multiplier;
    const rho = rhoAbs * sideSign * multiplier;

    const probItm = optionType === "call" ? normalCdf(d2) : normalCdf(-d2);

    // Simple risk-neutral lognormal probability at expiration.
    const mu = (riskFreeRate - 0.5 * sigma * sigma) * tYears;
    const sd = sigma * Math.sqrt(tYears);
    const threshold = Math.max(0.0001, breakEven);
    const z = (Math.log(threshold / stockNow) - mu) / sd;
    const probProfitLong = optionType === "call" ? 1 - normalCdf(z) : normalCdf(z);
    const probProfit = side === "long" ? probProfitLong : 1 - probProfitLong;

    const expectedMovePct = sigma * Math.sqrt(tYears);
    const oneSigmaDown = stockNow * Math.exp(-expectedMovePct);
    const oneSigmaUp = stockNow * Math.exp(expectedMovePct);

    const lower = Math.max(0, stockNow * (1 - rangePct / 100));
    const upper = stockNow * (1 + rangePct / 100);
    const steps = 20;
    const rows = Array.from({ length: steps + 1 }, (_, idx) => {
      const s = lower + ((upper - lower) * idx) / steps;
      const totalPl = plPerShare(optionType, side, strikePrice, premiumPerShare, s) * multiplier;
      return { stockPrice: s, totalPl };
    });

    return {
      stockNow,
      strikePrice,
      premiumPerShare,
      qtyContracts,
      multiplier,
      breakEven,
      maxLoss,
      maxProfit,
      currentPl,
      rows,
      premiumCashFlow: side === "long" ? -premiumPerShare * multiplier : premiumPerShare * multiplier,
      tDays,
      sigma,
      riskFreeRate,
      bsPricePerShare,
      theoValuePosition,
      marketValuePosition,
      edgeVsTheo,
      intrinsicNow,
      extrinsicNow,
      delta,
      gamma,
      vega,
      thetaPerDay,
      rho,
      probItm,
      probProfit,
      oneSigmaDown,
      oneSigmaUp,
    };
  }, [contracts, daysToExpiry, ivPct, optionType, premium, priceRangePct, riskFreePct, side, stockPriceNow, strike]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Options Breakeven, Greeks &amp; P/L Calculator</h2>
        <p className="mt-2 text-sm text-muted">
          Advanced single-leg options analysis for call/put and long/short positions: expiration P/L,
          theoretical value, Greeks, and probability metrics.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Option Type</span>
            <select
              value={optionType}
              onChange={(event) => setOptionType(event.target.value as OptionType)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Position Side</span>
            <select
              value={side}
              onChange={(event) => setSide(event.target.value as PositionSide)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="long">Long (Buy)</option>
              <option value="short">Short (Sell)</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Underlying Price Now ($)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={stockPriceNow}
              onChange={(event) => setStockPriceNow(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Strike Price ($)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={strike}
              onChange={(event) => setStrike(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Premium (per share, $)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={premium}
              onChange={(event) => setPremium(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Contracts</span>
            <input
              type="number"
              min={1}
              step="1"
              value={contracts}
              onChange={(event) => setContracts(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Days to Expiration</span>
            <input
              type="number"
              min={1}
              max={3650}
              step="1"
              value={daysToExpiry}
              onChange={(event) => setDaysToExpiry(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Implied Volatility (%)</span>
            <input
              type="number"
              min={1}
              max={500}
              step="0.1"
              value={ivPct}
              onChange={(event) => setIvPct(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Risk-Free Rate (%)</span>
            <input
              type="number"
              min={-5}
              max={25}
              step="0.1"
              value={riskFreePct}
              onChange={(event) => setRiskFreePct(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Price Table Range (+/- %)</span>
            <input
              type="number"
              min={10}
              max={90}
              step="5"
              value={priceRangePct}
              onChange={(event) => setPriceRangePct(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-white p-3 sm:p-4">
          <p className="text-sm font-semibold text-foreground">Live Option Quote (MarketData.app)</p>
          <p className="mt-1 text-xs text-muted">
            You can lookup an OCC symbol from plain text, then fetch delayed or real-time quote data
            based on your MarketData entitlement.
          </p>
          <div className="mt-3 grid gap-2 rounded-xl border border-line bg-surface p-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-foreground">1) Stock Ticker</span>
              <input
                type="text"
                value={underlyingTicker}
                onChange={(event) => setUnderlyingTicker(event.target.value.toUpperCase())}
                placeholder="AAPL"
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-foreground">2) Call / Put</span>
              <select
                value={optionType}
                onChange={(event) => setOptionType(event.target.value as OptionType)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </label>
            <div className="grid gap-1 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid gap-1">
                <span className="text-xs font-semibold text-foreground">3) Expiration Date</span>
                <select
                  value={selectedExpiration}
                  onChange={(event) => setSelectedExpiration(event.target.value)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                >
                  <option value="">Choose expiration date</option>
                  {expirations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleLoadExpirations}
                disabled={chainLoading || !underlyingTicker.trim()}
                className="h-10 self-end rounded-lg border border-line px-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                {chainLoading ? "Loading..." : "Load Dates"}
              </button>
            </div>
            <div className="grid gap-1 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid gap-1">
                <span className="text-xs font-semibold text-foreground">4) Contract (Strike)</span>
                <select
                  value={selectedContract}
                  onChange={(event) => setSelectedContract(event.target.value)}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
                >
                  <option value="">Choose contract</option>
                  {chainContracts.map((item) => (
                    <option key={item.optionSymbol} value={item.optionSymbol}>
                      {`${item.strike ?? "-"} | bid ${item.bid ?? "-"} ask ${item.ask ?? "-"} | OI ${item.openInterest ?? "-"}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleLoadChain}
                  disabled={chainLoading || !selectedExpiration}
                  className="h-10 rounded-lg border border-line px-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {chainLoading ? "Loading..." : "Load Chain"}
                </button>
                <button
                  type="button"
                  onClick={applySelectedContract}
                  disabled={!selectedContract}
                  className="h-10 rounded-lg bg-brand px-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Use Contract
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <select
              value={selectedPreset}
              onChange={(event) => setSelectedPreset(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {OPTION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => applyPreset(selectedPreset)}
              className="h-10 rounded-lg border border-line px-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              Apply Example
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="text"
              value={lookupText}
              onChange={(event) => setLookupText(event.target.value)}
              placeholder="AAPL 12/20/2027 250 Call"
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={quoteLoading || !lookupText.trim()}
              className="h-10 rounded-lg border border-line px-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              Lookup Symbol
            </button>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="text"
              value={liveSymbol}
              onChange={(event) => setLiveSymbol(event.target.value.toUpperCase())}
              placeholder="AAPL271217C00250000"
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
            <button
              type="button"
              onClick={handleFetchQuote}
              disabled={quoteLoading || !liveSymbol.trim()}
              className="h-10 rounded-lg bg-brand px-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {quoteLoading ? "Loading..." : "Fetch Quote"}
            </button>
          </div>
          {quoteError ? <p className="mt-2 text-xs text-rose-700">{quoteError}</p> : null}
          {liveQuote ? (
            <div className="mt-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={applyQuoteToModel}
                  className="h-8 rounded-lg border border-line px-3 text-xs font-semibold text-foreground transition hover:border-brand hover:text-brand"
                >
                  Use Quote In Calculator
                </button>
              </div>
              <div className="grid gap-2 text-xs text-muted sm:grid-cols-2">
                <p>
                  Symbol: <span className="font-semibold text-foreground">{liveQuote.optionSymbol}</span>
                </p>
                <p>
                  Data Type: <span className="font-semibold text-foreground">{liveQuote.dataType || "-"}</span>
                </p>
                <p>
                  Bid / Ask:{" "}
                  <span className="font-semibold text-foreground">
                    {liveQuote.bid ?? "-"} / {liveQuote.ask ?? "-"}
                  </span>
                </p>
                <p>
                  Last / Mid:{" "}
                  <span className="font-semibold text-foreground">
                    {liveQuote.last ?? "-"} / {liveQuote.mid ?? "-"}
                  </span>
                </p>
                <p>
                  IV / Delta:{" "}
                  <span className="font-semibold text-foreground">
                    {liveQuote.iv ?? "-"} / {liveQuote.delta ?? "-"}
                  </span>
                </p>
                <p>
                  OI / Volume:{" "}
                  <span className="font-semibold text-foreground">
                    {liveQuote.openInterest ?? "-"} / {liveQuote.volume ?? "-"}
                  </span>
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-xs text-muted">
          Educational estimate only. Not investment advice. Real outcomes may differ due to execution,
          liquidity, early assignment, dividends, and model assumptions.
        </p>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Breakeven Price</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.breakEven)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">P/L At Current Price</p>
          <p className={`mt-2 text-3xl font-bold ${calc.currentPl >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {money(calc.currentPl)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Max Profit / Max Loss</p>
          <p className="mt-2 text-sm text-muted">
            Max Profit: <span className="font-semibold text-foreground">{Number.isFinite(calc.maxProfit) ? money(calc.maxProfit) : "Unlimited"}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Max Loss: <span className="font-semibold text-foreground">{Number.isFinite(calc.maxLoss) ? money(calc.maxLoss) : "Unlimited"}</span>
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Probability</p>
          <p className="mt-2 text-sm text-muted">
            ITM at expiry: <span className="font-semibold text-foreground">{pct(calc.probItm)}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Profit at expiry: <span className="font-semibold text-foreground">{pct(calc.probProfit)}</span>
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Expected Move (1 sigma)</p>
          <p className="mt-2 text-sm text-muted">
            Range by {calc.tDays} days: <span className="font-semibold text-foreground">{money(calc.oneSigmaDown)} - {money(calc.oneSigmaUp)}</span>
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Premium &amp; Theoretical</p>
          <p className="mt-2 text-sm text-muted">
            Market premium value: <span className="font-semibold text-foreground">{money(calc.marketValuePosition)}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Theoretical value (BS): <span className="font-semibold text-foreground">{money(calc.theoValuePosition)}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Edge vs theoretical:{" "}
            <span className={`font-semibold ${calc.edgeVsTheo >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{money(calc.edgeVsTheo)}</span>
          </p>
        </article>
      </div>

      <div className="lg:col-span-2 grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold sm:text-xl">Greeks (Position Level)</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <p className="text-muted">Delta: <span className="font-semibold text-foreground">{calc.delta.toFixed(2)}</span></p>
            <p className="text-muted">Gamma: <span className="font-semibold text-foreground">{calc.gamma.toFixed(4)}</span></p>
            <p className="text-muted">Vega (per +1.00 vol): <span className="font-semibold text-foreground">{calc.vega.toFixed(2)}</span></p>
            <p className="text-muted">Theta (per day): <span className="font-semibold text-foreground">{calc.thetaPerDay.toFixed(2)}</span></p>
            <p className="text-muted">Rho (per +1.00 rate): <span className="font-semibold text-foreground">{calc.rho.toFixed(2)}</span></p>
            <p className="text-muted">Intrinsic now: <span className="font-semibold text-foreground">{money(calc.intrinsicNow * calc.multiplier)}</span></p>
            <p className="text-muted">Extrinsic now: <span className="font-semibold text-foreground">{money(calc.extrinsicNow * calc.multiplier)}</span></p>
          </div>
        </article>

        <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold sm:text-xl">Expiration P/L Table</h3>
          <div className="mt-3 max-h-[380px] overflow-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="sticky top-0 border-b border-line bg-surface">
                <tr>
                  <th className="px-3 py-2 font-semibold text-foreground">Underlying at Expiry</th>
                  <th className="px-3 py-2 font-semibold text-foreground">Total P/L</th>
                </tr>
              </thead>
              <tbody>
                {calc.rows.map((row) => (
                  <tr key={row.stockPrice} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2">{money(row.stockPrice)}</td>
                    <td className={`px-3 py-2 font-semibold ${row.totalPl >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {money(row.totalPl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
