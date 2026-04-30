"use client";

import { useMemo, useState } from "react";
import type { MatchItem } from "@/lib/types";

type Props = {
  match: MatchItem;
};

type TabKey = "ai" | "index" | "focus" | "upset" | "preview";

type StatusLevel = "low" | "mid" | "high";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "ai", label: "AI方案" },
  { key: "index", label: "指数分析" },
  { key: "focus", label: "焦点情报" },
  { key: "upset", label: "爆冷缝隙" },
  { key: "preview", label: "前瞻分析" },
];

const statusBadge: Record<MatchItem["status"], string> = {
  upcoming: "bg-amber-100 text-amber-700",
  live: "bg-emerald-100 text-emerald-700",
  ended: "bg-zinc-200 text-zinc-700",
};

const statusLabel: Record<MatchItem["status"], string> = {
  upcoming: "待开赛",
  live: "进行中",
  ended: "已结束",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function buildAiScore(match: MatchItem) {
  const base = 58;
  const leagueBoost = match.league.toLowerCase().includes("nba") ? 7 : 4;
  const statusBoost = match.status === "live" ? 5 : match.status === "upcoming" ? 3 : 1;
  return clamp(base + leagueBoost + statusBoost, 55, 82);
}

function confidenceText(score: number) {
  if (score >= 76) {
    return "高";
  }

  if (score >= 66) {
    return "中";
  }

  return "低";
}

function buildRiskLevel(score: number): StatusLevel {
  if (score >= 74) {
    return "low";
  }

  if (score >= 64) {
    return "mid";
  }

  return "high";
}

function riskLabel(level: StatusLevel) {
  if (level === "low") {
    return "低风险";
  }

  if (level === "mid") {
    return "中风险";
  }

  return "高风险";
}

function getCountdownLabel(matchDate: string, startAt: string, status: MatchItem["status"]) {
  if (status === "live") {
    return "比赛进行中";
  }

  if (status === "ended") {
    return "比赛已结束";
  }

  const target = new Date(`${matchDate}T${startAt}:00+08:00`).getTime();
  const now = Date.now();
  const diffSec = Math.floor((target - now) / 1000);

  if (diffSec <= 0) {
    return "即将开始";
  }

  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  return `开始倒计时 ${days}天 ${hours}小时 ${minutes}分钟`;
}

function shortCode(name: string) {
  const letters = name.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (letters.length >= 3) {
    return letters.slice(0, 3);
  }
  return name.slice(0, 3).toUpperCase();
}

function TeamBadge({
  code,
  logoUrl,
  tone,
}: {
  code: string;
  logoUrl?: string;
  tone: "home" | "away";
}) {
  const bg = tone === "home" ? "bg-[#f28b24]" : "bg-[#ef4f5a]";
  const [logoBroken, setLogoBroken] = useState(false);

  if (logoUrl && !logoBroken) {
    return (
      <img
        src={logoUrl}
        alt={code}
        className="mx-auto h-14 w-14 rounded-2xl border border-black/5 bg-white object-contain p-1 shadow-sm"
        onError={() => setLogoBroken(true)}
      />
    );
  }

  return (
    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white ${bg}`}>
      {code}
    </div>
  );
}

export function MatchAnalysisTabs({ match }: Props) {
  const [tab, setTab] = useState<TabKey>("ai");

  const aiScore = useMemo(() => buildAiScore(match), [match]);
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const phase = match.phaseLabel ?? (match.status === "live" ? "进行中" : match.status === "ended" ? "已结束" : "待开赛");
  const countdown = getCountdownLabel(match.matchDate, match.startAt, match.status);

  const homeWin = clamp(Math.round(aiScore - 8), 38, 78);
  const awayWin = clamp(100 - homeWin, 22, 62);
  const drawOrOT = clamp(100 - (homeWin + awayWin), 0, 12);

  const totalIndex = clamp(198 + Math.round((aiScore - 60) * 1.8), 190, 232);
  const handicap = clamp(((aiScore - 60) / 5) * -1, -7, 7).toFixed(1);
  const volatility = clamp(Math.round((80 - aiScore) * 1.4), 8, 45);

  const risk = buildRiskLevel(aiScore);

  const focusItems = [
    {
      title: "战术节奏变化",
      detail: `${match.home} 最近5场节奏提升，转换回合占比上升。`,
      level: "高" as const,
    },
    {
      title: "关键球员负荷",
      detail: `${match.away} 核心轮换出场时间偏高，末节效率可能下滑。`,
      level: "中" as const,
    },
    {
      title: "交锋样本",
      detail: "近3次交锋分差集中在 4-9 分区间，胶着概率较高。",
      level: "中" as const,
    },
    {
      title: "市场一致性",
      detail: "主流市场方向一致，但临场需观察二次拉盘。",
      level: "低" as const,
    },
  ];

  const upsetGaps = [
    { label: "市场热度偏离", value: 62 },
    { label: "阵容突发变动", value: 47 },
    { label: "赛程疲劳影响", value: 58 },
    { label: "盘口回摆异常", value: 52 },
  ];

  const previewBlocks = [
    {
      title: "开局场景",
      detail: "预计前6分钟对抗强度高，节奏偏快，外线试投比例较高。",
    },
    {
      title: "中段场景",
      detail: "第二节轮换将决定分差走向，替补深度是核心变量。",
    },
    {
      title: "收官场景",
      detail: "若分差在 6 分以内，罚球与失误控制将主导结果。",
    },
  ];

  return (
    <div className="space-y-4">
      <section className="panel rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-md sm:p-6">
        <h3 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">
          {match.home} vs {match.away}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{countdown}</p>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-sm font-semibold text-[var(--color-muted)]">GameCompass AI</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <div className="rounded-2xl bg-white p-4 sm:p-5">
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="flex min-w-[260px] flex-1 items-center justify-end gap-3">
              <TeamBadge code={match.homeCode ?? shortCode(match.home)} logoUrl={match.homeLogoUrl} tone="home" />
              <div className="text-left">
                <p className="text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">{homeScore}</p>
                <p className="max-w-[180px] break-words text-base font-semibold leading-tight text-[var(--color-ink)]">{match.home}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">主队</p>
              </div>
            </div>

            <div className="w-[220px] shrink-0 rounded-2xl border border-black/10 bg-zinc-50 px-5 py-4 text-center">
              <p className="text-sm font-semibold text-[var(--color-muted)]">{match.startAt}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{match.matchDate}</p>
              <p className="mt-2 text-xs font-semibold text-[var(--color-brand-strong)]">{phase}</p>
            </div>

            <div className="flex min-w-[260px] flex-1 items-center justify-start gap-3">
              <div className="text-right">
                <p className="text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">{awayScore}</p>
                <p className="max-w-[180px] break-words text-base font-semibold leading-tight text-[var(--color-ink)]">{match.away}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">客队</p>
              </div>
              <TeamBadge code={match.awayCode ?? shortCode(match.away)} logoUrl={match.awayLogoUrl} tone="away" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
          <p>
            联赛：<span className="font-semibold text-[var(--color-ink)]">{match.league}</span>
          </p>
          <p>
            热度：<span className="font-semibold text-[var(--color-ink)]">${(aiScore * 1.73).toFixed(2)}K</span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-semibold ${statusBadge[match.status]}`}>{statusLabel[match.status]}</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">场地：{match.venue}</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">来源：{match.source}</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">原始状态：{match.rawStatus ?? "N/A"}</span>
        </div>
      </section>

      <section className="panel rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur-md sm:p-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-[var(--color-brand)] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "ai" ? (
          <div className="space-y-4">
            <article className="rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">AI推荐方案</p>
                <p className="text-xs text-white/80">置信度：{confidenceText(aiScore)}</p>
              </div>
              <p className="mt-3 brand-font text-5xl font-bold leading-none">{aiScore}.0</p>
              <p className="mt-1 text-sm text-white/85">推荐指数</p>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <span className="rounded-full bg-white/20 px-3 py-1 text-center">胜负：主队不败</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-center">让分：{handicap}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-center">总分：{totalIndex}</span>
              </div>
            </article>

            <article className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">AI胜率分布</p>
              <div className="space-y-2 text-sm text-[var(--color-muted)]">
                <div>
                  <div className="mb-1 flex justify-between"><span>{match.home} 胜率</span><span>{homeWin}%</span></div>
                  <div className="h-2 rounded-full bg-zinc-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${homeWin}%` }} /></div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between"><span>{match.away} 胜率</span><span>{awayWin}%</span></div>
                  <div className="h-2 rounded-full bg-zinc-100"><div className="h-2 rounded-full bg-violet-500" style={{ width: `${awayWin}%` }} /></div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between"><span>加时/平局分歧</span><span>{drawOrOT}%</span></div>
                  <div className="h-2 rounded-full bg-zinc-100"><div className="h-2 rounded-full bg-amber-500" style={{ width: `${drawOrOT}%` }} /></div>
                </div>
              </div>
            </article>
          </div>
        ) : null}

        {tab === "index" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-black/10 bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">让分指数</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{handicap}</p>
              </article>
              <article className="rounded-xl border border-black/10 bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">总分指数</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{totalIndex}</p>
              </article>
              <article className="rounded-xl border border-black/10 bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">波动率</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{volatility}%</p>
              </article>
            </div>

            <article className="overflow-hidden rounded-xl border border-black/10 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-[var(--color-muted)]">
                  <tr>
                    <th className="px-4 py-2 font-medium">时间段</th>
                    <th className="px-4 py-2 font-medium">让分</th>
                    <th className="px-4 py-2 font-medium">总分</th>
                    <th className="px-4 py-2 font-medium">解读</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-black/5">
                    <td className="px-4 py-2">初盘</td>
                    <td className="px-4 py-2">{handicap}</td>
                    <td className="px-4 py-2">{totalIndex - 2}</td>
                    <td className="px-4 py-2 text-[var(--color-muted)]">市场基准定价</td>
                  </tr>
                  <tr className="border-t border-black/5">
                    <td className="px-4 py-2">临场前</td>
                    <td className="px-4 py-2">{handicap}</td>
                    <td className="px-4 py-2">{totalIndex}</td>
                    <td className="px-4 py-2 text-[var(--color-muted)]">热度趋于一致</td>
                  </tr>
                  <tr className="border-t border-black/5">
                    <td className="px-4 py-2">实时</td>
                    <td className="px-4 py-2">{(Number(handicap) - 0.5).toFixed(1)}</td>
                    <td className="px-4 py-2">{totalIndex + 1}</td>
                    <td className="px-4 py-2 text-[var(--color-muted)]">波动可控，谨慎追涨</td>
                  </tr>
                </tbody>
              </table>
            </article>
          </div>
        ) : null}

        {tab === "focus" ? (
          <div className="space-y-3">
            {focusItems.map((item) => (
              <article key={item.title} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.level === "高" ? "bg-red-100 text-red-700" : item.level === "中" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {item.level}
                  </span>
                </div>
                <p className="text-sm leading-7 text-[var(--color-muted)]">{item.detail}</p>
              </article>
            ))}
          </div>
        ) : null}

        {tab === "upset" ? (
          <div className="space-y-4">
            <article className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-[var(--color-ink)]">爆冷风险评级：{riskLabel(risk)}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">建议：{risk === "low" ? "可执行常规仓位" : risk === "mid" ? "控制仓位并等待临场确认" : "降低仓位并增加保护策略"}</p>
            </article>
            <article className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="space-y-3">
                {upsetGaps.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-sm text-[var(--color-muted)]">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className={`h-2 rounded-full ${item.value >= 60 ? "bg-red-500" : item.value >= 45 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        ) : null}

        {tab === "preview" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {previewBlocks.map((block) => (
              <article key={block.title} className="rounded-2xl border border-black/10 bg-white p-4">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{block.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{block.detail}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
