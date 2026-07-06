"use client";

import Image from "next/image";
import { useState } from "react";

type LookupMode = "universeId" | "placeId";

type ExperienceLookupResponse = {
  experience: {
    id: number;
    rootPlaceId: number;
    lookupPlaceId: number | null;
    name: string;
    description: string;
    creator: {
      id: number;
      name: string;
      type: string;
      hasVerifiedBadge?: boolean;
    };
    price: number | null;
    playing: number;
    visits: number;
    maxPlayers: number;
    created: string;
    updated: string;
    genre: string;
    favoritedCount: number;
    copyingAllowed: boolean;
    createVipServersAllowed: boolean;
    universeAvatarType: string;
    iconUrl: string | null;
    experienceUrl: string;
  };
};

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("en-US");
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US");
}

export function RobloxExperienceLookupTool() {
  const [mode, setMode] = useState<LookupMode>("universeId");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExperienceLookupResponse | null>(null);

  async function handleLookup() {
    const value = query.trim();
    if (!value) {
      setError(mode === "universeId" ? "Please enter a Roblox universe ID." : "Please enter a Roblox place ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(
        `/api/roblox-experience?mode=${mode}&id=${encodeURIComponent(value)}`,
      );
      const data = (await response.json()) as ExperienceLookupResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Experience lookup failed.");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Experience lookup failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Roblox Game & Experience Lookup</h2>
        <p className="mt-2 text-sm text-muted">
          Search Roblox experience details, creator, player counts, visits, favorites, and icon by universe ID or place ID.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("universeId")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              mode === "universeId"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Universe ID
          </button>
          <button
            type="button"
            onClick={() => setMode("placeId")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              mode === "placeId"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Place ID
          </button>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">
            {mode === "universeId" ? "Roblox Universe ID" : "Roblox Place ID"}
          </span>
          <input
            type="number"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={mode === "universeId" ? "e.g. 994732206" : "e.g. 920587237"}
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
            {isLoading ? "Searching..." : "Lookup Experience"}
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("");
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
          {isLoading ? "Loading Roblox experience..." : result ? "Experience found" : "Waiting for ID"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Universe ID identifies the whole experience. Place ID identifies a playable place and can be resolved to its universe.
        </p>
      </article>

      {result ? (
        <div className="grid gap-4 lg:col-span-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-line bg-white">
                {result.experience.iconUrl ? (
                  <Image
                    src={result.experience.iconUrl}
                    alt={`${result.experience.name} game icon`}
                    width={512}
                    height={512}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">No Icon</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-foreground">{result.experience.name}</p>
                <p className="mt-1 text-xs text-muted">Universe ID: {result.experience.id}</p>
                <p className="mt-1 text-xs text-muted">Root Place ID: {result.experience.rootPlaceId}</p>
                {result.experience.lookupPlaceId ? (
                  <p className="mt-1 text-xs text-muted">Lookup Place ID: {result.experience.lookupPlaceId}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted">
                  Creator: {result.experience.creator.name} ({result.experience.creator.type})
                  {result.experience.creator.hasVerifiedBadge ? " - Verified" : ""}
                </p>
                <a
                  href={result.experience.experienceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                >
                  Open Roblox Experience
                </a>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              {result.experience.description || "This experience has no public description."}
            </p>
          </article>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Playing</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.experience.playing)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Visits</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.experience.visits)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Favorites</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.experience.favoritedCount)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Max Players</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.experience.maxPlayers)}</p>
            </article>
          </div>

          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-base font-semibold text-foreground">Experience Details</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white p-3 text-sm">
                <p className="font-semibold text-foreground">Created</p>
                <p className="mt-1 text-muted">{formatDate(result.experience.created)}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-3 text-sm">
                <p className="font-semibold text-foreground">Updated</p>
                <p className="mt-1 text-muted">{formatDate(result.experience.updated)}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-3 text-sm">
                <p className="font-semibold text-foreground">Genre</p>
                <p className="mt-1 text-muted">{result.experience.genre || "-"}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-3 text-sm">
                <p className="font-semibold text-foreground">VIP Servers</p>
                <p className="mt-1 text-muted">{result.experience.createVipServersAllowed ? "Allowed" : "Not listed"}</p>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
