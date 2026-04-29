"use client";

import { useMemo, useState } from "react";

type PositionInput = {
  symbol: string;
  marketValue: string;
  initMargin: string;
  maintMargin: string;
};

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

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function IbBuyingPowerSimulatorTool() {
  const [netLiq, setNetLiq] = useState("100000");
  const [newTradeInitMargin, setNewTradeInitMargin] = useState("50");
  const [positions, setPositions] = useState<PositionInput[]>([
    { symbol: "A", marketValue: "30000", initMargin: "50", maintMargin: "25" },
    { symbol: "B", marketValue: "20000", initMargin: "50", maintMargin: "25" },
    { symbol: "C", marketValue: "10000", initMargin: "50", maintMargin: "25" },
  ]);

  const calc = useMemo(() => {
    const equity = Math.max(0, parseNum(netLiq));
    const assumedInit = clampPercent(parseNum(newTradeInitMargin)) / 100;

    const rows = positions.map((position) => {
      const value = Math.max(0, parseNum(position.marketValue));
      const initRate = clampPercent(parseNum(position.initMargin)) / 100;
      const maintRate = clampPercent(parseNum(position.maintMargin)) / 100;
      const initRequired = value * initRate;
      const maintRequired = value * maintRate;
      return {
        symbol: position.symbol.trim().toUpperCase() || "-",
        value,
        initRate,
        maintRate,
        initRequired,
        maintRequired,
      };
    });

    const totalMarketValue = rows.reduce((sum, row) => sum + row.value, 0);
    const totalInitRequired = rows.reduce((sum, row) => sum + row.initRequired, 0);
    const totalMaintRequired = rows.reduce((sum, row) => sum + row.maintRequired, 0);

    const initialExcess = equity - totalInitRequired;
    const maintenanceExcess = equity - totalMaintRequired;
    const remainingBuyingPower =
      assumedInit > 0 ? Math.max(0, initialExcess / assumedInit) : 0;

    return {
      equity,
      assumedInit,
      rows,
      totalMarketValue,
      totalInitRequired,
      totalMaintRequired,
      initialExcess,
      maintenanceExcess,
      remainingBuyingPower,
      estimatedPostTradeExposure: totalMarketValue + remainingBuyingPower,
    };
  }, [netLiq, newTradeInitMargin, positions]);

  function updateRow(index: number, patch: Partial<PositionInput>) {
    setPositions((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">IB Buying Power Simulator</h2>
        <p className="mt-2 text-sm text-muted">
          Estimate remaining stock buying power from three existing positions (A/B/C) using a
          simplified Reg-T style initial margin approach.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Net Liquidation Value (USD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={netLiq}
              onChange={(event) => setNetLiq(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">
              New Trade Initial Margin (%)
            </span>
            <input
              type="number"
              min={1}
              max={100}
              step="0.01"
              value={newTradeInitMargin}
              onChange={(event) => setNewTradeInitMargin(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th className="px-3 py-2 font-semibold text-foreground">Stock</th>
                <th className="px-3 py-2 font-semibold text-foreground">Market Value (USD)</th>
                <th className="px-3 py-2 font-semibold text-foreground">Initial Margin %</th>
                <th className="px-3 py-2 font-semibold text-foreground">Maintenance %</th>
                <th className="px-3 py-2 font-semibold text-foreground">Initial Req</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => {
                const rowCalc = calc.rows[index];
                return (
                  <tr key={`${position.symbol}-${index}`} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={position.symbol}
                        maxLength={8}
                        onChange={(event) => updateRow(index, { symbol: event.target.value })}
                        className="h-9 w-20 rounded-md border border-line px-2 text-sm outline-none transition focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={position.marketValue}
                        onChange={(event) => updateRow(index, { marketValue: event.target.value })}
                        className="h-9 w-40 rounded-md border border-line px-2 text-sm outline-none transition focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={position.initMargin}
                        onChange={(event) => updateRow(index, { initMargin: event.target.value })}
                        className="h-9 w-28 rounded-md border border-line px-2 text-sm outline-none transition focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={position.maintMargin}
                        onChange={(event) => updateRow(index, { maintMargin: event.target.value })}
                        className="h-9 w-28 rounded-md border border-line px-2 text-sm outline-none transition focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-foreground">
                      {money(rowCalc?.initRequired ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted">
          Note: This simulator is an educational estimate, not an official IBKR margin or risk
          engine result.
        </p>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Current Exposure</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.totalMarketValue)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Initial Margin Used</p>
          <p className="mt-2 text-3xl font-bold">{money(calc.totalInitRequired)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Initial Excess</p>
          <p className={`mt-2 text-3xl font-bold ${calc.initialExcess >= 0 ? "text-brand" : "text-red-600"}`}>
            {money(calc.initialExcess)}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Remaining Buying Power</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(calc.remainingBuyingPower)}</p>
          <p className="mt-1 text-xs text-muted">
            Based on assumed new-trade initial margin of{" "}
            {(calc.assumedInit * 100).toFixed(2)}%.
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Maintenance Excess</p>
          <p className={`mt-2 text-3xl font-bold ${calc.maintenanceExcess >= 0 ? "text-brand" : "text-red-600"}`}>
            {money(calc.maintenanceExcess)}
          </p>
        </article>
      </div>
    </section>
  );
}

