"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { MatchItem } from "@/lib/types";

type MatchResponse = {
  success: boolean;
  updatedAt: string;
  summary: {
    total: number;
    live: number;
    upcoming: number;
    ended: number;
    analysisReady: number;
  };
  facets: {
    sports: Array<MatchItem["sport"]>;
    dates: string[];
    leagues: string[];
  };
  items: MatchItem[];
};

const statusMap: Record<MatchItem["status"], { label: string; cls: string }> = {
  upcoming: { label: "未开赛", cls: "bg-blue-100 text-blue-700" },
  live: { label: "进行中", cls: "bg-emerald-100 text-emerald-700" },
  ended: { label: "已结束", cls: "bg-zinc-200 text-zinc-700" },
};

const sportLabel: Record<MatchItem["sport"], string> = {
  basketball: "篮球",
  football: "足球",
};

export function MatchCenterClient() {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [summary, setSummary] = useState<MatchResponse["summary"] | null>(null);
  const [facets, setFacets] = useState<MatchResponse["facets"] | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | MatchItem["status"]>("all");
  const [sportFilter, setSportFilter] = useState<"all" | MatchItem["sport"]>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("status", statusFilter);
        params.set("sport", sportFilter);
        if (dateFilter !== "all") {
          params.set("date", dateFilter);
        }

        const res = await fetch(`/api/matches?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("赛事接口加载失败");
        }

        const data = (await res.json()) as MatchResponse;

        if (active) {
          setItems(data.items);
          setSummary(data.summary);
          setFacets(data.facets);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "未知错误");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [statusFilter, sportFilter, dateFilter]);

  const statCards = useMemo(() => {
    return [
      { label: "场次", value: summary?.total ?? 0 },
      { label: "进行中", value: summary?.live ?? 0 },
      { label: "待分析", value: summary?.analysisReady ?? 0 },
    ];
  }, [summary]);

  return (
    <div className="space-y-4">
      <div className="panel rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md">
        <div className="grid gap-3 sm:grid-cols-3">
          {statCards.map((item) => (
            <article key={item.label} className="rounded-xl border border-black/5 bg-white p-3">
              <p className="text-xs text-[var(--color-muted)]">{item.label}</p>
              <p className="brand-font text-xl font-bold text-[var(--color-ink)]">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-[var(--color-muted)]">
            状态
            <select
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | MatchItem["status"])}
            >
              <option value="all">全部</option>
              <option value="upcoming">未开赛</option>
              <option value="live">进行中</option>
              <option value="ended">已结束</option>
            </select>
          </label>

          <label className="text-sm text-[var(--color-muted)]">
            项目
            <select
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value as "all" | MatchItem["sport"])}
            >
              <option value="all">全部</option>
              <option value="basketball">篮球</option>
              <option value="football">足球</option>
            </select>
          </label>

          <label className="text-sm text-[var(--color-muted)]">
            日期
            <select
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="all">全部</option>
              {facets?.dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="panel rounded-2xl border border-white/60 bg-white/70 p-5 text-sm text-[var(--color-muted)] shadow-sm backdrop-blur-md">
          赛事数据加载中...
        </div>
      ) : null}
      {error ? (
        <div className="panel rounded-2xl border border-white/60 bg-white/70 p-5 text-sm text-red-600 shadow-sm backdrop-blur-md">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="panel rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-strong)]">
                    联赛：{item.league}
                  </span>
                  <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    {sportLabel[item.sport]}
                  </span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMap[item.status].cls}`}>
                  {statusMap[item.status].label}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                {item.home} vs {item.away}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.matchDate} {item.startAt} · {item.venue}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <p className="inline-flex rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-brand-strong)]">
                  {item.focusTag}
                </p>
                <p className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                  来源：{item.source}
                </p>
              </div>

              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{item.trend}</p>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-[var(--color-muted)]">
                  {item.analysisReady ? "已具备分析条件" : "数据抓取中"}
                </p>
                <Link
                  href={`/match-center/${item.id}`}
                  className="rounded-full bg-[var(--color-brand)] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-strong)]"
                >
                  进入AI预测
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="panel rounded-2xl border border-white/60 bg-white/70 p-5 text-sm text-[var(--color-muted)] shadow-sm backdrop-blur-md">
          当前筛选条件下没有可展示赛事。
        </div>
      ) : null}
    </div>
  );
}
