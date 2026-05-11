"use client";

import { useMemo, useState } from "react";

type BasketRow = {
  symbol: string;
  weightPct: string;
  movePct: string;
};

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function clampMin(value: number, min: number): number {
  return Number.isFinite(value) ? Math.max(min, value) : min;
}

function fmtPct(value: number, digits = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

const START_ROWS: BasketRow[] = [
  { symbol: "Samsung", weightPct: "22", movePct: "-1.4" },
  { symbol: "SK hynix", weightPct: "22", movePct: "0.2" },
  { symbol: "Micron", weightPct: "31", movePct: "0.8" },
  { symbol: "Others", weightPct: "25", movePct: "3" },
];

export function EtfMoveCalculatorTool() {
  const [etfName, setEtfName] = useState("DRAM ETF");
  const [etfTicker, setEtfTicker] = useState("QQQ");
  const [topN, setTopN] = useState("25");
  const [rows, setRows] = useState<BasketRow[]>(START_ROWS);
  const [normalizeWeights, setNormalizeWeights] = useState(false);
  const [sentimentAdjPct, setSentimentAdjPct] = useState("0");
  const [targetEtfMovePct, setTargetEtfMovePct] = useState("");
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [holdingsError, setHoldingsError] = useState("");
  const [holdingsSource, setHoldingsSource] = useState("");

  const calc = useMemo(() => {
    const normalizedRows = rows.map((row) => {
      const weightPct = clampMin(parseNum(row.weightPct), 0);
      const movePct = parseNum(row.movePct);
      const contributionPct = (weightPct / 100) * movePct;
      return {
        symbol: row.symbol.trim() || "N/A",
        weightPct,
        movePct,
        contributionPct,
      };
    });

    const modeledWeightPct = normalizedRows.reduce((sum, row) => sum + row.weightPct, 0);
    const modeledContributionPct = normalizedRows.reduce((sum, row) => sum + row.contributionPct, 0);
    const baseMovePct =
      normalizeWeights && modeledWeightPct > 0
        ? (modeledContributionPct / modeledWeightPct) * 100
        : modeledContributionPct;

    const sentiment = parseNum(sentimentAdjPct);
    const finalMovePct = baseMovePct + sentiment;
    const unmodeledWeightPct = Math.max(0, 100 - modeledWeightPct);

    const hasTarget = targetEtfMovePct.trim().length > 0;
    const target = parseNum(targetEtfMovePct);
    const targetBase = target - sentiment;
    const requiredUnmodeledMovePct =
      hasTarget && unmodeledWeightPct > 0
        ? (targetBase - modeledContributionPct) / (unmodeledWeightPct / 100)
        : null;

    return {
      rows: normalizedRows,
      modeledWeightPct,
      modeledContributionPct,
      baseMovePct,
      sentiment,
      finalMovePct,
      unmodeledWeightPct,
      hasTarget,
      target,
      requiredUnmodeledMovePct,
    };
  }, [rows, normalizeWeights, sentimentAdjPct, targetEtfMovePct]);

  function updateRow(index: number, patch: Partial<BasketRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { symbol: "", weightPct: "0", movePct: "0" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function loadEtfHoldings() {
    const symbol = etfTicker.trim().toUpperCase();
    if (!symbol) {
      setHoldingsError("Please enter an ETF ticker.");
      return;
    }

    setLoadingHoldings(true);
    setHoldingsError("");
    try {
      const res = await fetch(`/api/etf-profile?symbol=${encodeURIComponent(symbol)}`);
      const json = (await res.json()) as {
        error?: string;
        symbol?: string;
        source?: string;
        holdings?: Array<{ symbol: string; weightPct: number }>;
      };

      if (!res.ok) throw new Error(json.error || "Failed to load ETF holdings.");
      const list = Array.isArray(json.holdings) ? json.holdings : [];
      if (list.length === 0) {
        throw new Error(
          `No holdings returned for "${symbol}". Try a valid ETF ticker such as QQQ, SPY, SOXX, SMH, or VTI.`,
        );
      }

      const limit = Math.max(1, Math.min(200, Math.floor(parseNum(topN) || 25)));
      const mappedRows: BasketRow[] = list.slice(0, limit).map((item) => ({
        symbol: item.symbol,
        weightPct: item.weightPct.toFixed(4),
        movePct: "0",
      }));

      setRows(mappedRows);
      setEtfName(json.symbol || symbol);
      setHoldingsSource(json.source || "ETF profile API");
    } catch (error) {
      setHoldingsError(error instanceof Error ? error.message : "Failed to load ETF holdings.");
    } finally {
      setLoadingHoldings(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">ETF Move Recalculator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate how much an ETF should move based on constituent weights and same-day returns.
          You can also backsolve the average move required from unmodeled constituents.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">ETF Name</span>
            <input
              type="text"
              value={etfName}
              onChange={(event) => setEtfName(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              placeholder="DRAM ETF"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">ETF Ticker</span>
            <input
              type="text"
              value={etfTicker}
              onChange={(event) => setEtfTicker(event.target.value.toUpperCase())}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              placeholder="QQQ"
            />
            <span className="text-xs text-muted">
              Example ETF tickers: QQQ, SPY, SOXX, SMH, VTI
            </span>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Load Top N Holdings</span>
            <input
              type="number"
              min={1}
              max={200}
              step="1"
              value={topN}
              onChange={(event) => setTopN(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadEtfHoldings}
              disabled={loadingHoldings}
              className="h-10 rounded-lg bg-brand px-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingHoldings ? "Loading..." : "Load Latest Constituents + Weights"}
            </button>
            {holdingsSource ? <span className="text-xs text-muted">Source: {holdingsSource}</span> : null}
          </div>
          {holdingsError ? <p className="sm:col-span-2 text-xs text-rose-700">{holdingsError}</p> : null}
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Sentiment Adjustment (%)</span>
            <input
              type="number"
              step="0.01"
              value={sentimentAdjPct}
              onChange={(event) => setSentimentAdjPct(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Observed ETF Move (%)</span>
            <input
              type="number"
              step="0.01"
              value={targetEtfMovePct}
              onChange={(event) => setTargetEtfMovePct(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              placeholder="Optional, e.g. 1.44"
            />
          </label>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={normalizeWeights}
            onChange={(event) => setNormalizeWeights(event.target.checked)}
          />
          Normalize weights to 100% for modeled basket only
        </label>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th className="px-3 py-2 font-semibold text-foreground">Constituent</th>
                <th className="px-3 py-2 font-semibold text-foreground">Weight %</th>
                <th className="px-3 py-2 font-semibold text-foreground">Move %</th>
                <th className="px-3 py-2 font-semibold text-foreground">Contribution %</th>
                <th className="px-3 py-2 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rowCalc = calc.rows[index];
                return (
                  <tr key={`${row.symbol}-${index}`} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.symbol}
                        onChange={(event) => updateRow(index, { symbol: event.target.value })}
                        className="h-9 w-36 rounded-md border border-line px-2 text-sm outline-none transition focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.weightPct}
                        onChange={(event) => updateRow(index, { weightPct: event.target.value })}
                        className="h-9 w-28 rounded-md border border-line px-2 text-sm outline-none transition focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.movePct}
                        onChange={(event) => updateRow(index, { movePct: event.target.value })}
                        className="h-9 w-28 rounded-md border border-line px-2 text-sm outline-none transition focus:border-brand"
                      />
                    </td>
                    <td
                      className={`px-3 py-2 font-semibold ${((rowCalc?.contributionPct ?? 0) >= 0 ? "text-emerald-700" : "text-rose-700")}`}
                    >
                      {fmtPct(rowCalc?.contributionPct ?? 0, 3)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={rows.length <= 1}
                        className="h-8 rounded-md border border-line px-2 text-xs font-semibold text-foreground transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="h-9 rounded-lg border border-line px-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            Add Row
          </button>
          <button
            type="button"
            onClick={() => setRows(START_ROWS)}
            className="h-9 rounded-lg border border-line px-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            Reset Example
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Tip: Keep weights close to the ETF provider composition. If you only model part of the
          basket, enable normalized mode or use the backsolve output for the unmodeled portion.
        </p>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">ETF</p>
          <p className="mt-2 text-2xl font-bold">{etfName.trim() || "ETF"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Modeled Basket Move</p>
          <p className={`mt-2 text-3xl font-bold ${calc.baseMovePct >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {fmtPct(calc.baseMovePct)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {normalizeWeights
              ? "Using normalized weights for modeled rows."
              : "Using raw weighted contribution across all rows."}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Final Estimated ETF Move</p>
          <p className={`mt-2 text-3xl font-bold ${calc.finalMovePct >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {fmtPct(calc.finalMovePct)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Includes sentiment adjustment: {fmtPct(calc.sentiment)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Modeled / Unmodeled Weight</p>
          <p className="mt-2 text-sm text-muted">
            Modeled: <span className="font-semibold text-foreground">{calc.modeledWeightPct.toFixed(2)}%</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Unmodeled: <span className="font-semibold text-foreground">{calc.unmodeledWeightPct.toFixed(2)}%</span>
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Required Unmodeled Move (Backsolve)
          </p>
          <p className="mt-2 text-sm text-muted">
            {calc.hasTarget ? (
              calc.requiredUnmodeledMovePct === null ? (
                "No unmodeled weight left. Adjust existing rows to match target."
              ) : (
                <>
                  To reach observed move{" "}
                  <span className="font-semibold text-foreground">{fmtPct(calc.target)}</span>, the
                  unmodeled bucket needs{" "}
                  <span
                    className={`font-semibold ${calc.requiredUnmodeledMovePct >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {fmtPct(calc.requiredUnmodeledMovePct)}
                  </span>
                  .
                </>
              )
            ) : (
              "Enter observed ETF move to backsolve average move for unmodeled constituents."
            )}
          </p>
        </article>
      </div>
    </section>
  );
}
