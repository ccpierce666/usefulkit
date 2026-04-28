"use client";

import Image from "next/image";
import { useState } from "react";

type LookupMode = "username" | "userId";

type LookupResponse = {
  user: {
    id: number;
    username: string;
    displayName: string;
    description: string;
    created: string;
    isBanned: boolean;
    hasVerifiedBadge: boolean;
    avatarUrl: string | null;
    profileUrl: string;
  };
  stats: {
    friendsCount: number | null;
    followersCount: number | null;
    followingsCount: number | null;
  };
};

function formatNumber(value: number | null): string {
  if (value === null) return "-";
  return value.toLocaleString("en-US");
}

export function RobloxPlayerLookupTool() {
  const [mode, setMode] = useState<LookupMode>("username");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);

  async function handleLookup() {
    const value = query.trim();
    if (!value) {
      setError(mode === "username" ? "Please enter a Roblox username." : "Please enter a Roblox user ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const paramKey = mode === "username" ? "username" : "userId";
      const response = await fetch(`/api/roblox-user?${paramKey}=${encodeURIComponent(value)}`);
      const contentType = response.headers.get("content-type") ?? "";
      let data: (LookupResponse & { error?: string }) | null = null;

      if (contentType.includes("application/json")) {
        data = (await response.json()) as LookupResponse & { error?: string };
      } else {
        const raw = await response.text();
        const isHtml = raw.trimStart().startsWith("<!DOCTYPE") || raw.trimStart().startsWith("<html");
        throw new Error(
          isHtml
            ? "API route is not available yet (returned HTML page). Please deploy latest code or run local dev."
            : "Unexpected API response format.",
        );
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Lookup failed.");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Roblox Player Lookup</h2>
        <p className="mt-2 text-sm text-muted">
          Search public Roblox player information by username or user ID.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("username")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              mode === "username"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Username
          </button>
          <button
            type="button"
            onClick={() => setMode("userId")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              mode === "userId"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            User ID
          </button>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">
            {mode === "username" ? "Roblox Username" : "Roblox User ID"}
          </span>
          <input
            type={mode === "username" ? "text" : "number"}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={mode === "username" ? "e.g. Builderman" : "e.g. 156"}
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
            {isLoading ? "Searching..." : "Lookup Player"}
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

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lookup Status</p>
          <p className="mt-2 text-base font-semibold text-foreground">
            {isLoading ? "Loading Roblox data..." : result ? "Profile found" : "Waiting for input"}
          </p>
        </article>
      </div>

      {result ? (
        <div className="lg:col-span-2 grid gap-4">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-line bg-white">
                {result.user.avatarUrl ? (
                  <Image
                    src={result.user.avatarUrl}
                    alt={`${result.user.username} avatar`}
                    width={352}
                    height={352}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">No Avatar</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-foreground">{result.user.displayName}</p>
                <p className="text-sm text-muted">@{result.user.username}</p>
                <p className="mt-1 text-xs text-muted">User ID: {result.user.id}</p>
                <p className="mt-1 text-xs text-muted">
                  Created: {new Date(result.user.created).toLocaleString("en-US")}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Verified Badge: {result.user.hasVerifiedBadge ? "Yes" : "No"} | Banned:{" "}
                  {result.user.isBanned ? "Yes" : "No"}
                </p>
                <a
                  href={result.user.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                >
                  Open Roblox Profile
                </a>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              {result.user.description || "This player has no public profile description."}
            </p>
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Friends</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.stats.friendsCount)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Followers</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.stats.followersCount)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Following</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.stats.followingsCount)}</p>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  );
}
