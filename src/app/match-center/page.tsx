import type { Metadata } from "next";
import { MatchCenterClient } from "@/components/match-center-client";

export const metadata: Metadata = {
  title: "Match Center | UsefulKit",
  description: "MVP match analysis center.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function MatchCenterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Match Center</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">赛事中心</h1>
        <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
          先选择具体赛事，再进入详情页查看 AI 方案、指数分析、焦点情报和前瞻分析。
        </p>
      </header>

      <div className="mt-6 sm:mt-8">
        <MatchCenterClient />
      </div>
    </main>
  );
}
