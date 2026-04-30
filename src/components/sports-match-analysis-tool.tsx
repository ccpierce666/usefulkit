"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { MatchItem } from "@/lib/types";

type MatchResponse = {
  success: boolean;
  items: MatchItem[];
  summary: {
    total: number;
    live: number;
    upcoming: number;
    ended: number;
    analysisReady: number;
  };
  facets: {
    dates: string[];
  };
};

const statusLabel: Record<MatchItem["status"], string> = {
  upcoming: "Upcoming",
  live: "Live",
  ended: "Ended",
};

const sportLabel: Record<MatchItem["sport"], string> = {
  basketball: "Basketball",
  football: "Football",
};

export function SportsMatchAnalysisTool() {
  const [statusFilter, setStatusFilter] = useState<"all" | MatchItem["status"]>("all");
  const [sportFilter, setSportFilter] = useState<"all" | MatchItem["sport"]>("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<MatchItem[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [summary, setSummary] = useState<MatchResponse["summary"] | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          status: statusFilter,
          sport: sportFilter,
        });
        if (dateFilter !== "all") params.set("date", dateFilter);

        const res = await fetch(`/api/matches?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as MatchResponse;
        if (!res.ok || !json.success) throw new Error("Match analysis API failed");
        if (!active) return;
        setItems(json.items ?? []);
        setDates(json.facets?.dates ?? []);
        setSummary(json.summary);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load matches");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [dateFilter, sportFilter, statusFilter]);

  const stats = useMemo(
    () => [
      { label: "Matches", value: summary?.total ?? 0 },
      { label: "Live", value: summary?.live ?? 0 },
      { label: "Analysis Ready", value: summary?.analysisReady ?? 0 },
    ],
    [summary],
  );

  return (
    <section className="mt-8 space-y-4">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Sports Match Analysis Tool</h2>
        <p className="mt-2 text-sm text-muted">
          Filter live and upcoming matches, review quick trend signals, and open full detail analysis.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | MatchItem["status"])}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="ended">Ended</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Sport</span>
            <select
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value as "all" | MatchItem["sport"])}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="all">All</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Date</span>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="all">All</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">Loading match data...</div>
      ) : null}
      {error ? <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
                  {item.league}
                </span>
                <span className="rounded-full border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
                  {statusLabel[item.status]}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {item.home} vs {item.away}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {item.matchDate} {item.startAt} · {sportLabel[item.sport]}
              </p>
              <p className="mt-2 text-sm text-muted">{item.trend}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">{item.analysisReady ? "Analysis Ready" : "Collecting Data"}</span>
                <Link
                  href={`/match-center/${item.id}`}
                  className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  Open Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
