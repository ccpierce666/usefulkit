import { NextRequest, NextResponse } from "next/server";

type MarketDataQuoteResponse = {
  s?: string;
  errmsg?: string;
  optionSymbol?: string[] | string;
  bid?: number[];
  ask?: number[];
  mid?: number[];
  last?: number[];
  volume?: number[];
  openInterest?: number[];
  underlyingPrice?: number[];
  iv?: number[];
  delta?: number[];
  gamma?: number[];
  theta?: number[];
  vega?: number[];
  updated?: number[];
  expiration?: number[] | string[];
  strike?: number[];
  side?: string[];
  dte?: number[];
};

type MarketDataLookupResponse = {
  s?: string;
  errmsg?: string;
  optionSymbol?: string;
};

function firstNum(arr?: number[]): number | null {
  if (!arr || arr.length === 0) return null;
  const v = arr[0];
  return Number.isFinite(v) ? v : null;
}

function firstString(value?: string[] | string): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.length > 0 ? value[0] : null;
}

export async function GET(request: NextRequest) {
  const token = process.env.MARKETDATA_API_TOKEN || process.env.MARKETDATA_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing MARKETDATA_API_TOKEN (or MARKETDATA_TOKEN) on server." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const input = searchParams.get("input")?.trim();
  const expiration = searchParams.get("expiration")?.trim();
  const side = searchParams.get("side")?.trim().toLowerCase();
  const strikeLimit = searchParams.get("strikeLimit")?.trim();

  if (!mode || !input) {
    return NextResponse.json({ error: "mode and input are required." }, { status: 400 });
  }

  const isLookup = mode === "lookup";
  const isQuote = mode === "quote";
  const isExpirations = mode === "expirations";
  const isChain = mode === "chain";
  if (!isLookup && !isQuote && !isExpirations && !isChain) {
    return NextResponse.json(
      { error: "mode must be lookup, quote, expirations, or chain." },
      { status: 400 },
    );
  }

  let endpoint = "";
  if (isLookup) {
    endpoint = `https://api.marketdata.app/v1/options/lookup/${encodeURIComponent(input)}/`;
  } else if (isQuote) {
    endpoint = `https://api.marketdata.app/v1/options/quotes/${encodeURIComponent(input.toUpperCase())}/`;
  } else if (isExpirations) {
    endpoint = `https://api.marketdata.app/v1/options/expirations/${encodeURIComponent(input.toUpperCase())}/`;
  } else {
    const qs = new URLSearchParams();
    if (expiration) qs.set("expiration", expiration);
    if (side === "call" || side === "put") qs.set("side", side);
    qs.set("strikeLimit", strikeLimit && /^\d+$/.test(strikeLimit) ? strikeLimit : "30");
    endpoint = `https://api.marketdata.app/v1/options/chain/${encodeURIComponent(input.toUpperCase())}/?${qs.toString()}`;
  }

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const json = (await res.json()) as MarketDataLookupResponse & MarketDataQuoteResponse;

  if (!res.ok || json.s === "error" || json.s === "no_data") {
    const err = json.errmsg || `MarketData request failed with status ${res.status}.`;
    return NextResponse.json({ error: err }, { status: res.status || 500 });
  }

  if (isLookup) {
    const optionSymbol = firstString(json.optionSymbol);
    if (!optionSymbol) {
      return NextResponse.json({ error: "Lookup returned no option symbol." }, { status: 404 });
    }
    return NextResponse.json({ optionSymbol });
  }

  if (isExpirations) {
    const expirationsRaw = (json as { expirations?: string[] }).expirations ?? [];
    const expirations = expirationsRaw.filter((item) => typeof item === "string");
    return NextResponse.json({ ticker: input.toUpperCase(), expirations });
  }

  if (isChain) {
    const optionSymbols = Array.isArray(json.optionSymbol) ? json.optionSymbol : [];
    const strikes = Array.isArray(json.strike) ? json.strike : [];
    const sides = Array.isArray(json.side) ? json.side : [];
    const bids = Array.isArray(json.bid) ? json.bid : [];
    const asks = Array.isArray(json.ask) ? json.ask : [];
    const mids = Array.isArray(json.mid) ? json.mid : [];
    const lasts = Array.isArray(json.last) ? json.last : [];
    const ivs = Array.isArray(json.iv) ? json.iv : [];
    const deltas = Array.isArray(json.delta) ? json.delta : [];
    const openInterests = Array.isArray(json.openInterest) ? json.openInterest : [];
    const volumes = Array.isArray(json.volume) ? json.volume : [];

    const contracts = optionSymbols.map((symbol, index) => ({
      optionSymbol: symbol,
      strike: Number.isFinite(strikes[index]) ? strikes[index] : null,
      side: typeof sides[index] === "string" ? sides[index] : null,
      bid: Number.isFinite(bids[index]) ? bids[index] : null,
      ask: Number.isFinite(asks[index]) ? asks[index] : null,
      mid: Number.isFinite(mids[index]) ? mids[index] : null,
      last: Number.isFinite(lasts[index]) ? lasts[index] : null,
      iv: Number.isFinite(ivs[index]) ? ivs[index] : null,
      delta: Number.isFinite(deltas[index]) ? deltas[index] : null,
      openInterest: Number.isFinite(openInterests[index]) ? openInterests[index] : null,
      volume: Number.isFinite(volumes[index]) ? volumes[index] : null,
    }));

    return NextResponse.json({
      ticker: input.toUpperCase(),
      expiration: expiration || null,
      side: side || null,
      contracts,
    });
  }

  const optionSymbol = firstString(json.optionSymbol);
  return NextResponse.json({
    optionSymbol: optionSymbol || input.toUpperCase(),
    bid: firstNum(json.bid),
    ask: firstNum(json.ask),
    mid: firstNum(json.mid),
    last: firstNum(json.last),
    volume: firstNum(json.volume),
    openInterest: firstNum(json.openInterest),
    underlyingPrice: firstNum(json.underlyingPrice),
    iv: firstNum(json.iv),
    delta: firstNum(json.delta),
    gamma: firstNum(json.gamma),
    theta: firstNum(json.theta),
    vega: firstNum(json.vega),
    updated: firstNum(json.updated),
    dataType: "marketdata.app",
  });
}
