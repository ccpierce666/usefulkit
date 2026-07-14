"use client";

import Image from "next/image";
import { useState } from "react";

type BadgeLookupResponse = {
  badge: {
    id: number;
    name: string;
    rawName: string;
    description: string;
    enabled: boolean;
    iconImageId: number | null;
    iconUrl: string | null;
    created: string;
    updated: string;
    awardingUniverse: {
      id: number;
      name: string;
      rootPlaceId: number;
    } | null;
    badgeUrl: string;
    experienceUrl: string | null;
  };
  stats: {
    awardedCount: number | null;
    pastDayAwardedCount: number | null;
    winRatePercentage: number | null;
  };
};

function formatNumber(value: number | null): string {
  if (value === null) return "-";
  return value.toLocaleString("en-US");
}

function formatPercent(value: number | null): string {
  if (value === null) return "-";
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US");
}

export function RobloxBadgeLookupTool() {
  const [badgeId, setBadgeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BadgeLookupResponse | null>(null);

  async function handleLookup() {
    const value = badgeId.trim();
    if (!value) {
      setError("Please enter a Roblox badge ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/roblox-badge?badgeId=${encodeURIComponent(value)}`);
      const data = (await response.json()) as BadgeLookupResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Badge lookup failed.");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Badge lookup failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Roblox Badge Lookup</h2>
        <p className="mt-2 text-sm text-muted">
          Search public Roblox badge details, icon, awarding experience, awarded count, and win rate by badge ID.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Roblox Badge ID</span>
          <input
            type="number"
            value={badgeId}
            onChange={(event) => setBadgeId(event.target.value)}
            placeholder="e.g. 2124533156"
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleLookup()}
            disabled={isLoading}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Lookup Badge"}
          </button>
          <button
            type="button"
            onClick={() => {
              setBadgeId("");
              setError("");
              setResult(null);
            }}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Reset
          </button>
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lookup Status</p>
        <p className="mt-2 text-base font-semibold text-foreground">
          {isLoading ? "Loading Roblox badge..." : result ? "Badge found" : "Waiting for badge ID"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Use the numeric badge ID from a Roblox badge URL. Public stats depend on Roblox badge endpoint availability.
        </p>
      </article>

      {result ? (
        <div className="grid gap-4 lg:col-span-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-line bg-white">
                {result.badge.iconUrl ? (
                  <Image
                    src={result.badge.iconUrl}
                    alt={`${result.badge.name} badge icon`}
                    width={150}
                    height={150}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">No Icon</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-foreground">{result.badge.name}</p>
                <p className="mt-1 text-xs text-muted">Badge ID: {result.badge.id}</p>
                <p className="mt-1 text-xs text-muted">
                  Enabled: {result.badge.enabled ? "Yes" : "No"} | Icon Image ID:{" "}
                  {result.badge.iconImageId ?? "-"}
                </p>
                <p className="mt-1 text-xs text-muted">Created: {formatDate(result.badge.created)}</p>
                <p className="mt-1 text-xs text-muted">Updated: {formatDate(result.badge.updated)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={result.badge.badgeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                  >
                    Open Badge
                  </a>
                  {result.badge.experienceUrl ? (
                    <a
                      href={result.badge.experienceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                    >
                      Open Experience
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              {result.badge.description || "This badge has no public description."}
            </p>
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Awarded</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.stats.awardedCount)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Past Day</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.stats.pastDayAwardedCount)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Win Rate</p>
              <p className="mt-2 text-2xl font-bold">{formatPercent(result.stats.winRatePercentage)}</p>
            </article>
          </div>

          {result.badge.awardingUniverse ? (
            <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
              <h3 className="text-base font-semibold text-foreground">Awarding Experience</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-white p-3 text-sm">
                  <p className="font-semibold text-foreground">Name</p>
                  <p className="mt-1 text-muted">{result.badge.awardingUniverse.name}</p>
                </div>
                <div className="rounded-2xl border border-line bg-white p-3 text-sm">
                  <p className="font-semibold text-foreground">Universe ID</p>
                  <p className="mt-1 text-muted">{result.badge.awardingUniverse.id}</p>
                </div>
                <div className="rounded-2xl border border-line bg-white p-3 text-sm">
                  <p className="font-semibold text-foreground">Root Place ID</p>
                  <p className="mt-1 text-muted">{result.badge.awardingUniverse.rootPlaceId}</p>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
