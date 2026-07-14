"use client";

import { useState } from "react";

type LookupMode = "username" | "userId";

type UserGroupsLookupResponse = {
  user: {
    id: number;
    username: string;
    displayName: string;
    profileUrl: string;
  };
  groups: Array<{
    groupId: number;
    groupName: string;
    memberCount: number;
    hasVerifiedBadge: boolean;
    roleId: number;
    roleName: string;
    rank: number;
    isPrimaryGroup: boolean;
    groupUrl: string;
  }>;
  totalShown: number;
};

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function RobloxUserGroupsLookupTool() {
  const [mode, setMode] = useState<LookupMode>("username");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UserGroupsLookupResponse | null>(null);

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
      const response = await fetch(`/api/roblox-user-groups?${paramKey}=${encodeURIComponent(value)}`);
      const data = (await response.json()) as UserGroupsLookupResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "User groups lookup failed.");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "User groups lookup failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Roblox User Groups Lookup</h2>
        <p className="mt-2 text-sm text-muted">
          Search the public Roblox groups and roles associated with a username or user ID.
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
            {isLoading ? "Searching..." : "Lookup Groups"}
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
          {isLoading ? "Loading user groups..." : result ? "Groups loaded" : "Waiting for input"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Results show public group-role membership returned by Roblox. Private or unavailable data may not appear.
        </p>
      </article>

      {result ? (
        <div className="grid gap-4 lg:col-span-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xl font-semibold text-foreground">{result.user.displayName}</p>
                <p className="text-sm text-muted">@{result.user.username}</p>
                <p className="mt-1 text-xs text-muted">User ID: {result.user.id}</p>
              </div>
              <a
                href={result.user.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
              >
                Open Profile
              </a>
            </div>
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Groups Shown</p>
              <p className="mt-2 text-2xl font-bold">{formatNumber(result.totalShown)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Primary Groups</p>
              <p className="mt-2 text-2xl font-bold">
                {formatNumber(result.groups.filter((group) => group.isPrimaryGroup).length)}
              </p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Verified Groups</p>
              <p className="mt-2 text-2xl font-bold">
                {formatNumber(result.groups.filter((group) => group.hasVerifiedBadge).length)}
              </p>
            </article>
          </div>

          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-base font-semibold text-foreground">Groups and Roles</h3>
            {result.groups.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {result.groups.map((group) => (
                  <div
                    key={`${group.groupId}-${group.roleId}`}
                    className="grid gap-2 rounded-2xl border border-line bg-white p-3 text-sm lg:grid-cols-[1fr_auto_auto_auto] lg:items-center"
                  >
                    <div className="min-w-0">
                      <a
                        href={group.groupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-foreground transition hover:text-brand"
                      >
                        {group.groupName}
                      </a>
                      <p className="mt-1 text-xs text-muted">Group ID: {group.groupId}</p>
                    </div>
                    <span className="text-muted">{group.roleName}</span>
                    <span className="text-muted">Rank {group.rank}</span>
                    <span className="text-muted">{formatNumber(group.memberCount)} members</span>
                    {group.isPrimaryGroup || group.hasVerifiedBadge ? (
                      <div className="flex flex-wrap gap-2 lg:col-span-4">
                        {group.isPrimaryGroup ? (
                          <span className="rounded-full border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                            Primary
                          </span>
                        ) : null}
                        {group.hasVerifiedBadge ? (
                          <span className="rounded-full border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                            Verified
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No public group memberships were returned for this user.</p>
            )}
          </article>
        </div>
      ) : null}
    </section>
  );
}
