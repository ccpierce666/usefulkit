"use client";

import Image from "next/image";
import { useState } from "react";

type GroupLookupResponse = {
  group: {
    id: number;
    name: string;
    description: string;
    owner: {
      userId: number;
      username: string;
      displayName: string;
    } | null;
    memberCount: number;
    isBuildersClubOnly: boolean;
    publicEntryAllowed: boolean;
    hasVerifiedBadge: boolean;
    iconUrl: string | null;
    groupUrl: string;
  };
  roles: Array<{
    id: number;
    name: string;
    rank: number;
    memberCount: number;
  }>;
};

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("en-US");
}

export function RobloxGroupLookupTool() {
  const [groupId, setGroupId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GroupLookupResponse | null>(null);

  async function handleLookup() {
    const value = groupId.trim();
    if (!value) {
      setError("Please enter a Roblox group ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/roblox-group?groupId=${encodeURIComponent(value)}`);
      const data = (await response.json()) as GroupLookupResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Group lookup failed.");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Group lookup failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Roblox Group Lookup</h2>
        <p className="mt-2 text-sm text-muted">
          Search public Roblox group details, owner, member count, icon, and role summary by group ID.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Roblox Group ID</span>
          <input
            type="number"
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            placeholder="e.g. 1200769"
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
            {isLoading ? "Searching..." : "Lookup Group"}
          </button>
          <button
            type="button"
            onClick={() => {
              setGroupId("");
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
          {isLoading ? "Loading Roblox group..." : result ? "Group found" : "Waiting for group ID"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Use the numeric group ID from a Roblox group URL. Public group data can vary by Roblox API availability.
        </p>
      </article>

      {result ? (
        <div className="grid gap-4 lg:col-span-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-line bg-white">
                {result.group.iconUrl ? (
                  <Image
                    src={result.group.iconUrl}
                    alt={`${result.group.name} group icon`}
                    width={420}
                    height={420}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">No Icon</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-foreground">{result.group.name}</p>
                <p className="mt-1 text-xs text-muted">Group ID: {result.group.id}</p>
                <p className="mt-1 text-xs text-muted">
                  Owner:{" "}
                  {result.group.owner
                    ? `${result.group.owner.displayName} (@${result.group.owner.username})`
                    : "No public owner"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Verified Badge: {result.group.hasVerifiedBadge ? "Yes" : "No"} | Public Join:{" "}
                  {result.group.publicEntryAllowed ? "Yes" : "No"}
                </p>
                <a
                  href={result.group.groupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                >
                  Open Roblox Group
                </a>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              {result.group.description || "This group has no public description."}
            </p>
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Members</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.group.memberCount)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Roles Shown</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.roles.length)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Builders Club Only</p>
              <p className="mt-2 text-2xl font-bold">{result.group.isBuildersClubOnly ? "Yes" : "No"}</p>
            </article>
          </div>

          {result.roles.length > 0 ? (
            <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
              <h3 className="text-base font-semibold text-foreground">Top Roles</h3>
              <div className="mt-4 grid gap-2">
                {result.roles.map((role) => (
                  <div
                    key={role.id}
                    className="grid gap-2 rounded-2xl border border-line bg-white p-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <span className="font-semibold text-foreground">{role.name}</span>
                    <span className="text-muted">Rank {role.rank}</span>
                    <span className="text-muted">{formatNumber(role.memberCount)} members</span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
